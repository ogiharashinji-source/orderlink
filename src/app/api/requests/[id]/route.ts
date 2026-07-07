import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const request = await prisma.orderRequest.findUnique({
    where: { id: Number(id) },
    include: {
      customer: true,
      items: { include: { product: true } },
      orders: {
        select: { id: true, orderNumber: true, status: true },
        orderBy: { id: "asc" },
      },
    },
  });
  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // admin 画面の既存型（order: { id, orderNumber, status } | null）と互換を保つ
  const { orders, ...rest } = request;
  return NextResponse.json({ ...rest, order: orders[0] ?? null });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status } = await req.json();
  const requestId = Number(id);
  if (status === "REJECTED") {
    await prisma.requestItem.updateMany({
      where: { requestId },
      data: { confirmedQty: 0 },
    });
  }
  const request = await prisma.orderRequest.update({
    where: { id: requestId },
    data: { status },
  });
  return NextResponse.json(request);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.orderRequest.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
