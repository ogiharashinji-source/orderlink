import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminCompanyId, verifyAdminToken } from "@/lib/adminAuth";

async function getOrCreateSetting(companyId: number) {
  let setting = await prisma.adminSetting.findUnique({ where: { companyId } });
  if (!setting) {
    setting = await prisma.adminSetting.create({ data: { companyId, companyName: "未設定" } });
  }
  return setting;
}

export async function GET(req: NextRequest) {
  const companyId = await getAdminCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const setting = await getOrCreateSetting(companyId);
  return NextResponse.json({ ...setting });
}

export async function PUT(req: NextRequest) {
  const companyId = await getAdminCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { companyName, address, phone, faxNumber, email, currentLoginId, currentPassword, newLoginId, newPassword } = await req.json();
  const setting = await getOrCreateSetting(companyId);

  // 会社情報の保存（明示的に送られたフィールドのみ更新）
  if (companyName !== undefined && address !== undefined) {
    const newCompanyName = companyName || setting.companyName;
    await prisma.adminSetting.update({
      where: { id: setting.id },
      data: {
        companyName: newCompanyName,
        address: address ?? null,
        phone: phone ?? null,
        faxNumber: faxNumber ?? null,
        email: email ?? null,
      },
    });
    await prisma.company.update({ where: { id: companyId }, data: { name: newCompanyName } });
  }

  // ID・パスワード変更
  if (currentLoginId && currentPassword && newLoginId && newPassword) {
    const token = req.cookies.get("auth_token")?.value ?? "";
    const adminId = verifyAdminToken(token);
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const admin = await prisma.admin.findUnique({ where: { id: adminId }, select: { loginId: true, password: true } });
    if (admin?.loginId !== currentLoginId) {
      return NextResponse.json({ error: "現在のIDが正しくありません" }, { status: 400 });
    }
    if (admin?.password !== currentPassword) {
      return NextResponse.json({ error: "現在のパスワードが正しくありません" }, { status: 400 });
    }
    await prisma.admin.update({ where: { id: adminId }, data: { loginId: newLoginId, password: newPassword } });
  }

  return NextResponse.json({ ok: true });
}
