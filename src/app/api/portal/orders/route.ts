import { NextRequest, NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customerAuth";
import { prisma } from "@/lib/prisma";

function genRequestNumber() {
  const now = new Date();
  return `REQ-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
}

export async function POST(req: NextRequest) {
  const customer = await getCustomerSession();
  if (!customer) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

  const { items, notes, companyId: requestedCompanyId } = await req.json() as {
    items: { productId: number; quantity: number; unitPrice: number; volume: string }[];
    notes?: string;
    companyId?: number;
  };

  if (!items || items.length === 0) return NextResponse.json({ error: "商品を選択してください" }, { status: 400 });

  const customerData = await prisma.customer.findUnique({ where: { id: customer.id }, select: { companyId: true } });
  if (!customerData) return NextResponse.json({ error: "顧客情報が見つかりません" }, { status: 404 });

  // 選択会社が本人の所属会社かチェック
  let companyId = customerData.companyId;
  if (requestedCompanyId && requestedCompanyId !== companyId) {
    const membership = await prisma.customerCompany.findUnique({
      where: { customerId_companyId: { customerId: customer.id, companyId: requestedCompanyId } },
    });
    if (membership) companyId = requestedCompanyId;
  }

  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true, category: true, sakaMai: true } });
  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

  const setting = await prisma.adminSetting.findUnique({ where: { companyId }, select: { companyName: true, address: true, phone: true, faxNumber: true, email: true } });

  const request = await prisma.orderRequest.create({
    data: {
      requestNumber: genRequestNumber(),
      companyId,
      customerId: customer.id,
      notes: notes || null,
      sellerName:    setting?.companyName ?? null,
      sellerAddress: setting?.address    ?? null,
      sellerPhone:   setting?.phone      ?? null,
      sellerFax:     setting?.faxNumber  ?? null,
      sellerEmail:   setting?.email      ?? null,
      items: {
        create: items.map((i) => ({
          product: { connect: { id: i.productId } },
          productName: productMap[i.productId]?.name ?? null,
          productCategory: productMap[i.productId]?.category ?? null,
          productSakaMai: productMap[i.productId]?.sakaMai ?? null,
          productSeimaiWari: productMap[i.productId]?.seimaiWari ?? null,
          productAlcohol: productMap[i.productId]?.alcohol ?? null,
          requestedQty: i.quantity,
          unitPrice: i.unitPrice,
          volume: i.volume,
        })),
      },
    },
  });

  return NextResponse.json({ requestNumber: request.requestNumber }, { status: 201 });
}
