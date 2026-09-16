-- CreateTable
CREATE TABLE IF NOT EXISTS "Announcement" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "AnnouncementRead" (
    "id" SERIAL NOT NULL,
    "announcementId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnnouncementRead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Announcement_companyId_idx" ON "Announcement"("companyId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AnnouncementRead_customerId_idx" ON "AnnouncementRead"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "AnnouncementRead_announcementId_customerId_key" ON "AnnouncementRead"("announcementId", "customerId");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Announcement_companyId_fkey') THEN
    ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AnnouncementRead_announcementId_fkey') THEN
    ALTER TABLE "AnnouncementRead" ADD CONSTRAINT "AnnouncementRead_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AnnouncementRead_customerId_fkey') THEN
    ALTER TABLE "AnnouncementRead" ADD CONSTRAINT "AnnouncementRead_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
