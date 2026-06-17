import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const request = await prisma.orderRequest.findUnique({
    where: { id: Number(id) },
    include: {
      customer: true,
      items: { include: { product: true } },
      order: true,
    },
  });
  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(request);
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
