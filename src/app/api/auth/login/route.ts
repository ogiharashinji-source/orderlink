import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signAdminId } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  const { id, password } = await req.json();

  const admin = await prisma.admin.findUnique({ where: { loginId: id } });
  if (!admin || admin.password !== password) {
    return NextResponse.json({ error: "IDまたはパスワードが正しくありません" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("auth_token", signAdminId(admin.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
