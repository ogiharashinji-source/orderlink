import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customerId = Number(id);

  const links = await prisma.customerCompany.findMany({
    where: { customerId },
    include: {
      company: {
        select: { id: true, name: true, setting: { select: { companyName: true, email: true, phone: true } } },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  return NextResponse.json(
    links.map((l) => ({
      id: l.company.id,
      name: l.company.setting?.companyName || l.company.name,
      email: l.company.setting?.email ?? null,
      phone: l.company.setting?.phone ?? null,
      approved: l.approved,
      joinedAt: l.joinedAt,
    }))
  );
}
