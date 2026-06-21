import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendInviteEmail } from "@/lib/mailer";
import { getAdminCompanyId } from "@/lib/adminAuth";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const companyId = await getAdminCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "認証エラー" }, { status: 401 });

  const { email } = await req.json();

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24時間有効
  const origin = req.headers.get("origin") ?? "http://localhost:3000";
  const inviteUrl = `${origin}/portal/register?token=${token}`;

  await prisma.companyInvite.create({
    data: { token, companyId, expiresAt },
  });

  if (email) {
    const setting = await prisma.adminSetting.findUnique({ where: { companyId } });
    await sendInviteEmail(email, inviteUrl, setting?.companyName ?? "");
  }

  return NextResponse.json({ ok: true, inviteUrl });
}
