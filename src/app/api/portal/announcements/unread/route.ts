import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customerAuth";
import { prisma } from "@/lib/prisma";
import { getApprovedCompanyIds } from "@/lib/customerCompanies";

export async function GET() {
  const customer = await getCustomerSession();
  if (!customer) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

  const companyIds = await getApprovedCompanyIds(customer.id);
  if (companyIds.length === 0) return NextResponse.json({ unread: 0 });

  const [total, readCount] = await Promise.all([
    prisma.announcement.count({ where: { companyId: { in: companyIds } } }),
    prisma.announcementRead.count({
      where: { customerId: customer.id, announcement: { companyId: { in: companyIds } } },
    }),
  ]);

  return NextResponse.json({ unread: Math.max(0, total - readCount) });
}
