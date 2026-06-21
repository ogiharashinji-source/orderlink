import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { name, email, phone, faxNumber, address, loginId, password } = await req.json();
  if (!name) return NextResponse.json({ error: "会社名は必須です" }, { status: 400 });

  // loginId重複チェック
  if (loginId) {
    const existingId = await prisma.customer.findUnique({ where: { loginId } });
    if (existingId) return NextResponse.json({ error: "このログインIDはすでに使われています" }, { status: 400 });
  }

  // メール重複チェック：有効なポータル登録済み（loginIdあり・未削除）のみブロック
  if (email) {
    const existingEmail = await prisma.customer.findFirst({
      where: { email, NOT: { loginId: null }, deleted: false },
    });
    if (existingEmail) return NextResponse.json({ error: "このメールアドレスはすでに登録されています" }, { status: 400 });
  }

  try {
    // 同じメールの既存レコード（管理者登録済み or 削除済み）があれば更新
    const existingAny = email ? await prisma.customer.findFirst({ where: { email } }) : null;
    if (existingAny) {
      const customer = await prisma.customer.update({
        where: { id: existingAny.id },
        data: {
          name,
          phone: phone || existingAny.phone,
          faxNumber: faxNumber || existingAny.faxNumber,
          address: address || existingAny.address,
          loginId: loginId || null,
          password: password || null,
          deleted: false,
        },
      });
      return NextResponse.json(customer, { status: 200 });
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        faxNumber: faxNumber || null,
        address: address || null,
        loginId: loginId || null,
        password: password || null,
      },
    });
    return NextResponse.json(customer, { status: 201 });
  } catch (e) {
    console.error("[superadmin/customers POST]", e);
    return NextResponse.json({ error: "登録に失敗しました" }, { status: 500 });
  }
}

export async function GET() {
  const customers = await prisma.customer.findMany({
    where: { deleted: false },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, address: true, phone: true, email: true,
      loginId: true, password: true, createdAt: true,
      companyId: true,
    },
  });

  // 承認済みのCustomerCompany件数を集計
  const companyCounts = await prisma.customerCompany.groupBy({
    by: ["customerId"],
    where: { approved: true },
    _count: { customerId: true },
  });
  const countMap = Object.fromEntries(companyCounts.map((c) => [c.customerId, c._count.customerId]));

  const result = customers.map((c) => ({
    ...c,
    companyCount: countMap[c.id] ?? 0,
  }));

  return NextResponse.json(result);
}
