import { NextRequest, NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customerAuth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const customer = await getCustomerSession();
  if (!customer) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

  const customerData = await prisma.customer.findUnique({
    where: { id: customer.id },
    select: { companyId: true },
  });
  const setting = customerData
    ? await prisma.adminSetting.findUnique({
        where: { companyId: customerData.companyId },
        select: { companyName: true },
      })
    : null;

  return NextResponse.json({ ...customer, sellerName: setting?.companyName ?? "" });
}

export async function PUT(req: NextRequest) {
  const customer = await getCustomerSession();
  if (!customer) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

  const { name, company, phone, faxNumber, email, address, currentLoginId, currentPassword, newLoginId, newPassword } = await req.json();

  // 会員情報の保存（name と address が両方ある時のみ）
  if (name !== undefined && address !== undefined) {
    const data: Record<string, unknown> = {
      name: name || customer.name,
      company: company || null,
      phone: phone || null,
      faxNumber: faxNumber || null,
      email: email || null,
      address: address || null,
    };
    try {
      await prisma.customer.update({ where: { id: customer.id }, data });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("Unique constraint") || msg.includes("unique")) {
        return NextResponse.json({ error: "そのメールアドレスはすでに使用されています" }, { status: 400 });
      }
      return NextResponse.json({ error: "保存に失敗しました" }, { status: 500 });
    }
  }

  // ID・パスワード変更
  if (currentLoginId && currentPassword && newLoginId && newPassword) {
    const record = await prisma.customer.findUnique({ where: { id: customer.id }, select: { loginId: true, password: true } });
    if (record?.loginId !== currentLoginId) {
      return NextResponse.json({ error: "現在のIDが正しくありません" }, { status: 400 });
    }
    if (record?.password !== currentPassword) {
      return NextResponse.json({ error: "現在のパスワードが正しくありません" }, { status: 400 });
    }
    await prisma.customer.update({ where: { id: customer.id }, data: { loginId: newLoginId, password: newPassword } });
  }

  return NextResponse.json({ ok: true });
}
