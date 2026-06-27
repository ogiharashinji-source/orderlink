import { prisma } from "./prisma";

export async function nextCustomerNumber(): Promise<number> {
  const last = await prisma.customer.findFirst({
    where: { customerNumber: { not: null } },
    orderBy: { customerNumber: "desc" },
    select: { customerNumber: true },
  });
  return (last?.customerNumber ?? 0) + 1;
}
