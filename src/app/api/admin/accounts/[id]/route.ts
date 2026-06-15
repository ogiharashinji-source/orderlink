import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: paramId } = await params;
  const adminId = parseInt(paramId);
  const { loginId, password, name } = await req.json();

  const data: Record<string, unknown> = {};
  if (loginId) data.loginId = loginId;
  if (name !== undefined) data.name = name || null;
  if (password) data.password = password;

  const updated = await prisma.admin.update({
    where: { id: adminId },
    data,
    select: { id: true, loginId: true, name: true, createdAt: true },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: paramId } = await params;
  const adminId = parseInt(paramId);

  const count = await prisma.admin.count();
  if (count <= 1) {
    return NextResponse.json({ error: "最後の管理者は削除できません" }, { status: 400 });
  }

  await prisma.admin.delete({ where: { id: adminId } });
  return NextResponse.json({ ok: true });
}
