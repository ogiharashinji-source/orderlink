import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const breweryInviteToken = searchParams.get("invite");
  const inviteToken = searchParams.get("token");

  if (breweryInviteToken) {
    const setting = await prisma.adminSetting.findUnique({
      where: { inviteToken: breweryInviteToken },
      select: { companyName: true },
    });
    if (!setting) return NextResponse.json({ valid: false }, { status: 404 });
    return NextResponse.json({ valid: true, companyName: setting.companyName });
  }

  if (inviteToken) {
    const invite = await prisma.companyInvite.findUnique({
      where: { token: inviteToken },
      include: { company: { include: { setting: { select: { companyName: true } } } } },
    });
    if (!invite) return NextResponse.json({ valid: false }, { status: 404 });
    if (invite.expiresAt && invite.expiresAt < new Date())
      return NextResponse.json({ valid: false }, { status: 404 });
    const companyName = invite.company?.setting?.companyName ?? invite.company?.name ?? null;
    return NextResponse.json({ valid: true, companyName });
  }

  return NextResponse.json({ valid: false }, { status: 400 });
}
