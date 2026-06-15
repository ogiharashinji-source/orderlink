import { NextRequest, NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customerAuth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const customer = await getCustomerSession();
  if (!customer) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

  const { inviteToken } = await req.json();
  if (!inviteToken) return NextResponse.json({ ok: true });

  const invite = await prisma.companyInvite.findUnique({
    where: { token: inviteToken },
  });
  if (!invite) return NextResponse.json({ ok: true });

  // 期限チェック
  if (invite.expiresAt && invite.expiresAt < new Date())
    return NextResponse.json({ error: "招待リンクの有効期限が切れています" }, { status: 400 });

  // 重複チェック付きで紐づけ
  await prisma.customerCompany.upsert({
    where: { customerId_companyId: { customerId: customer.id, companyId: invite.companyId } },
    create: { customerId: customer.id, companyId: invite.companyId, inviteId: invite.id },
    update: { inviteId: invite.id },
  });

  // 使用済みトークンを削除
  await prisma.companyInvite.delete({ where: { id: invite.id } });

  return NextResponse.json({ ok: true, companyId: invite.companyId });
}
