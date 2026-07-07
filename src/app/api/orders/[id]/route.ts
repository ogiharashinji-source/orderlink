import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: { customer: true, items: { include: { product: true } } },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // adminReply は OrderRequest.requestId 経由で取得
  const orderRequest = order.requestId
    ? await prisma.orderRequest.findUnique({
        where: { id: order.requestId },
        select: { adminReply: true },
      })
    : null;

  return NextResponse.json({ ...order, adminReply: orderRequest?.adminReply ?? null });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { status, notes, deliveryDate } = body;

  const order = await prisma.order.update({
    where: { id: Number(id) },
    data: {
      status,
      notes,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
    },
    include: { customer: true, items: { include: { product: true } } },
  });
  return NextResponse.json(order);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orderId = Number(id);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true, requestId: true },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (order.status === "CANCELLED") {
    // キャンセル済みの場合は物理削除
    await prisma.orderItem.deleteMany({ where: { orderId } });
    await prisma.order.delete({ where: { id: orderId } });
  } else {
    const cancelledAt = new Date();
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED", orderDate: cancelledAt },
    });

    // 同じ OrderRequest に紐づく全 Order がキャンセルされたか確認
    if (order.requestId) {
      const remaining = await prisma.order.findFirst({
        where: {
          requestId: order.requestId,
          id: { not: orderId },
          status: { not: "CANCELLED" },
        },
      });
      if (!remaining) {
        // 全商品キャンセル → OrderRequest にも反映
        await prisma.orderRequest.update({
          where: { id: order.requestId },
          data: { cancelled: true, confirmedAt: cancelledAt },
        });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
