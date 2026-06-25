import { NextRequest, NextResponse } from "next/server";

const SECRET = process.env.AUTH_SECRET ?? "sake-system-secret-2026";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/admin/login",
  "/register",
  "/manual",
  "/contact",
  "/flyer",
  "/lp",
  "/terms",
  "/privacy",
  "/api/auth/login",
  "/api/auth/register",
  "/api/contact",
  "/order/",
  "/superadmin/login",
  "/api/superadmin/auth",
];

// ポータル: ログイン不要ページ
const PORTAL_PUBLIC = [
  "/portal/login",
  "/portal/register",
  "/portal/reset-password",
  "/api/portal/register",
  "/api/portal/login",
  "/api/customer/login",
  "/api/customer/logout",
  "/api/customer/register",
  "/api/customer/password-reset",
];

async function verifyHmac(id: string, sig: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const expected = await crypto.subtle.sign("HMAC", key, encoder.encode(id));
  const expectedHex = Array.from(new Uint8Array(expected)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return sig === expectedHex;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/login") return NextResponse.redirect(new URL("/admin/login", req.url));
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return NextResponse.next();
  if (pathname.startsWith("/api/order-links")) return NextResponse.next();

  // ポータルルート: customer_auth クッキーがなければログインページへ
  if (pathname.startsWith("/portal/") || pathname.startsWith("/api/portal/") || pathname.startsWith("/api/customer/")) {
    if (PORTAL_PUBLIC.some((p) => pathname.startsWith(p))) return NextResponse.next();
    const customerToken = req.cookies.get("customer_auth")?.value;
    if (!customerToken) return NextResponse.redirect(new URL("/portal/login", req.url));
    return NextResponse.next();
  }

  // スーパー管理者ルート
  if (pathname.startsWith("/superadmin") || pathname.startsWith("/api/superadmin/")) {
    const token = req.cookies.get("superadmin_token")?.value;
    if (!token) return NextResponse.redirect(new URL("/superadmin/login", req.url));
    const [id, sig] = token.split(":");
    if (!id || !sig || !(await verifyHmac(id, sig))) {
      return NextResponse.redirect(new URL("/superadmin/login", req.url));
    }
    return NextResponse.next();
  }

  // 通常管理者ルート
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.redirect(new URL("/admin/login", req.url));
  const [id, sig] = token.split(":");
  if (!id || !sig || !(await verifyHmac(id, sig))) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
