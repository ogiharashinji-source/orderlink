import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customerAuth";
import { prisma } from "@/lib/prisma";
import { getApprovedCompanyIds } from "@/lib/customerCompanies";

export async function GET() {
  const customer = await getCustomerSession();
  if (!customer) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

  const companyIds = await getApprovedCompanyIds(customer.id);
  if (companyIds.length === 0) return NextResponse.json([]);

  const [announcements, reads] = await Promise.all([
    prisma.announcement.findMany({
      where: { companyId: { in: companyIds } },
      orderBy: { createdAt: "desc" },
      include: { company: { include: { setting: { select: { companyName: true } } } } },
    }),
    prisma.announcementRead.findMany({
      where: { customerId: customer.id, announcement: { companyId: { in: companyIds } } },
      select: { announcementId: true },
    }),
  ]);

  const readIds = new Set(reads.map((r) => r.announcementId));

  return NextResponse.json(
    announcements.map((a) => ({
      id: a.id,
      title: a.title,
      body: a.body,
      createdAt: a.createdAt,
      companyName: a.company.setting?.companyName ?? a.company.name,
      read: readIds.has(a.id),
    }))
  );
}
