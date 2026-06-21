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

  // メールの重複チェック：loginId未設定（管理者登録済み）は上書き対象なので除外
  if (email) {
    const existingEmail = await prisma.customer.findFirst({
      where: { email, NOT: { loginId: null } },
    });
    if (existingEmail)
      return NextResponse.json({ error: "このメールアドレスはすでに登録されています" }, { status: 400 });
  }

  // 招待トークンから会社IDを取得
  let companyId = 1;
  if (inviteToken) {
    const invite = await prisma.companyInvite.findUnique({ where: { token: inviteToken } });
    if (invite && (!invite.expiresAt || invite.expiresAt > new Date())) {
      companyId = invite.companyId;
      await prisma.companyInvite.delete({ where: { id: invite.id } });
    }
  }

  // 管理者が同じメールで顧客登録済みの場合はそのレコードを更新
  let customer;
  const adminCreated = email
    ? await prisma.customer.findFirst({ where: { email, loginId: null } })
    : null;

  if (adminCreated) {
    customer = await prisma.customer.update({
      where: { id: adminCreated.id },
      data: {
        name,
        address: address || adminCreated.address,
        phone: phone || adminCreated.phone,
        faxNumber: faxNumber || adminCreated.faxNumber,
        loginId,
        password,
        approved: false,
      },
    });
    // CustomerCompanyがなければ追加
    await prisma.customerCompany.upsert({
      where: { customerId_companyId: { customerId: customer.id, companyId } },
      update: {},
      create: { customerId: customer.id, companyId, approved: false },
    });
  } else {
    customer = await prisma.customer.create({
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
  }

  const sessionToken = makeSessionToken(customer.id);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(CUSTOMER_COOKIE, sessionToken, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 30 });
  return res;
}
