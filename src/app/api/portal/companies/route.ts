import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customerAuth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const customer = await getCustomerSession();
  if (!customer) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

  const customerData = await prisma.customer.findUnique({
    where: { id: customer.id },
    select: { companyId: true, approved: true },
  });
  if (!customerData) return NextResponse.json([], { status: 200 });

  // 主所属会社
  const primarySetting = await prisma.adminSetting.findUnique({
    where: { companyId: customerData.companyId },
    select: { companyId: true, companyName: true },
  });

  // 追加所属会社（CustomerCompany経由）
  const extras = await prisma.customerCompany.findMany({
    where: { customerId: customer.id },
    include: {
      company: {
        include: { setting: { select: { companyName: true } } },
      },
    },
  });

  const companies: { companyId: number; companyName: string }[] = [];
  let pendingApprovals = 0;

  if (primarySetting) {
    companies.push({ companyId: primarySetting.companyId, companyName: primarySetting.companyName });
  }

  for (const e of extras) {
    if (e.companyId === customerData.companyId) continue;
    if (e.approved) {
      companies.push({
        companyId: e.companyId,
        companyName: e.company.setting?.companyName ?? e.company.name,
      });
    } else {
      pendingApprovals++;
    }
  }

  // プライマリ会社自体が未承認の場合もカウント
  if (!customerData.approved) pendingApprovals++;

  return NextResponse.json({ companies, approved: customerData.approved, pendingApprovals });
}
