import { NextRequest, NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customerAuth";
import { prisma } from "@/lib/prisma";
import { getApprovedCompanyIds } from "@/lib/customerCompanies";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const customer = await getCustomerSession();
  if (!customer) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

  const { id } = await params;
  const announcementId = Number(id);
  const announcement = await prisma.announcement.findUnique({ where: { id: announcementId } });
  if (!announcement) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const companyIds = await getApprovedCompanyIds(customer.id);
  if (!companyIds.includes(announcement.companyId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.announcementRead.upsert({
    where: { announcementId_customerId: { announcementId, customerId: customer.id } },
    update: {},
    create: { announcementId, customerId: customer.id },
  });

  return NextResponse.json({ ok: true });
}
