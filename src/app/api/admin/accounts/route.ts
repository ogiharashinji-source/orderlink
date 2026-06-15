import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const admins = await prisma.admin.findMany({
    select: { id: true, loginId: true, name: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(admins);
}

export async function POST(req: NextRequest) {
  const { loginId, password, name } = await req.json();
  if (!loginId || !password) {
    return NextResponse.json({ error: "IDとパスワードは必須です" }, { status: 400 });
  }
  const exists = await prisma.admin.findUnique({ where: { loginId } });
  if (exists) {
    return NextResponse.json({ error: "このIDはすでに使用されています" }, { status: 409 });
  }
  const admin = await prisma.admin.create({
    data: { loginId, password, name: name || null },
    select: { id: true, loginId: true, name: true, createdAt: true },
  });
  return NextResponse.json(admin);
}
