import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { makeSessionToken, CUSTOMER_COOKIE } from "@/lib/customerAuth";
import { sendBreweryNotificationEmail } from "@/lib/mailer";
import { nextCustomerNumber } from "@/lib/customerNumber";

export async function POST(req: NextRequest) {
  try {
  const { name, address, phone, faxNumber, email, loginId, password, inviteToken, breweryInviteToken } = await req.json();
  if (!name || !loginId || !password)
    return NextResponse.json({ error: "必須項目を入力してください" }, { status: 400 });

  const existingLoginId = await prisma.customer.findFirst({
    where: {
      loginId,
      deleted: false,
      ...(email ? { email: { not: email } } : {}),
    },
  });
  if (existingLoginId)
    return NextResponse.json({ error: "このログインIDはすでに使われています" }, { status: 400 });

  // 招待トークンから会社IDを取得
  let companyId = 1;
  let notifyEmail: string | null = null;
  let notifyCompanyName: string | null = null;

  if (inviteToken) {
    const invite = await prisma.companyInvite.findUnique({ where: { token: inviteToken } });
    if (invite && (!invite.expiresAt || invite.expiresAt > new Date())) {
      companyId = invite.companyId;
      await prisma.companyInvite.delete({ where: { id: invite.id } });
      const setting = await prisma.adminSetting.findUnique({ where: { companyId: invite.companyId } });
      if (setting) {
        notifyEmail = setting.email;
        notifyCompanyName = setting.companyName;
      }
    }
  } else if (breweryInviteToken) {
    const setting = await prisma.adminSetting.findUnique({ where: { inviteToken: breweryInviteToken } });
    if (setting) {
      companyId = setting.companyId;
      notifyEmail = setting.email;
      notifyCompanyName = setting.companyName;
    }
  }

  let customer;
  const existingEmail = email
    ? await prisma.customer.findFirst({ where: { email } })
    : null;
  // 削除済みのloginIdレコードを検索（メール一致なしの場合）
  const deletedLoginId = !existingEmail
    ? await prisma.customer.findFirst({ where: { loginId, deleted: true } })
    : null;

  const existingRecord = existingEmail ?? deletedLoginId;

  if (existingRecord) {
    // 承認済みの有効アカウントが存在する場合のみ重複エラー
    if (!existingRecord.deleted && existingRecord.loginId && existingRecord.approved) {
      return NextResponse.json({ error: "このメールアドレスはすでに登録されています" }, { status: 400 });
    }
    // 別の削除済みレコードが同じloginIdを持つ場合、ユニーク制約違反を防ぐためクリア
    await prisma.customer.updateMany({
      where: { loginId, deleted: true, id: { not: existingRecord.id } },
      data: { loginId: null },
    });
    // 管理者登録済み or 削除済み → 既存レコードを更新して再利用
    customer = await prisma.customer.update({
      where: { id: existingRecord.id },
      data: {
        name,
        address: address || existingRecord.address,
        phone: phone || existingRecord.phone,
        faxNumber: faxNumber || existingRecord.faxNumber,
        email: email || existingRecord.email,
        loginId,
        password,
        approved: false,
        deleted: false,
        memberNumber: null,
      },
    });
    await prisma.customerCompany.upsert({
      where: { customerId_companyId: { customerId: customer.id, companyId } },
      update: { approved: false },
      create: { customerId: customer.id, companyId, approved: false },
    });
  } else {
    const customerNumber = await nextCustomerNumber();
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
        customerNumber,
      },
    });
    await prisma.customerCompany.create({ data: { customerId: customer.id, companyId, approved: false } });
  }

  // QR・招待メール経由登録時は酒蔵管理者へ通知
  if (notifyEmail && notifyCompanyName) {
    console.log("[登録通知] 送信先:", notifyEmail, "会社:", notifyCompanyName, "会員:", name);
    sendBreweryNotificationEmail(notifyEmail, name, notifyCompanyName).catch((e) => {
      console.error("[登録通知] メール送信エラー:", e);
    });
  } else {
    console.log("[登録通知] スキップ - notifyEmail:", notifyEmail, "notifyCompanyName:", notifyCompanyName);
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
