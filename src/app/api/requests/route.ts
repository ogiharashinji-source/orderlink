import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminCompanyId } from "@/lib/adminAuth";
import { nextOrderSequence, datePrefix } from "@/lib/orderSequence";

export async function GET(req: NextRequest) {
  const companyId = await getAdminCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (req.nextUrl.searchParams.get("badge") === "1") {
    const requests = await prisma.orderRequest.findMany({
      where: { companyId },
      select: { id: true, status: true },
    });
    return NextResponse.json(requests);
  }

  const requests = await prisma.orderRequest.findMany({
    where: { companyId },
    orderBy: { requestedAt: "desc" },
    include: {
      customer: true,
      items: { include: { product: true } },
      orders: { select: { orderNumber: true, status: true }, orderBy: { id: "asc" as const }, take: 1 },
    },
  });
  return NextResponse.json(requests);
}

export async function POST(req: NextRequest) {
  const companyId = await getAdminCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { customerId, items, notes } = body;

  type ItemInput = { productId: number; quantity: number; unitPrice: number; volume?: string };

  if (!customerId) return NextResponse.json({ error: "customerId is required" }, { status: 400 });
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "items is required" }, { status: 400 });
  }

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

  const sellerData = {
    sellerName:    setting?.companyName ?? null,
    sellerAddress: setting?.address     ?? null,
    sellerPhone:   setting?.phone       ?? null,
    sellerFax:     setting?.faxNumber   ?? null,
    sellerEmail:   setting?.email       ?? null,
  };

  // 管理者が直接作成するリクエストは、通常のポータル会員からのリクエストと同じく
  // まず PENDING で作成し、リクエスト一覧の「確認」から受注確定する流れに統一する。
  // 複数商品をまとめて1件のリクエストにすると、確認画面でキャンセル/在庫なしにした際に
  // 他の商品まで巻き込まれてしまうため、ポータル側と同様に商品ごとに1件ずつ作成する。
  const createdRequests = [];
  for (const item of items as ItemInput[]) {
    const seq = await nextOrderSequence();
    const orderRequest = await prisma.orderRequest.create({
      data: {
        requestNumber: `REQ-${datePrefix()}-${seq}`,
        companyId,
        customerId: Number(customerId),
        status: "PENDING",
        notes: notes || null,
        ...sellerData,
        items: {
          create: [{
            product:           { connect: { id: Number(item.productId) } },
            productName:       productMap[Number(item.productId)]?.name       ?? null,
            productCategory:   productMap[Number(item.productId)]?.category   ?? null,
            productSakaMai:    productMap[Number(item.productId)]?.sakaMai    ?? null,
            productSeimaiWari: productMap[Number(item.productId)]?.seimaiWari ?? null,
            productAlcohol:    productMap[Number(item.productId)]?.alcohol    ?? null,
            requestedQty: Number(item.quantity),
            unitPrice:    Number(item.unitPrice),
            volume:       item.volume ?? null,
          }],
        },
      },
      include: { items: true },
    });
    createdRequests.push(orderRequest);
  }

  return NextResponse.json(createdRequests, { status: 201 });
}
