import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminCompanyId } from "@/lib/adminAuth";

function generateOrderNumber() {
  const now = new Date();
  const prefix = `ORD-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const suffix = String(Math.floor(Math.random() * 9000) + 1000);
  return `${prefix}-${suffix}`;
}

export async function GET(req: NextRequest) {
  const companyId = await getAdminCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? "";
  const month = searchParams.get("month") ?? "";

  let dateFilter = {};
  if (month) {
    const [year, mon] = month.split("-").map(Number);
    const start = new Date(year, mon - 1, 1);
    const end = new Date(year, mon, 1);
    dateFilter = { orderDate: { gte: start, lt: end } };
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
  const products = await prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true, category: true, sakaMai: true } });
  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      companyId,
      customerId: Number(customerId),
      notes,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
      totalAmount,
      items: {
        create: items.map((item: { productId: number; quantity: number; unitPrice: number; volume?: string }) => ({
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

  return NextResponse.json(order, { status: 201 });
}
