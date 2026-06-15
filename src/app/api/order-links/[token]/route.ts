import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const preview = req.nextUrl.searchParams.get("preview") === "1";

  const link = await prisma.orderLink.findUnique({
    where: { token },
    include: { customer: true },
  });

  if (!link) return NextResponse.json({ error: "リンクが見つかりません" }, { status: 404 });

  if (link.expiresAt && link.expiresAt < new Date()) {
    return NextResponse.json({ error: "このリンクは期限切れです" }, { status: 410 });
  }


  const productIds: number[] = JSON.parse(link.productIds);

  const products = await prisma.product.findMany({
    where: productIds.length > 0 ? { id: { in: productIds } } : undefined,
    orderBy: { name: "asc" },
  });

  // Return in the order specified
  const sorted = productIds.length > 0
    ? productIds.map((id) => products.find((p) => p.id === id)).filter(Boolean)
    : products;

  return NextResponse.json({ link, products: sorted });
}
