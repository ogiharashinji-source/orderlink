-- AlterTable
ALTER TABLE "Customer" ADD COLUMN "faxNumber" TEXT;

-- CreateTable
CREATE TABLE "OrderLink" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "token" TEXT NOT NULL,
    "customerId" INTEGER NOT NULL,
    "title" TEXT,
    "message" TEXT,
    "productIds" TEXT NOT NULL,
    "expiresAt" DATETIME,
    "submittedAt" DATETIME,
    "orderId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrderLink_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrderLink_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderLink_token_key" ON "OrderLink"("token");

-- CreateIndex
CREATE UNIQUE INDEX "OrderLink_orderId_key" ON "OrderLink"("orderId");
