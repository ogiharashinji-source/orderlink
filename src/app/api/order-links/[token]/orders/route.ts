import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const link = await prisma.orderLink.findUnique({ where: { token } });
  if (!link) return NextResponse.json({ error: "リンクが見つかりません" }, { status: 404 });

  const requests = await prisma.orderRequest.findMany({
    where: { customerId: link.customerId },
    include: {
      items: { include: { product: true } },
    },
    orderBy: { requestedAt: "desc" },
  });

  return NextResponse.json(requests);
}
