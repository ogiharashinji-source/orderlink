import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customerId = parseInt(id);
  const { name, email, phone, faxNumber, address, loginId, password } = await req.json();
  if (!name) return NextResponse.json({ error: "会社名は必須です" }, { status: 400 });
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
  } catch {
    return NextResponse.json({ error: "更新に失敗しました（IDまたはメールが重複している可能性があります）" }, { status: 400 });
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
