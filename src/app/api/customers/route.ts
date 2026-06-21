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
    where: unapproved ? { companyId, approved: false } : { companyId },
  });
  const primaryIds = primaryCustomers.map((c) => c.id);
  const extraIds = secondaryLinks.map((l) => l.customerId).filter((id) => !primaryIds.includes(id));

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

  const secondaryWithFlag = secondaryCustomers.map((c) => {
    const link = secondaryLinks.find((l) => l.customerId === c.id);
    return { ...c, approved: link?.approved ?? false, _secondary: true };
  });

  return NextResponse.json([...primaryCustomers, ...secondaryWithFlag]);
}

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function POST(req: NextRequest) {
  const companyId = await getAdminCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  let referralCode: string;
  do {
    referralCode = generateReferralCode();
  } while (await prisma.customer.findUnique({ where: { referralCode } }));
  const customer = await prisma.customer.create({ data: { ...body, companyId, referralCode } });
  await prisma.customerCompany.create({ data: { customerId: customer.id, companyId, approved: true } });
  return NextResponse.json(customer, { status: 201 });
}
