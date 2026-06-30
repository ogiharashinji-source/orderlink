import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminCompanyId } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const companyId = await getAdminCompanyId(req);
  if (!companyId) {
    const res = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    res.cookies.delete("auth_token");
    return res;
  }

  const [setting, pendingRequests, unapprovedPrimary, unapprovedSecondaryLinks] = await Promise.all([
    prisma.adminSetting.findUnique({ where: { companyId }, select: { companyName: true } }),
    prisma.orderRequest.findMany({ where: { companyId, status: "PENDING" }, select: { id: true } }),
    prisma.customer.findMany({ where: { companyId, approved: false, deleted: false }, select: { id: true } }),
    prisma.customerCompany.findMany({ where: { companyId, approved: false }, select: { customerId: true } }),
  ]);

  // 重複・削除済みを除外してカウント
  const primaryIds = new Set(unapprovedPrimary.map((c) => c.id));
  const extraCustomerIds = unapprovedSecondaryLinks.map((l) => l.customerId).filter((id) => !primaryIds.has(id));
  const validSecondary = extraCustomerIds.length > 0
    ? await prisma.customer.count({ where: { id: { in: extraCustomerIds }, deleted: false } })
    : 0;

  return NextResponse.json({
    companyName: setting?.companyName ?? "",
    pendingCount: pendingRequests.length,
    approvalCount: unapprovedPrimary.length + validSecondary,
  });
}
