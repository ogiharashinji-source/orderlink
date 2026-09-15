-- 2026-07-07のコミット 6e4c0dc（Order/OrderRequestの1:N化）で、
-- schema.prismaは書き換えられたがmigrationファイルが作られないまま
-- 新カラム(Order.requestId / RequestItem.orderId)だけが手動でDBに追加され、
-- 外部キー制約は付けられず、旧カラム(OrderRequest.orderId)も削除されずに残っていた。
-- このmigrationは、その未完了だった変更を後追いで正規化する。
--
-- 安全性: OrderRequest.orderId は本番調査時点で全行NULL(未使用)であることを確認済み。
-- Order.requestId / RequestItem.orderId はすでに実データが入っており、
-- ここで追加するのは整合性制約のみで、行データの削除・再作成は一切行わない。

-- DropForeignKey
ALTER TABLE "OrderRequest" DROP CONSTRAINT IF EXISTS "OrderRequest_orderId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "OrderRequest_orderId_key";

-- AlterTable: 未使用の旧カラムを削除
ALTER TABLE "OrderRequest" DROP COLUMN IF EXISTS "orderId";

-- 過去にOrderRequestが削除された際、参照していたOrder.requestId/RequestItem.orderIdが
-- 外部キー制約なしに残っていたため、参照先の存在しない値だけをNULLにする。
-- (Order/OrderRequest/RequestItemの行そのものは削除・変更しない。孤立した参照のみ解消)
UPDATE "Order" o SET "requestId" = NULL
WHERE o."requestId" IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM "OrderRequest" r WHERE r.id = o."requestId");

UPDATE "RequestItem" ri SET "orderId" = NULL
WHERE ri."orderId" IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM "Order" o WHERE o.id = ri."orderId");

-- AddForeignKey: 既存データに対して整合性制約を追加
-- (途中で失敗した場合の再実行でも安全なように、IF NOT EXISTS相当のガードを入れる)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'RequestItem_orderId_fkey'
  ) THEN
    ALTER TABLE "RequestItem" ADD CONSTRAINT "RequestItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Order_requestId_fkey'
  ) THEN
    ALTER TABLE "Order" ADD CONSTRAINT "Order_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "OrderRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
