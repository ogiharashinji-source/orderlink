-- ============================================================
-- MIGRATION: Order 1:1→N:1 リストラクチャ
-- 目的:
--   Order.requestId (INT) 追加 ← OrderRequest を指す FK
--   RequestItem.orderId (INT) 追加 ← Order を指す FK
--   Order 138 (ORD-20260707-0023) を 2行に分割
--   OrderRequest.orderId は DROP せず（別作業で対応）
-- ============================================================



-- ============================================================
-- ① 事前確認 SELECT（トランザクション外）
-- ============================================================

-- 現在の Order カラム一覧に requestId が無いこと
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'Order'
ORDER BY ordinal_position;

-- 現在の RequestItem カラム一覧に orderId が無いこと
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'RequestItem'
ORDER BY ordinal_position;

-- 紐づき全体像（変更前）
SELECT
  r.id          AS req_id,
  r."requestNumber",
  r."orderId"   AS req_orderId,
  ri.id         AS ri_id,
  ri."productName",
  ri."requestedQty",
  o.id          AS ord_id,
  o."orderNumber",
  o."totalAmount",
  oi.id         AS oi_id,
  oi."productName" AS oi_product,
  oi.quantity
FROM "OrderRequest" r
LEFT JOIN "RequestItem" ri ON ri."requestId" = r.id
LEFT JOIN "Order"       o  ON o.id = r."orderId"
LEFT JOIN "OrderItem"   oi ON oi."orderId" = o.id
WHERE r."orderId" IS NOT NULL
ORDER BY r.id, ri.id;

-- Counter 現在値
SELECT * FROM "Counter";



-- ============================================================
-- ② マイグレーション本体（トランザクション）
-- ============================================================

BEGIN;

-- ──────────────────────────────────────────
-- Step 1: 新カラム追加
-- ──────────────────────────────────────────
ALTER TABLE "Order"       ADD COLUMN "requestId" INTEGER;
ALTER TABLE "RequestItem" ADD COLUMN "orderId"   INTEGER;
-- RequestItem.orderId は 1:1 のため UNIQUE 制約を付与
CREATE UNIQUE INDEX "RequestItem_orderId_key" ON "RequestItem"("orderId");

-- ──────────────────────────────────────────
-- Step 2: Order.requestId を既存の OrderRequest.orderId から逆引きして設定
-- （OrderRequest.orderId が指している Order.id を取得し、その Order に requestId をセット）
-- ──────────────────────────────────────────
UPDATE "Order" o
SET    "requestId" = r.id
FROM   "OrderRequest" r
WHERE  r."orderId" = o.id;

-- ──────────────────────────────────────────
-- Step 3: RequestItem.orderId を1対1の既存データで設定
--   ri=219 → Order 136 (REQ-0019 / 純米吟醸)
--   ri=220 → Order 137 (REQ-0020 / 山三酒 CANCELLED)
--   ri=221 → Order 134 (REQ-0021 / 純米吟醸)
--   ri=222 → Order 135 (REQ-0022 / 山三酒)
--   ri=223 → Order 138 (REQ-0023 / 山三酒 ← 分割後も 138 に残す)
-- ──────────────────────────────────────────
UPDATE "RequestItem" SET "orderId" = 136 WHERE id = 219;
UPDATE "RequestItem" SET "orderId" = 137 WHERE id = 220;
UPDATE "RequestItem" SET "orderId" = 134 WHERE id = 221;
UPDATE "RequestItem" SET "orderId" = 135 WHERE id = 222;
UPDATE "RequestItem" SET "orderId" = 138 WHERE id = 223;

-- ──────────────────────────────────────────
-- Step 4: Order 138 (ORD-20260707-0023) を分割
--   ・Order 138 は 山三酒 (OrderItem 147) のみ残す → totalAmount=2500
--   ・純米吟醸 (OrderItem 148) 用に新 Order を作成 → ORD-20260707-0024
-- ──────────────────────────────────────────

-- 4a. Order 138 の totalAmount を山三酒 1件分に修正
UPDATE "Order"
SET    "totalAmount" = 2500
WHERE  id = 138;

-- 4b. 純米吟醸用に新 Order を挿入（Order 138 の共通項目をコピー）
INSERT INTO "Order" (
  "orderNumber",
  "companyId", "customerId", "status",
  "totalAmount",
  "notes",
  "customerName", "customerCompany", "customerAddress",
  "customerPhone", "customerFax", "customerEmail",
  "orderDate", "deliveryDate",
  "requestId",
  "createdAt", "updatedAt"
)
SELECT
  'ORD-20260707-0024',
  "companyId", "customerId", "status",
  1200,
  "notes",
  "customerName", "customerCompany", "customerAddress",
  "customerPhone", "customerFax", "customerEmail",
  "orderDate", "deliveryDate",
  192,          -- requestId = OrderRequest 192 (REQ-0023)
  now(), now()
FROM "Order"
WHERE id = 138;

-- 4c. OrderItem 148 (純米吟醸) を新 Order に移動
UPDATE "OrderItem"
SET    "orderId" = (
  SELECT id FROM "Order" WHERE "orderNumber" = 'ORD-20260707-0024'
)
WHERE  id = 148;

-- 4d. RequestItem 224 (純米吟醸) に新 Order を紐づけ
UPDATE "RequestItem"
SET    "orderId" = (
  SELECT id FROM "Order" WHERE "orderNumber" = 'ORD-20260707-0024'
)
WHERE  id = 224;

-- ──────────────────────────────────────────
-- Step 5: Counter を 24 に更新
-- ──────────────────────────────────────────
UPDATE "Counter" SET value = 24 WHERE id = 'order';



-- ============================================================
-- ③ 事後確認 SELECT（COMMIT 前に結果を目視確認する）
-- ============================================================

-- [A] Order.requestId が全件セットされているか
SELECT
  o.id,
  o."orderNumber",
  o."requestId",
  o."totalAmount",
  o.status,
  r."requestNumber"
FROM  "Order" o
LEFT  JOIN "OrderRequest" r ON r.id = o."requestId"
ORDER BY o.id;

-- [B] RequestItem.orderId が全件セットされているか
SELECT
  ri.id,
  ri."productName",
  ri."requestId",
  ri."orderId",
  o."orderNumber"
FROM  "RequestItem" ri
LEFT  JOIN "Order" o ON o.id = ri."orderId"
ORDER BY ri.id;

-- [C] 分割結果: Order 138 と ORD-0024 の明細を確認
SELECT
  o.id,
  o."orderNumber",
  o."totalAmount",
  o."requestId",
  oi.id         AS oi_id,
  oi."productName",
  oi.quantity
FROM  "Order"     o
LEFT  JOIN "OrderItem" oi ON oi."orderId" = o.id
WHERE o."orderNumber" IN ('ORD-20260707-0023', 'ORD-20260707-0024')
ORDER BY o.id, oi.id;

-- [D] RequestItem 223/224 が正しい Order に紐づいているか
SELECT
  ri.id,
  ri."productName",
  ri."orderId",
  o."orderNumber"
FROM  "RequestItem" ri
LEFT  JOIN "Order" o ON o.id = ri."orderId"
WHERE ri.id IN (223, 224);

-- [E] Counter が 24 になっているか
SELECT * FROM "Counter";

-- [F] OrderRequest.orderId は今回触らない（まだ存在することを確認）
SELECT id, "requestNumber", "orderId"
FROM   "OrderRequest"
WHERE  "orderId" IS NOT NULL
ORDER BY id;



-- ============================================================
-- ④ 判断
--   ③ の結果が期待通りであれば COMMIT;
--   問題があれば ROLLBACK;
-- ============================================================

-- ROLLBACK;
-- COMMIT;
