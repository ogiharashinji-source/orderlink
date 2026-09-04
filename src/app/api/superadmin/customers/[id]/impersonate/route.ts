import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySuperAdminToken, SUPERADMIN_COOKIE } from "@/lib/superAdminAuth";
import { makeSessionToken } from "@/lib/customerAuth";

// スーパー管理者が、指定した会員としてポータルにログインした状態で別ページを開く
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get(SUPERADMIN_COOKIE)?.value;
  if (!token || !verifySuperAdminToken(token)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const { id } = await params;
  const customerId = parseInt(id);
  if (isNaN(customerId)) return NextResponse.redirect(new URL("/", req.url));

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { id: true, deleted: true },
  });
  if (!customer || customer.deleted) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const sessionToken = makeSessionToken(customer.id);
  const res = NextResponse.redirect(new URL("/portal/order", req.url));
  res.cookies.set("customer_auth", sessionToken, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 30 });
  return res;
}
