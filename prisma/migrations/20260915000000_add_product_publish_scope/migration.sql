-- expand/contract方式の「expand」段階。
-- 旧コード(Vercelで稼働中)は published カラムだけを参照しており、
-- このmigrationはそれには一切触れず、新しいカラム/テーブルを追加するだけにする。
-- 新コードのデプロイ・動作確認が終わるまで published は削除しない。
-- 削除(contract)は別migration 20260920000000_drop_product_published で行う。
--
-- 途中で失敗した場合に再実行しても安全なように、各ステップにガードを入れている。

-- CreateEnum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PublishScope') THEN
    CREATE TYPE "PublishScope" AS ENUM ('PRIVATE', 'PUBLIC', 'LIMITED');
  END IF;
END $$;

-- AlterTable: 新カラムを追加し、既存の published からバックフィルする。published自体は残す。
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "publishScope" "PublishScope" NOT NULL DEFAULT 'PUBLIC';

UPDATE "Product" SET "publishScope" = CASE WHEN "published" THEN 'PUBLIC'::"PublishScope" ELSE 'PRIVATE'::"PublishScope" END;

-- CreateTable
CREATE TABLE IF NOT EXISTS "ProductVisibility" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductVisibility_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ProductVisibility_customerId_idx" ON "ProductVisibility"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ProductVisibility_productId_customerId_key" ON "ProductVisibility"("productId", "customerId");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProductVisibility_productId_fkey') THEN
    ALTER TABLE "ProductVisibility" ADD CONSTRAINT "ProductVisibility_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProductVisibility_customerId_fkey') THEN
    ALTER TABLE "ProductVisibility" ADD CONSTRAINT "ProductVisibility_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
