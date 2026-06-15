import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminCompanyId } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const companyId = await getAdminCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requests = await prisma.orderRequest.findMany({
    where: { companyId },
    orderBy: { requestedAt: "desc" },
    include: {
      customer: true,
      items: { include: { product: true } },
      order: { select: { orderNumber: true, status: true } },
    },
  });
  return NextResponse.json(requests);
}
