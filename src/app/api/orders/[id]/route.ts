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

  // この受注に紐づくOrderRequestを探す
  const orderRequest = await prisma.orderRequest.findFirst({
    where: { orderId },
    select: { id: true },
  });

  if (orderRequest) {
    // OrderLinkがあればrequestIdをnullにしてから削除
    await prisma.orderLink.updateMany({
      where: { requestId: orderRequest.id },
      data: { requestId: null },
    });
    // OrderRequestを削除（RequestItemはCascadeで自動削除）
    await prisma.orderRequest.delete({ where: { id: orderRequest.id } });
  }

  // Orderを削除（OrderItemはCascadeで自動削除）
  await prisma.order.delete({ where: { id: orderId } });
  return NextResponse.json({ ok: true });
}
