import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminCompanyId } from "@/lib/adminAuth";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const companyId = await getAdminCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.announcement.findUnique({ where: { id: Number(id) } });
  if (!existing || existing.companyId !== companyId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.announcement.delete({ where: { id: existing.id } });
  return NextResponse.json({ ok: true });
}
