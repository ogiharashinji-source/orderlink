import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customerAuth";

export async function GET() {
  const customer = await getCustomerSession();
  if (!customer) return NextResponse.json({ error: "未ログイン" }, { status: 401 });
  return NextResponse.json({ id: customer.id, name: customer.name, company: customer.company });
}
