import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminCompanyId } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const companyId = await getAdminCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [setting, pendingRequests, unapprovedPrimary, unapprovedSecondary] = await Promise.all([
    prisma.adminSetting.findUnique({ where: { companyId }, select: { companyName: true } }),
    prisma.orderRequest.findMany({ where: { companyId, status: "PENDING" }, select: { id: true } }),
    prisma.customer.findMany({ where: { companyId, approved: false, deleted: false }, select: { id: true } }),
    prisma.customerCompany.findMany({ where: { companyId, approved: false }, select: { id: true } }),
  ]);

  return NextResponse.json({
    companyName: setting?.companyName ?? "",
    pendingCount: pendingRequests.length,
    approvalCount: unapprovedPrimary.length + unapprovedSecondary.length,
  });
}
