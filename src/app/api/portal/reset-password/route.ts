import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) return NextResponse.json({ error: "トークンがありません" }, { status: 400 });

  const customer = await prisma.customer.findUnique({ where: { passwordResetToken: token } });
  if (!customer || !customer.passwordResetExpiry || customer.passwordResetExpiry < new Date()) {
    return NextResponse.json({ error: "リンクが無効か期限切れです" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  const { token, loginId, password } = await req.json();
  if (!token || !loginId || !password) {
    return NextResponse.json({ error: "入力が不足しています" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "パスワードは6文字以上にしてください" }, { status: 400 });
  }

  const customer = await prisma.customer.findUnique({ where: { passwordResetToken: token } });
  if (!customer || !customer.passwordResetExpiry || customer.passwordResetExpiry < new Date()) {
    return NextResponse.json({ error: "リンクが無効か期限切れです" }, { status: 400 });
  }

  // Check loginId uniqueness (exclude self)
  const existing = await prisma.customer.findUnique({ where: { loginId } });
  if (existing && existing.id !== customer.id) {
    return NextResponse.json({ error: "このログインIDはすでに使用されています" }, { status: 400 });
  }

  await prisma.customer.update({
    where: { id: customer.id },
    data: {
      loginId,
      password,
      passwordResetToken: null,
      passwordResetExpiry: null,
    },
  });

  return NextResponse.json({ ok: true });
}
