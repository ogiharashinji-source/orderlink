import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { name, email, phone, faxNumber, address, loginId, password } = await req.json();
  if (!name) return NextResponse.json({ error: "会社名は必須です" }, { status: 400 });

  try {
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
  } catch {
    return NextResponse.json({ error: "登録に失敗しました（IDまたはメールが重複している可能性があります）" }, { status: 400 });
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
