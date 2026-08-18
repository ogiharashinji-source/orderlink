import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminCompanyId } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const companyId = await getAdminCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 承認済み会員（主所属 + 招待経由の追加所属）
  const primaryCustomers = await prisma.customer.findMany({
    where: { companyId, deleted: false, approved: true },
    select: { id: true, name: true, email: true, phone: true },
  });
  const primaryIds = new Set(primaryCustomers.map((c) => c.id));

  const secondaryLinks = await prisma.customerCompany.findMany({
    where: { companyId, approved: true },
    select: { customerId: true },
  });
  const extraIds = secondaryLinks.map((l) => l.customerId).filter((id) => !primaryIds.has(id));

  const secondaryCustomers = extraIds.length > 0
    ? await prisma.customer.findMany({
        where: { id: { in: extraIds }, deleted: false },
        select: { id: true, name: true, email: true, phone: true },
      })
    : [];

  const allApproved = [...primaryCustomers, ...secondaryCustomers];

  // 現在リクエスト一覧に出ている（未確認＝PENDING）会員ID
  const pending = await prisma.orderRequest.findMany({
    where: { companyId, customerId: { not: null }, status: "PENDING" },
    select: { customerId: true },
    distinct: ["customerId"],
  });
  const pendingIds = new Set(pending.map((r) => r.customerId));

  const unanswered = allApproved
    .filter((c) => !pendingIds.has(c.id))
    .sort((a, b) => a.name.localeCompare(b.name, "ja"));

  return NextResponse.json(unanswered);
}
