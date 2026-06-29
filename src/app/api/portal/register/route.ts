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

    // loginId 重複チェック
    const existingLoginId = await prisma.customer.findFirst({ where: { loginId, deleted: false } });
    if (existingLoginId)
      return NextResponse.json({ error: "このログインIDはすでに使われています" }, { status: 400 });

    // メールアドレス重複チェック（承認済み・未承認問わずブロック）
    if (email) {
      const existingEmail = await prisma.customer.findFirst({ where: { email, deleted: false } });
      if (existingEmail)
        return NextResponse.json({ error: "このメールアドレスはすでに登録されています" }, { status: 400 });
    }

    // 招待トークンから会社IDと通知先を取得
    let companyId = 1;
    let notifyEmail: string | null = null;
    let notifyCompanyName: string | null = null;
    let inviteIdToDelete: number | null = null;

    if (inviteToken) {
      const invite = await prisma.companyInvite.findUnique({ where: { token: inviteToken } });
      if (invite && (!invite.expiresAt || invite.expiresAt > new Date())) {
        companyId = invite.companyId;
        inviteIdToDelete = invite.id;
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

    // 全DB操作をトランザクションで囲む（失敗時は自動ロールバック）
    const customer = await prisma.$transaction(async (tx) => {
      const customerNumber = await nextCustomerNumber();
      const record = await tx.customer.create({
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
      await tx.customerCompany.create({ data: { customerId: record.id, companyId, approved: false } });
      if (inviteIdToDelete) {
        await tx.companyInvite.delete({ where: { id: inviteIdToDelete } });
      }
      return record;
    });

    // 通知メール（非同期、エラーはログのみ）
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
