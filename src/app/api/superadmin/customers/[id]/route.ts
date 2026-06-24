import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customerId = parseInt(id);
  const { name, email, phone, faxNumber, address, loginId, password } = await req.json();
  if (!name) return NextResponse.json({ error: "会社名は必須です" }, { status: 400 });

  // メールが変更される場合のみ重複チェック
  const current = await prisma.customer.findUnique({ where: { id: customerId }, select: { email: true } });
  if (email && email !== current?.email) {
    const existing = await prisma.customer.findFirst({ where: { email, id: { not: customerId } } });
    if (existing) {
      return NextResponse.json({ error: "このメールアドレスは別のアカウントで使用されています" }, { status: 409 });
    }
  }

  try {
    const customer = await prisma.customer.update({
      where: { id: customerId },
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
    return NextResponse.json(customer);
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code === "P2002") {
      return NextResponse.json({ error: "このメールアドレスまたはログインIDはすでに使用されています" }, { status: 409 });
    }
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customerId = parseInt(id);

  await prisma.customer.update({
    where: { id: customerId },
    data: { deleted: true, approved: false },
  });

  return NextResponse.json({ ok: true });
}
