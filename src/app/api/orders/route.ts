import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminCompanyId } from "@/lib/adminAuth";
import { nextOrderSequence, datePrefix } from "@/lib/orderSequence";

export async function GET(req: NextRequest) {
  const companyId = await getAdminCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? "";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";

  let dateFilter = {};
  if (from || to) {
    const range: { gte?: Date; lt?: Date } = {};
    if (from) range.gte = new Date(from);
    if (to) {
      const t = new Date(to);
      t.setDate(t.getDate() + 1);
      range.lt = t;
    }
    dateFilter = { orderDate: range };
  }

  const orders = await prisma.order.findMany({
    where: {
      AND: [
        { companyId },
        dateFilter,
        status ? { status: status as never } : {},
        q ? {
          OR: [
            { orderNumber: { contains: q, mode: "insensitive" } },
            { customerName: { contains: q, mode: "insensitive" } },
            { customer: { name: { contains: q, mode: "insensitive" } } },
            { items: { some: { productName: { contains: q, mode: "insensitive" } } } },
            { items: { some: { product: { name: { contains: q, mode: "insensitive" } } } } },
          ],
        } : {},
      ],
    },
    orderBy: { orderDate: "desc" },
    include: {
      customer: true,
      items: { include: { product: true } },
    },
  });

  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const companyId = await getAdminCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { customerId, items, notes, deliveryDate } = body;

  const totalAmount = items.reduce(
    (sum: number, item: { quantity: number; unitPrice: number }) =>
      sum + item.quantity * item.unitPrice,
    0
  );

  const productIds = items.map((i: { productId: number }) => Number(i.productId));
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, category: true, sakaMai: true, seimaiWari: true, alcohol: true },
  });
  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

  const setting = await prisma.adminSetting.findUnique({
    where: { companyId },
    select: { companyName: true, address: true, phone: true, faxNumber: true, email: true },
  });

  type ItemInput = { productId: number; quantity: number; unitPrice: number; volume?: string };

  const seq = await nextOrderSequence();
  const prefix = datePrefix();

  const order = await prisma.order.create({
    data: {
      orderNumber: `ORD-${prefix}-${seq}`,
      companyId,
      customerId: Number(customerId),
      notes,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
      totalAmount,
      items: {
        create: items.map((item: ItemInput) => ({
          product: { connect: { id: Number(item.productId) } },
          productName: productMap[Number(item.productId)]?.name ?? null,
          productCategory: productMap[Number(item.productId)]?.category ?? null,
          productSakaMai: productMap[Number(item.productId)]?.sakaMai ?? null,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          volume: item.volume ?? null,
        })),
      },
    },
    include: { customer: true, items: { include: { product: true } } },
  });

  // ポータル会員向けにCONFIRMED状態のOrderRequestを同時作成
  if (customerId) {
    await prisma.orderRequest.create({
      data: {
        requestNumber: `REQ-${prefix}-${seq}`,
        companyId,
        customerId: Number(customerId),
        status: "CONFIRMED",
        notes,
        orderId: order.id,
        confirmedAt: new Date(),
        sellerName: setting?.companyName ?? null,
        sellerAddress: setting?.address ?? null,
        sellerPhone: setting?.phone ?? null,
        sellerFax: setting?.faxNumber ?? null,
        sellerEmail: setting?.email ?? null,
        items: {
          create: items.map((item: ItemInput) => ({
            product: { connect: { id: Number(item.productId) } },
            productName: productMap[Number(item.productId)]?.name ?? null,
            productCategory: productMap[Number(item.productId)]?.category ?? null,
            productSakaMai: productMap[Number(item.productId)]?.sakaMai ?? null,
            productSeimaiWari: productMap[Number(item.productId)]?.seimaiWari ?? null,
            productAlcohol: productMap[Number(item.productId)]?.alcohol ?? null,
            requestedQty: Number(item.quantity),
            confirmedQty: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            volume: item.volume ?? null,
          })),
        },
      },
    });
  }

  return NextResponse.json(order, { status: 201 });
}
