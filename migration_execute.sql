BEGIN;

ALTER TABLE "Order"       ADD COLUMN "requestId" INTEGER;
ALTER TABLE "RequestItem" ADD COLUMN "orderId"   INTEGER;
CREATE UNIQUE INDEX "RequestItem_orderId_key" ON "RequestItem"("orderId");

UPDATE "Order" o
SET    "requestId" = r.id
FROM   "OrderRequest" r
WHERE  r."orderId" = o.id;

UPDATE "RequestItem" SET "orderId" = 136 WHERE id = 219;
UPDATE "RequestItem" SET "orderId" = 137 WHERE id = 220;
UPDATE "RequestItem" SET "orderId" = 134 WHERE id = 221;
UPDATE "RequestItem" SET "orderId" = 135 WHERE id = 222;
UPDATE "RequestItem" SET "orderId" = 138 WHERE id = 223;

UPDATE "Order"
SET    "totalAmount" = 2500
WHERE  id = 138;

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
  192,
  now(), now()
FROM "Order"
WHERE id = 138;

UPDATE "OrderItem"
SET    "orderId" = (
  SELECT id FROM "Order" WHERE "orderNumber" = 'ORD-20260707-0024'
)
WHERE  id = 148;

UPDATE "RequestItem"
SET    "orderId" = (
  SELECT id FROM "Order" WHERE "orderNumber" = 'ORD-20260707-0024'
)
WHERE  id = 224;

UPDATE "Counter" SET value = 24 WHERE id = 'order';

COMMIT;
