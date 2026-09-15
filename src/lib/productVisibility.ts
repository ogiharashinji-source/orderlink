import { Prisma } from "@/generated/prisma/client";

// ポータル側で顧客に商品を見せてよいかどうかの唯一の判定ロジック。
// 商品データを顧客に返す経路（一覧・検索・OrderLink等）は必ずこれを経由すること。
export function visibleProductWhere(companyId: number, customerId: number): Prisma.ProductWhereInput {
  return {
    companyId,
    deleted: false,
    OR: [
      { publishScope: "PUBLIC" },
      { publishScope: "LIMITED", visibleTo: { some: { customerId } } },
    ],
  };
}

// customerIdが分からない（顧客に紐付かない）場合のフォールバック。全体公開のみ。
export function publicOnlyProductWhere(companyId: number): Prisma.ProductWhereInput {
  return { companyId, deleted: false, publishScope: "PUBLIC" };
}
