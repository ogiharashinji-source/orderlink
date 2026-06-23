import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminCompanyId } from "@/lib/adminAuth";
import crypto from "crypto";
import QRCode from "qrcode";

export async function GET(req: NextRequest) {
  const companyId = await getAdminCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "認証エラー" }, { status: 401 });

  let setting = await prisma.adminSetting.findUnique({ where: { companyId } });

  if (!setting?.inviteToken) {
    const token = crypto.randomBytes(16).toString("hex");
    setting = await prisma.adminSetting.upsert({
      where: { companyId },
      update: { inviteToken: token },
      create: { companyId, inviteToken: token },
    });
  }

  const origin = req.headers.get("origin") ?? "https://www.orderlink.jp";
  const inviteUrl = `${origin}/portal/register?invite=${setting!.inviteToken}`;
  const qrDataUrl = await QRCode.toDataURL(inviteUrl, { width: 300, margin: 2 });

  return NextResponse.json({ token: setting!.inviteToken, inviteUrl, qrDataUrl });
}
