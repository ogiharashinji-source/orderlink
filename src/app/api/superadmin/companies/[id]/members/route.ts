import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const companyId = Number(id);

  const links = await prisma.customerCompany.findMany({
    where: { companyId },
    orderBy: { joinedAt: "desc" },
  });

  const customerIds = links.map((l) => l.customerId);
  const customers = await prisma.customer.findMany({
    where: { id: { in: customerIds }, deleted: false },
    select: { id: true, name: true, email: true, phone: true, customerNumber: true },
  });

  const customerMap = Object.fromEntries(customers.map((c) => [c.id, c]));

  return NextResponse.json(
    links
      .filter((l) => customerMap[l.customerId])
      .map((l) => ({
        ...customerMap[l.customerId],
        approved: l.approved,
        joinedAt: l.joinedAt,
      }))
  );
}
