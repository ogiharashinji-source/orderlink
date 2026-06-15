import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customerId = parseInt(id);

  // ソフトデリート：取引データはそのまま残す
  await prisma.customer.update({
    where: { id: customerId },
    data: { deleted: true, approved: false },
  });

  return NextResponse.json({ ok: true });
}
