import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customerAuth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const customer = await getCustomerSession();
  if (!customer) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

  const requests = await prisma.orderRequest.findMany({
    where: { customerId: customer.id },
    include: {
      customer: { select: { name: true, address: true, phone: true, faxNumber: true, email: true } },
      company:  { select: { setting: { select: { companyName: true, address: true, phone: true, faxNumber: true, email: true } } } },
      items: {
        include: {
          product: true,
          // RequestItem.orderId → Order.status でアイテム単位のキャンセル判定
          order: { select: { status: true } },
        },
      },
    },
    orderBy: { requestedAt: "desc" },
  });

  const data = requests.map((r) => ({
    ...r,
    // r.cancelled: DB フラグ（全商品キャンセル時に cancel API がセット）
    // items の全 Order が CANCELLED の場合もフラグを立てる（後方互換）
    cancelled: r.cancelled || r.items.every((i) => i.order?.status === "CANCELLED"),
  }));

  return NextResponse.json(data);
}
