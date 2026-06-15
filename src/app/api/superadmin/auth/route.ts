import { NextRequest, NextResponse } from "next/server";
import { signSuperAdmin, SUPERADMIN_COOKIE } from "@/lib/superAdminAuth";

export async function POST(req: NextRequest) {
  const { loginId, password } = await req.json();

  const validId = process.env.SUPERADMIN_ID ?? "superadmin";
  const validPass = process.env.SUPERADMIN_PASS ?? "sake-system-2026";

  if (loginId !== validId || password !== validPass) {
    return NextResponse.json({ error: "IDまたはパスワードが違います" }, { status: 401 });
  }

  const token = signSuperAdmin();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SUPERADMIN_COOKIE, token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SUPERADMIN_COOKIE);
  return res;
}
