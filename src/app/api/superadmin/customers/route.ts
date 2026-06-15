import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, address: true, phone: true, email: true,
      loginId: true, password: true, createdAt: true,
      companyId: true,
    },
  });

  // 承認済みのCustomerCompany件数を集計
  const companyCounts = await prisma.customerCompany.groupBy({
    by: ["customerId"],
    where: { approved: true },
    _count: { customerId: true },
  });
  const countMap = Object.fromEntries(companyCounts.map((c) => [c.customerId, c._count.customerId]));

  const result = customers.map((c) => ({
    ...c,
    companyCount: countMap[c.id] ?? 0,
  }));

  return NextResponse.json(result);
}
