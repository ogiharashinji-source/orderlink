import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function genRequestNumber() {
  const now = new Date();
  const prefix = `REQ-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  return `${prefix}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const link = await prisma.orderLink.findUnique({ where: { token } });
  if (!link) return NextResponse.json({ error: "リンクが見つかりません" }, { status: 404 });
  if (link.expiresAt && link.expiresAt < new Date()) return NextResponse.json({ error: "期限切れです" }, { status: 410 });

  const { items, notes } = await req.json() as {
    items: { productId: number; quantity: number; unitPrice: number; volume?: string }[];
    notes?: string;
  };

  const validItems = items.filter((i) => i.quantity > 0);
  if (validItems.length === 0) return NextResponse.json({ error: "数量を1つ以上入力してください" }, { status: 400 });

  const request = await prisma.orderRequest.create({
    data: {
      requestNumber: genRequestNumber(),
      customerId: link.customerId,
      notes: notes || null,
      items: {
        create: validItems.map((i) => ({
          productId: Number(i.productId),
          requestedQty: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
          volume: i.volume ?? null,
        })),
      },
    },
  });

  await prisma.orderLink.update({
    where: { token },
    data: { submittedAt: new Date() },
  });

  return NextResponse.json({ requestNumber: request.requestNumber }, { status: 201 });
}
