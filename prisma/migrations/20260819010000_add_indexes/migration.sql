BEGIN;
CREATE INDEX "Order_companyId_idx" ON "Order"("companyId");
CREATE INDEX "OrderRequest_companyId_idx" ON "OrderRequest"("companyId");
CREATE INDEX "Product_companyId_idx" ON "Product"("companyId");
CREATE INDEX "Customer_companyId_idx" ON "Customer"("companyId");
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX "ChatMessage_roomId_idx" ON "ChatMessage"("roomId");
COMMIT;
