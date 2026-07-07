import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminCompanyId } from "@/lib/adminAuth";
import { nextOrderSequence, datePrefix } from "@/lib/orderSequence";

export async function GET(req: NextRequest) {
  const companyId = await getAdminCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q      = searchParams.get("q")      ?? "";
  const status = searchParams.get("status") ?? "";
  const from   = searchParams.get("from")   ?? "";
  const to     = searchParams.get("to")     ?? "";

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

  type ItemInput = { productId: number; quantity: number; unitPrice: number; volume?: string };

  const productIds = (items as ItemInput[]).map((i) => Number(i.productId));
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, category: true, sakaMai: true, seimaiWari: true, alcohol: true },
  });
  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

  const setting = await prisma.adminSetting.findUnique({
    where: { companyId },
    select: { companyName: true, address: true, phone: true, faxNumber: true, email: true },
  });

  const prefix   = datePrefix();
  const firstSeq = await nextOrderSequence();

  // ポータル会員向け OrderRequest を先に作成（customerId がある場合のみ）
  let requestId: number | null = null;
  let requestItemIds: number[] = [];

  if (customerId) {
    const orderRequest = await prisma.orderRequest.create({
      data: {
        requestNumber: `REQ-${prefix}-${firstSeq}`,
        companyId,
        customerId:    Number(customerId),
        status:        "CONFIRMED",
        notes,
        confirmedAt:   new Date(),
        sellerName:    setting?.companyName ?? null,
        sellerAddress: setting?.address     ?? null,
        sellerPhone:   setting?.phone       ?? null,
        sellerFax:     setting?.faxNumber   ?? null,
        sellerEmail:   setting?.email       ?? null,
        items: {
          create: (items as ItemInput[]).map((item) => ({
            product:           { connect: { id: Number(item.productId) } },
            productName:       productMap[Number(item.productId)]?.name       ?? null,
            productCategory:   productMap[Number(item.productId)]?.category   ?? null,
            productSakaMai:    productMap[Number(item.productId)]?.sakaMai    ?? null,
            productSeimaiWari: productMap[Number(item.productId)]?.seimaiWari ?? null,
            productAlcohol:    productMap[Number(item.productId)]?.alcohol    ?? null,
            requestedQty: Number(item.quantity),
            confirmedQty: Number(item.quantity),
            unitPrice:    Number(item.unitPrice),
            volume:       item.volume ?? null,
          })),
        },
      },
      include: { items: { select: { id: true } } },
    });
    requestId      = orderRequest.id;
    requestItemIds = orderRequest.items.map((i) => i.id);
  }

  // 商品ごとに 1 Order 作成
  const createdOrders = [];
  for (let idx = 0; idx < (items as ItemInput[]).length; idx++) {
    const item    = (items as ItemInput[])[idx];
    const product = productMap[Number(item.productId)];
    const totalAmount = Number(item.quantity) * Number(item.unitPrice);
    const orderSeq = idx === 0 ? firstSeq : await nextOrderSequence();

    const order = await prisma.order.create({
      data: {
        orderNumber:  `ORD-${prefix}-${orderSeq}`,
        companyId,
        customerId:   customerId ? Number(customerId) : undefined,
        requestId,
        notes,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        totalAmount,
        items: {
          create: [{
            product:         { connect: { id: Number(item.productId) } },
            productName:     product?.name     ?? null,
            productCategory: product?.category ?? null,
            productSakaMai:  product?.sakaMai  ?? null,
            quantity:  Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            volume:    item.volume ?? null,
          }],
        },
      },
      include: { customer: true, items: { include: { product: true } } },
    });

    // RequestItem に orderId をセット
    if (requestItemIds[idx] != null) {
      await prisma.requestItem.update({
        where: { id: requestItemIds[idx] },
        data:  { orderId: order.id },
      });
    }

    createdOrders.push(order);
  }

  return NextResponse.json(createdOrders[0], { status: 201 });
}
