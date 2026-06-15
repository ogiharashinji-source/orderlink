import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { makeSessionToken, CUSTOMER_COOKIE } from "@/lib/customerAuth";

export async function POST(req: NextRequest) {
  const { name, address, phone, faxNumber, email, loginId, password, inviteToken } = await req.json();
  if (!name || !loginId || !password)
    return NextResponse.json({ error: "必須項目を入力してください" }, { status: 400 });

  const existing = await prisma.customer.findUnique({ where: { loginId } });
  if (existing)
    return NextResponse.json({ error: "このログインIDはすでに使われています" }, { status: 400 });

  if (email) {
    const existingEmail = await prisma.customer.findFirst({ where: { email } });
    if (existingEmail)
      return NextResponse.json({ error: "このメールアドレスはすでに登録されています" }, { status: 400 });
  }

  // 招待トークンから会社IDを取得
  let companyId = 1;
  if (inviteToken) {
    const invite = await prisma.companyInvite.findUnique({ where: { token: inviteToken } });
    if (invite && (!invite.expiresAt || invite.expiresAt > new Date())) {
      companyId = invite.companyId;
      // 使用済みトークンを削除
      await prisma.companyInvite.delete({ where: { id: invite.id } });
    }
  }

  const customer = await prisma.customer.create({
    data: {
      companyId,
      name,
      address: address || null,
      phone: phone || null,
      faxNumber: faxNumber || null,
      email: email || null,
      loginId,
      password,
      approved: false,
    },
  });
  await prisma.customerCompany.create({ data: { customerId: customer.id, companyId, approved: false } });

  const sessionToken = makeSessionToken(customer.id);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(CUSTOMER_COOKIE, sessionToken, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 30 });
  return res;
}
