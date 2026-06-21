import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json();
  if (!name || !email || !message) {
    return NextResponse.json({ error: "すべての項目を入力してください" }, { status: 400 });
  }

  const to = process.env.CONTACT_EMAIL;
  if (!to) {
    console.error("[contact] CONTACT_EMAIL が未設定です");
    return NextResponse.json({ error: "送信先が設定されていません" }, { status: 500 });
  }

  if (!process.env.RESEND_API_KEY) {
    console.log(`[contact DEV] from: ${email} / name: ${name}\n${message}`);
    return NextResponse.json({ ok: true });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "noreply@orderlink.jp",
    to,
    replyTo: email,
    subject: `【OrderLink お問い合わせ】${name} 様より`,
    text: `お名前: ${name}\nメールアドレス: ${email}\n\n${message}`,
  });

  return NextResponse.json({ ok: true });
}
