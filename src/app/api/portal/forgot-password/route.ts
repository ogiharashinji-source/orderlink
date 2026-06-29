import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/mailer";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "メールアドレスを入力してください" }, { status: 400 });

  const customer = await prisma.customer.findUnique({ where: { email } });

  // Always return success to avoid email enumeration
  if (!customer) return NextResponse.json({ ok: true });

  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.customer.update({
    where: { id: customer.id },
    data: { passwordResetToken: token, passwordResetExpiry: expiry },
  });

  const resetUrl = `https://www.orderlink.jp/portal/reset-password?token=${token}`;
  await sendPasswordResetEmail(email, resetUrl).catch((e) =>
    console.error("[パスワード再設定メール] 送信エラー:", e)
  );

  return NextResponse.json({ ok: true });
}
