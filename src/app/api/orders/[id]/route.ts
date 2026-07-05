import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: { customer: true, items: { include: { product: true } } },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const orderRequest = await prisma.orderRequest.findFirst({
    where: { orderId: Number(id) },
    select: { adminReply: true },
  });
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

  const order = await prisma.order.findUnique({ where: { id: orderId }, select: { status: true } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (order.status === "CANCELLED") {
    // キャンセル済みの場合は物理削除（OrderRequest.cancelled は true のまま残る）
    await prisma.orderItem.deleteMany({ where: { orderId } });
    await prisma.order.delete({ where: { id: orderId } });
  } else {
    // 未キャンセルの場合はCANCELLEDに更新 + OrderRequest.cancelled = true
    await prisma.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } });
    await prisma.orderRequest.updateMany({ where: { orderId }, data: { cancelled: true } });
  }

  return NextResponse.json({ ok: true });
}
