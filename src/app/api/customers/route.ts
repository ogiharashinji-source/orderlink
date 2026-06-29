import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminCompanyId } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const companyId = await getAdminCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const unapproved = searchParams.get("unapproved") === "1";
  const approvedOnly = searchParams.get("approved") === "1";

  // プライマリ会員
  const primaryCustomers = await prisma.customer.findMany({
    where: unapproved
      ? { companyId, deleted: false, approved: false }
      : approvedOnly
      ? { companyId, deleted: false, approved: true, ...(q ? { OR: [{ name: { contains: q } }, { email: { contains: q } }, { company: { contains: q } }, { phone: { contains: q } }] } : {}) }
      : q
      ? { companyId, deleted: false, OR: [{ name: { contains: q } }, { email: { contains: q } }, { company: { contains: q } }, { phone: { contains: q } }] }
      : { companyId, deleted: false },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  // 招待経由（CustomerCompany）の会員
  const secondaryLinks = await prisma.customerCompany.findMany({
    where: unapproved
      ? { companyId, approved: false }
      : approvedOnly
      ? { companyId, approved: true }
      : { companyId },
    select: { customerId: true, approved: true, joinedAt: true, approvedAt: true },
  });
  const primaryIds = primaryCustomers.map((c) => c.id);
  const extraIds = secondaryLinks.map((l) => l.customerId).filter((id) => !primaryIds.includes(id));

  // プライマリ会員のCustomerCompanyも取得して登録日を正確に返す
  const primaryLinks = await prisma.customerCompany.findMany({
    where: { companyId, customerId: { in: primaryIds } },
    select: { customerId: true, approved: true, joinedAt: true, approvedAt: true },
  });
  const primaryLinkMap = Object.fromEntries(primaryLinks.map((l) => [l.customerId, l]));

  const secondaryCustomers = extraIds.length > 0
    ? await prisma.customer.findMany({
        where: {
          id: { in: extraIds },
          deleted: false,
          ...(q ? { OR: [{ name: { contains: q } }, { email: { contains: q } }, { company: { contains: q } }, { phone: { contains: q } }] } : {}),
        },
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { orders: true } } },
      })
    : [];

  const primaryWithDates = primaryCustomers.map((c) => {
    const link = primaryLinkMap[c.id];
    return {
      ...c,
      joinedAt: link?.joinedAt ?? c.createdAt,
      approvedAt: link?.approvedAt ?? null,
    };
  });

  const secondaryWithFlag = secondaryCustomers.map((c) => {
    const link = secondaryLinks.find((l) => l.customerId === c.id);
    return {
      ...c,
      approved: link?.approved ?? false,
      joinedAt: link?.joinedAt ?? c.createdAt,
      approvedAt: link?.approvedAt ?? null,
      _secondary: true,
    };
  });

  return NextResponse.json([...primaryWithDates, ...secondaryWithFlag]);
}

export async function POST() {
  return NextResponse.json({ error: "顧客の新規登録は招待から行ってください" }, { status: 405 });
}
