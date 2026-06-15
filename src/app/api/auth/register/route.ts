import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signAdminId } from "@/lib/adminAuth";

export async function GET() {
  return NextResponse.json({ canRegister: true });
}

export async function POST(req: NextRequest) {
  const { loginId, password, companyName, address, phone, faxNumber, email } = await req.json();
  if (!loginId || !password) {
    return NextResponse.json({ error: "IDとパスワードは必須です" }, { status: 400 });
  }

  const exists = await prisma.admin.findUnique({ where: { loginId } });
  if (exists) {
    return NextResponse.json({ error: "このIDはすでに使用されています" }, { status: 409 });
  }

  // 新しい会社を作成
  const code = `company-${Date.now()}`;
  const company = await prisma.company.create({
    data: { name: companyName || loginId, code },
  });

  // 管理者を新会社に紐付けて作成
  const admin = await prisma.admin.create({
    data: { loginId, password, companyId: company.id },
  });

  // 会社設定を作成
  await prisma.adminSetting.create({
    data: {
      companyId: company.id,
      companyName: companyName || loginId,
      address: address || null,
      phone: phone || null,
      faxNumber: faxNumber || null,
      email: email || null,
    },
  });

  const res = NextResponse.json({ ok: true, id: admin.id });
  res.cookies.set("auth_token", signAdminId(admin.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
