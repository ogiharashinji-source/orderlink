import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const companies = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      setting: { select: { companyName: true, email: true, phone: true, address: true } },
      admins: { select: { id: true, loginId: true, password: true, createdAt: true } },
      _count: { select: { memberships: { where: { approved: true } }, orders: true } },
    },
  });
  return NextResponse.json(companies);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { companyName, address, phone, faxNumber, email, loginId, password } = body;

  if (!loginId || !password) {
    return NextResponse.json({ error: "ログインIDとパスワードは必須です" }, { status: 400 });
  }

  const existing = await prisma.admin.findUnique({ where: { loginId } });
  if (existing) {
    return NextResponse.json({ error: "このログインIDは既に使用されています" }, { status: 409 });
  }

  if (email) {
    const existingEmail = await prisma.adminSetting.findFirst({ where: { email } });
    if (existingEmail) {
      return NextResponse.json({ error: "このメールアドレスは既に使用されています" }, { status: 409 });
    }
  }

  const company = await prisma.company.create({
    data: {
      name: companyName || loginId,
      code: `co_${Date.now()}`,
      setting: {
        create: { companyName: companyName || "", address: address || "", phone: phone || "", faxNumber: faxNumber || "", email: email || "" },
      },
      admins: {
        create: { loginId, password },
      },
    },
  });

  return NextResponse.json(company, { status: 201 });
}
