import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { visibleProductWhere, publicOnlyProductWhere } from "@/lib/productVisibility";

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

  // productIdsが空でない場合は、管理者がこのリンク専用に選んだ商品として
  // 公開範囲(publishScope)に関わらずそのまま返す(個別の明示的な許可として扱う)。
  // 空の場合(=「全部見せる」設定)は、このリンク先の顧客が本来見られる範囲に絞る。
  const products = await prisma.product.findMany({
    where:
      productIds.length > 0
        ? { id: { in: productIds } }
        : link.customerId
        ? visibleProductWhere(link.companyId, link.customerId)
        : publicOnlyProductWhere(link.companyId),
    orderBy: { name: "asc" },
  });

  // Return in the order specified
  const sorted = productIds.length > 0
    ? productIds.map((id) => products.find((p) => p.id === id)).filter(Boolean)
    : products;

  return NextResponse.json({ link, products: sorted });
}
