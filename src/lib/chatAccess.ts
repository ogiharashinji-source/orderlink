import { prisma } from "./prisma";

// customerId が companyId に対して承認済みの取引関係にあるか判定
// /api/portal/companies と同じロジック（主所属 or 承認済みCustomerCompany）
export async function isCustomerApprovedForCompany(customerId: number, companyId: number): Promise<boolean> {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { companyId: true, approved: true, deleted: true },
  });
  if (!customer || customer.deleted) return false;

  if (customer.companyId === companyId) {
    return customer.approved;
  }

  const link = await prisma.customerCompany.findUnique({
    where: { customerId_companyId: { customerId, companyId } },
  });
  return !!link?.approved;
}

// companyId × customerId のチャットルームを取得、なければ作成
export async function getOrCreateChatRoom(companyId: number, customerId: number) {
  return prisma.chatRoom.upsert({
    where: { companyId_customerId: { companyId, customerId } },
    update: {},
    create: { companyId, customerId },
  });
}
