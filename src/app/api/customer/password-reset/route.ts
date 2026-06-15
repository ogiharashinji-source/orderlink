import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/customerAuth";

// 管理者がリセットトークンを生成
export async function POST(req: NextRequest) {
  const { customerId } = await req.json();
  const token = generateToken();
  const expiry = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24時間有効
  await prisma.customer.update({
    where: { id: Number(customerId) },
    data: { passwordResetToken: token, passwordResetExpiry: expiry },
  });
  return NextResponse.json({ token });
}

// 顧客がトークンを使ってパスワードを設定
export async function PUT(req: NextRequest) {
  const { token, password } = await req.json();
  if (!token || !password) return NextResponse.json({ error: "無効なリクエスト" }, { status: 400 });

  const customer = await prisma.customer.findUnique({ where: { passwordResetToken: token } });
  if (!customer) return NextResponse.json({ error: "無効なリンクです" }, { status: 400 });
  if (!customer.passwordResetExpiry || customer.passwordResetExpiry < new Date()) {
    return NextResponse.json({ error: "リンクの有効期限が切れています" }, { status: 400 });
  }

  await prisma.customer.update({
    where: { id: customer.id },
    data: { password, passwordResetToken: null, passwordResetExpiry: null },
  });
  return NextResponse.json({ ok: true });
}
