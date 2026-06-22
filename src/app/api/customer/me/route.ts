import { NextResponse } from "next/server";
import { verifyCustomerToken } from "@/lib/customerAuth";

export async function GET() {
  const customerId = await verifyCustomerToken();
  if (!customerId) return NextResponse.json({ error: "未ログイン" }, { status: 401 });
  return NextResponse.json({ id: customerId });
}
