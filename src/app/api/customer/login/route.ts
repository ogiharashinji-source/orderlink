import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { makeSessionToken, CUSTOMER_COOKIE } from "@/lib/customerAuth";

export async function POST(req: NextRequest) {
  const { loginId, password } = await req.json();
  if (!loginId || !password) return NextResponse.json({ error: "IDとパスワードを入力してください" }, { status: 400 });

  const customer = await prisma.customer.findUnique({ where: { loginId } });
  if (!customer || !customer.password) return NextResponse.json({ error: "IDまたはパスワードが違います" }, { status: 401 });
  if (customer.password !== password) return NextResponse.json({ error: "IDまたはパスワードが違います" }, { status: 401 });

  const token = makeSessionToken(customer.id);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(CUSTOMER_COOKIE, token, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 30 });
  return res;
}
