import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const companies = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      setting: { select: { companyName: true, email: true, phone: true, address: true } },
      admins: { select: { id: true, loginId: true, password: true, createdAt: true } },
      _count: { select: { memberships: { where: { approved: true } }, orders: true } },
    },
  });
  return NextResponse.json(companies);
}
