import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendInviteEmail } from "@/lib/mailer";
import { getAdminCompanyId } from "@/lib/adminAuth";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const companyId = await getAdminCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "認証エラー" }, { status: 401 });

  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "メールアドレスが必要です" }, { status: 400 });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24時間有効
  const origin = req.headers.get("origin") ?? "http://localhost:3000";
  const inviteUrl = `${origin}/portal/register?token=${token}`;

  await prisma.companyInvite.create({
    data: { token, companyId, expiresAt },
  });

  await sendInviteEmail(email, inviteUrl);

  return NextResponse.json({ ok: true, inviteUrl });
}
