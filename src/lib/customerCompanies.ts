import { prisma } from "./prisma";

// この会員が承認済みで所属している全ての会社IDを取得
export async function getApprovedCompanyIds(customerId: number): Promise<number[]> {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { companyId: true, approved: true, deleted: true },
  });
  if (!customer || customer.deleted) return [];

  const ids: number[] = [];
  if (customer.approved) ids.push(customer.companyId);

  const extras = await prisma.customerCompany.findMany({
    where: { customerId, approved: true },
    select: { companyId: true },
  });
  for (const e of extras) if (!ids.includes(e.companyId)) ids.push(e.companyId);

  return ids;
}
