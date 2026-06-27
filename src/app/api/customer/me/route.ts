import { NextResponse } from "next/server";
import { verifyCustomerToken } from "@/lib/customerAuth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const customerId = await verifyCustomerToken();
  if (!customerId) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { id: true, deleted: true },
  });
  if (!customer || customer.deleted) {
    return NextResponse.json({ error: "アカウントが削除されました" }, { status: 401 });
  }

  return NextResponse.json({ id: customerId });
}
