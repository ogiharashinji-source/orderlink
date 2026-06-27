import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function genOrderNumber() {
  const now = new Date();
  const prefix = `ORD-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  return `${prefix}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const request = await prisma.orderRequest.findUnique({
    where: { id: Number(id) },
    include: {
      items: { include: { product: true } },
      customer: { select: { name: true, company: true, address: true, phone: true, faxNumber: true, email: true } },
    },
  });
  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (request.status === "CONFIRMED") return NextResponse.json({ error: "すでに確定済みです" }, { status: 400 });

  const { confirmedItems, notes, deliveryDate, adminReply } = await req.json() as {
    confirmedItems: { requestItemId: number; confirmedQty: number; unitPrice: number }[];
    notes?: string;
    deliveryDate?: string;
    adminReply?: string;
  };

  // confirmedQty の保存（0含む全商品）
  await Promise.all(
    confirmedItems.map((i) =>
      prisma.requestItem.update({
        where: { id: i.requestItemId },
        data: { confirmedQty: i.confirmedQty },
      })
    )
  );

  const validItems = confirmedItems.filter((i) => i.confirmedQty > 0);
  const itemMap = Object.fromEntries(request.items.map((i) => [i.id, i]));

  const totalAmount = validItems.reduce((sum, i) => {
    const ri = itemMap[i.requestItemId];
    const lotStr = ri.volume === "1800ml" ? ri.product?.unit1800 : ri.product?.unit720;
    const lot = parseInt(lotStr ?? "1") || 1;
    return sum + i.confirmedQty * lot * i.unitPrice;
  }, 0);

  const order = await prisma.order.create({
    data: {
      orderNumber: genOrderNumber(),
      companyId: request.companyId,
      customerId: request.customerId,
      totalAmount,
      notes: notes || request.notes || null,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
      customerName:    request.customer?.name    ?? null,
      customerCompany: request.customer?.company ?? null,
      customerAddress: request.customer?.address ?? null,
      customerPhone:   request.customer?.phone   ?? null,
      customerFax:     request.customer?.faxNumber ?? null,
      customerEmail:   request.customer?.email   ?? null,
      items: {
        create: confirmedItems.map((i) => {
          const ri = itemMap[i.requestItemId];
          return {
            ...(ri.productId ? { product: { connect: { id: ri.productId } } } : {}),
            productName: ri.productName ?? ri.product?.name ?? null,
            productCategory: ri.productCategory ?? ri.product?.category ?? null,
            productSakaMai: ri.productSakaMai ?? ri.product?.sakaMai ?? null,
            productSeimaiWari: ri.productSeimaiWari ?? ri.product?.seimaiWari ?? null,
            productAlcohol: ri.productAlcohol ?? ri.product?.alcohol ?? null,
            quantity: i.confirmedQty,
            unitPrice: i.unitPrice,
            volume: ri.volume ?? null,
          };
        }),
      },
    },
  });

  await prisma.orderRequest.update({
    where: { id: Number(id) },
    data: { status: "CONFIRMED", confirmedAt: new Date(), orderId: order.id, adminReply: adminReply || null },
  });

  return NextResponse.json({ orderNumber: order.orderNumber, orderId: order.id }, { status: 201 });
}
