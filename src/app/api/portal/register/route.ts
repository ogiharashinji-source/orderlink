import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { makeSessionToken, CUSTOMER_COOKIE } from "@/lib/customerAuth";

export async function POST(req: NextRequest) {
  try {
  const { name, address, phone, faxNumber, email, loginId, password, inviteToken } = await req.json();
  if (!name || !loginId || !password)
    return NextResponse.json({ error: "必須項目を入力してください" }, { status: 400 });

  const existingLoginId = await prisma.customer.findUnique({ where: { loginId } });
  if (existingLoginId)
    return NextResponse.json({ error: "このログインIDはすでに使われています" }, { status: 400 });

  // 招待トークンから会社IDを取得
  let companyId = 1;
  if (inviteToken) {
    const invite = await prisma.companyInvite.findUnique({ where: { token: inviteToken } });
    if (invite && (!invite.expiresAt || invite.expiresAt > new Date())) {
      companyId = invite.companyId;
      await prisma.companyInvite.delete({ where: { id: invite.id } });
    }
  }

  let customer;
  const existingEmail = email
    ? await prisma.customer.findFirst({ where: { email } })
    : null;

  if (existingEmail) {
    // 有効なポータル登録済み（削除されていない＋loginIdあり）→重複エラー
    if (!existingEmail.deleted && existingEmail.loginId) {
      return NextResponse.json({ error: "このメールアドレスはすでに登録されています" }, { status: 400 });
    }
    // 管理者登録済み or 削除済み → 既存レコードを更新して再利用
    customer = await prisma.customer.update({
      where: { id: existingEmail.id },
      data: {
        name,
        address: address || existingEmail.address,
        phone: phone || existingEmail.phone,
        faxNumber: faxNumber || existingEmail.faxNumber,
        loginId,
        password,
        approved: false,
        deleted: false,
      },
    });
    await prisma.customerCompany.upsert({
      where: { customerId_companyId: { customerId: customer.id, companyId } },
      update: { approved: false },
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
  } catch (e) {
    console.error("register error:", e);
    return NextResponse.json({ error: "登録処理中にエラーが発生しました: " + String(e) }, { status: 500 });
  }
}
