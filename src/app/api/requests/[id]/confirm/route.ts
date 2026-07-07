import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nextOrderSequence, datePrefix } from "@/lib/orderSequence";
import { sendOrderConfirmationEmail } from "@/lib/mailer";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const request = await prisma.orderRequest.findUnique({
    where: { id: Number(id) },
    include: {
      items: { include: { product: true } },
      customer: { select: { name: true, company: true, address: true, phone: true, faxNumber: true, email: true } },
      company: { select: { name: true, setting: { select: { companyName: true } } } },
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

  // confirmedQty を全商品に保存（0 含む）
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

  // 商品ごとに 1 Order を作成（Order.requestId で OrderRequest と紐づける）
  const createdOrders: { orderNumber: string; orderId: number }[] = [];

  for (const i of validItems) {
    const ri = itemMap[i.requestItemId];
    const lotStr = ri.volume === "1800ml" ? ri.product?.unit1800 : ri.product?.unit720;
    const lot = parseInt(lotStr ?? "1") || 1;
    const totalAmount = i.confirmedQty * lot * i.unitPrice;
    const orderNumber = `ORD-${datePrefix()}-${await nextOrderSequence()}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        companyId:   request.companyId,
        customerId:  request.customerId,
        requestId:   request.id,
        totalAmount,
        notes:           notes || request.notes || null,
        deliveryDate:    deliveryDate ? new Date(deliveryDate) : null,
        customerName:    request.customer?.name       ?? null,
        customerCompany: request.customer?.company    ?? null,
        customerAddress: request.customer?.address    ?? null,
        customerPhone:   request.customer?.phone      ?? null,
        customerFax:     request.customer?.faxNumber  ?? null,
        customerEmail:   request.customer?.email      ?? null,
        items: {
          create: [{
            ...(ri.productId ? { product: { connect: { id: ri.productId } } } : {}),
            productName:       ri.productName       ?? ri.product?.name       ?? null,
            productCategory:   ri.productCategory   ?? ri.product?.category   ?? null,
            productSakaMai:    ri.productSakaMai    ?? ri.product?.sakaMai    ?? null,
            productSeimaiWari: ri.productSeimaiWari ?? ri.product?.seimaiWari ?? null,
            productAlcohol:    ri.productAlcohol    ?? ri.product?.alcohol    ?? null,
            quantity:  i.confirmedQty,
            unitPrice: i.unitPrice,
            volume:    ri.volume ?? null,
          }],
        },
      },
    });

    // RequestItem に対応 Order を紐づけ
    await prisma.requestItem.update({
      where: { id: i.requestItemId },
      data: { orderId: order.id },
    });

    createdOrders.push({ orderNumber: order.orderNumber, orderId: order.id });
  }

  // OrderRequest を確定済みに更新
  await prisma.orderRequest.update({
    where: { id: Number(id) },
    data: {
      status:      "CONFIRMED",
      confirmedAt: new Date(),
      adminReply:  adminReply || null,
      requestedAt: request.requestedAt,
    },
  });

  // 確定メールをポータル会員に送信
  const customerEmail = request.customer?.email;
  if (customerEmail && createdOrders.length > 0) {
    const emailItems = validItems.map((i) => {
      const ri = itemMap[i.requestItemId];
      return {
        productName: ri.productName ?? ri.product?.name ?? "—",
        category:    ri.productCategory ?? ri.product?.category ?? null,
        sakaMai:     ri.productSakaMai  ?? ri.product?.sakaMai  ?? null,
        volume:      ri.volume ?? null,
        qty:         i.confirmedQty,
      };
    });
    await sendOrderConfirmationEmail({
      to:           customerEmail,
      customerName: request.customer?.name ?? "",
      orderNumber:  createdOrders.map((o) => o.orderNumber).join(", "),
      breweryName:  request.company?.setting?.companyName ?? "",
      items:        emailItems,
      adminReply:   adminReply || null,
    }).catch((e) => console.error("注文確定メール送信エラー:", e));
  }

  return NextResponse.json(
    { orderNumbers: createdOrders.map((o) => o.orderNumber), orderId: createdOrders[0]?.orderId ?? null },
    { status: 201 }
  );
}
