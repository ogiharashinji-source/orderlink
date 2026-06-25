/*
  Warnings:

  - You are about to drop the column `orderId` on the `OrderLink` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "OrderRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "requestNumber" TEXT NOT NULL,
    "customerId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" DATETIME,
    "orderId" INTEGER,
    CONSTRAINT "OrderRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrderRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RequestItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "requestId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "requestedQty" INTEGER NOT NULL,
    "confirmedQty" INTEGER,
    "unitPrice" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RequestItem_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "OrderRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RequestItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OrderLink" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "token" TEXT NOT NULL,
    "customerId" INTEGER NOT NULL,
    "title" TEXT,
    "message" TEXT,
    "productIds" TEXT NOT NULL,
    "expiresAt" DATETIME,
    "submittedAt" DATETIME,
    "requestId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrderLink_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrderLink_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "OrderRequest" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_OrderLink" ("createdAt", "customerId", "expiresAt", "id", "message", "productIds", "submittedAt", "title", "token") SELECT "createdAt", "customerId", "expiresAt", "id", "message", "productIds", "submittedAt", "title", "token" FROM "OrderLink";
DROP TABLE "OrderLink";
ALTER TABLE "new_OrderLink" RENAME TO "OrderLink";
CREATE UNIQUE INDEX "OrderLink_token_key" ON "OrderLink"("token");
CREATE UNIQUE INDEX "OrderLink_requestId_key" ON "OrderLink"("requestId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "OrderRequest_requestNumber_key" ON "OrderRequest"("requestNumber");

-- CreateIndex
CREATE UNIQUE INDEX "OrderRequest_orderId_key" ON "OrderRequest"("orderId");
