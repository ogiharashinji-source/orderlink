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
  const token = req.cookies.get("auth_token")?.value ?? "";
  const adminId = verifyAdminToken(token);
  const admin = adminId ? await prisma.admin.findUnique({ where: { id: adminId }, select: { loginId: true } }) : null;
  return NextResponse.json({ ...setting, loginId: admin?.loginId ?? "" });
}

export async function PUT(req: NextRequest) {
  const companyId = await getAdminCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { companyName, address, phone, faxNumber, email, loginId, password, currentPassword } = await req.json();
  const setting = await getOrCreateSetting(companyId);

  const updated = await prisma.adminSetting.update({
    where: { id: setting.id },
    data: {
      companyName: companyName || setting.companyName,
      address: address || null,
      phone: phone || null,
      faxNumber: faxNumber || null,
      email: email || null,
    },
  });

  if (loginId || password) {
    const token = req.cookies.get("auth_token")?.value ?? "";
    const adminId = verifyAdminToken(token);
    if (adminId) {
      if (password) {
        const admin = await prisma.admin.findUnique({ where: { id: adminId }, select: { password: true } });
        if (!admin?.password || admin.password !== currentPassword) {
          return NextResponse.json({ error: "現在のパスワードが正しくありません" }, { status: 400 });
        }
      }
      const data: Record<string, string> = {};
      if (loginId) data.loginId = loginId;
      if (password) data.password = password;
      await prisma.admin.update({ where: { id: adminId }, data });
    }
  }

  return NextResponse.json(updated);
}
