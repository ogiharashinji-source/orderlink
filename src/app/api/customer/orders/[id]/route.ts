import { NextRequest, NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customerAuth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const customer = await getCustomerSession();
  if (!customer) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

  const { id } = await params;
  const orderId = Number(id);

  const order = await prisma.orderRequest.findUnique({ where: { id: orderId } });
  if (!order || order.customerId !== customer.id)
    return NextResponse.json({ error: "注文が見つかりません" }, { status: 404 });
  if (order.status !== "PENDING")
    return NextResponse.json({ error: "確認待ち以外の注文は変更できません" }, { status: 400 });

  const body = await req.json();
  const { items, notes } = body as { items: { id: number; requestedQty: number }[]; notes: string };

  await prisma.$transaction([
    ...items.map((item) =>
      prisma.requestItem.update({
        where: { id: item.id },
        data: { requestedQty: item.requestedQty },
      })
    ),
    prisma.orderRequest.update({
      where: { id: orderId },
      data: { notes: notes ?? null, requestedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const customer = await getCustomerSession();
  if (!customer) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

  const { id } = await params;
  const orderId = Number(id);

  const order = await prisma.orderRequest.findUnique({ where: { id: orderId } });
  if (!order || order.customerId !== customer.id)
    return NextResponse.json({ error: "注文が見つかりません" }, { status: 404 });
  if (order.status !== "PENDING")
    return NextResponse.json({ error: "確認待ち以外の注文は削除できません" }, { status: 400 });

  await prisma.requestItem.deleteMany({ where: { requestId: orderId } });
  await prisma.orderRequest.delete({ where: { id: orderId } });

  return NextResponse.json({ ok: true });
}
