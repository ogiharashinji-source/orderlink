import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { name, email, phone, faxNumber, address, loginId, password } = await req.json();
  if (!name) return NextResponse.json({ error: "会社名は必須です" }, { status: 400 });

  // loginId重複チェック（削除済みは除外、ただしDB制約のためloginIdをnullにクリア）
  if (loginId) {
    const existingId = await prisma.customer.findUnique({ where: { loginId } });
    if (existingId) {
      if (!existingId.deleted) {
        return NextResponse.json({ error: "このログインIDはすでに使われています" }, { status: 400 });
      }
      // 削除済みレコードのloginIdをnullにしてDB制約を解除
      await prisma.customer.update({ where: { id: existingId.id }, data: { loginId: null } });
    }
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

    // companyId=1が存在しない環境に対応：既存の最初の会社IDを使用
    const firstCompany = await prisma.company.findFirst({ orderBy: { id: "asc" } });
    const defaultCompanyId = firstCompany?.id ?? 1;

    const customer = await prisma.customer.create({
      data: {
        companyId: defaultCompanyId,
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
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[superadmin/customers POST]", msg);
    return NextResponse.json({ error: `登録に失敗しました: ${msg}` }, { status: 500 });
  }
}

export async function GET() {
  // 会員番号割り当て用：id昇順で全顧客を取得
  const allIds = await prisma.customer.findMany({
    where: { deleted: false },
    select: { id: true },
    orderBy: { id: "asc" },
  });
  const numberMap = Object.fromEntries(allIds.map((c, i) => [c.id, i + 1]));

  const customers = await prisma.customer.findMany({
    where: { deleted: false },
    orderBy: { createdAt: "asc" },
    select: {
      id: true, name: true, address: true, phone: true, email: true,
      loginId: true, password: true, createdAt: true,
      companyId: true,
    },
  });

  // 承認済みCustomerCompany: 件数と最初の承認日を集計
  const links = await prisma.customerCompany.findMany({
    where: { approved: true },
    select: { customerId: true, approvedAt: true },
    orderBy: { approvedAt: "asc" },
  });

  const countMap: Record<number, number> = {};
  const firstApprovedAt: Record<number, string | null> = {};
  for (const l of links) {
    countMap[l.customerId] = (countMap[l.customerId] ?? 0) + 1;
    if (!firstApprovedAt[l.customerId]) {
      firstApprovedAt[l.customerId] = l.approvedAt ? l.approvedAt.toISOString() : null;
    }
  }

  const result = customers.map((c) => ({
    ...c,
    customerNumber: numberMap[c.id] ?? null,
    appliedAt: c.createdAt,
    registeredAt: firstApprovedAt[c.id] ?? null,
    companyCount: countMap[c.id] ?? 0,
  }));

  return NextResponse.json(result);
}
