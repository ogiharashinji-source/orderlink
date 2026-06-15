import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customerAuth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const customer = await getCustomerSession();
  if (!customer) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

  const requests = await prisma.orderRequest.findMany({
    where: { customerId: customer.id },
    include: {
      customer: { select: { name: true, address: true, phone: true, faxNumber: true, email: true } },
      company: { select: { setting: { select: { companyName: true, address: true, phone: true, faxNumber: true, email: true } } } },
      items: {
        include: { product: true },
      },
    },
    orderBy: { requestedAt: "desc" },
  });

  return NextResponse.json(requests);
}
