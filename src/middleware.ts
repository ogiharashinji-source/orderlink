import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Edge Runtime では Node.js crypto が使えないため Web Crypto API を使用
const enc = new TextEncoder();

async function hmacHex(message: string): Promise<string> {
  const secret = process.env.AUTH_SECRET ?? "sake-system-secret-2026";
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const buf = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// admin token: "${adminId}:${hmac(adminId)}"
async function isValidAdmin(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const sep = token.indexOf(":");
  if (sep < 1) return false;
  const idStr = token.slice(0, sep);
  const sig = token.slice(sep + 1);
  if (isNaN(parseInt(idStr))) return false;
  return (await hmacHex(idStr)) === sig;
}

// customer token: "${customerId}.${hmac(customerId)}"
async function isValidCustomer(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const sep = token.indexOf(".");
  if (sep < 1) return false;
  const idStr = token.slice(0, sep);
  const sig = token.slice(sep + 1);
  if (isNaN(parseInt(idStr))) return false;
  return (await hmacHex(idStr)) === sig;
}

// superadmin token: "superadmin:${hmac("superadmin")}"
async function isValidSuperAdmin(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const sep = token.indexOf(":");
  if (sep < 1) return false;
  const id = token.slice(0, sep);
  const sig = token.slice(sep + 1);
  if (id !== "superadmin") return false;
  return (await hmacHex("superadmin")) === sig;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const adminToken    = req.cookies.get("auth_token")?.value;
  const customerToken = req.cookies.get("customer_auth")?.value;
  const superToken    = req.cookies.get("superadmin_token")?.value;

  // ── 管理者ログイン: ログイン済みなら /requests へ ──
  if (pathname === "/admin/login") {
    if (await isValidAdmin(adminToken)) {
      return NextResponse.redirect(new URL("/requests", req.url));
    }
    return NextResponse.next();
  }

  // ── 管理者保護ページ: 未ログインなら /admin/login へ ──
  if (/^\/(requests|orders|products|customers|fax|settings)(\/|$)/.test(pathname)) {
    if (!(await isValidAdmin(adminToken))) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  // ── ポータルログイン: ログイン済みなら /portal/order へ ──
  if (pathname === "/portal/login") {
    if (await isValidCustomer(customerToken)) {
      return NextResponse.redirect(new URL("/portal/order", req.url));
    }
    return NextResponse.next();
  }

  // ── ポータル保護ページ: 未ログインなら /portal/login へ ──
  if (/^\/portal\/(order|orders|profile|guide)(\/|$)/.test(pathname)) {
    if (!(await isValidCustomer(customerToken))) {
      return NextResponse.redirect(new URL("/portal/login", req.url));
    }
    return NextResponse.next();
  }

  // ── スーパー管理者ログイン: ログイン済みなら /superadmin/companies へ ──
  if (pathname === "/superadmin/login") {
    if (await isValidSuperAdmin(superToken)) {
      return NextResponse.redirect(new URL("/superadmin/companies", req.url));
    }
    return NextResponse.next();
  }

  // ── スーパー管理者保護ページ: 未ログインなら /superadmin/login へ ──
  if (/^\/superadmin\/(companies|customers)(\/|$)/.test(pathname)) {
    if (!(await isValidSuperAdmin(superToken))) {
      return NextResponse.redirect(new URL("/superadmin/login", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/login",
    "/requests/:path*",
    "/orders/:path*",
    "/products/:path*",
    "/customers/:path*",
    "/fax/:path*",
    "/settings/:path*",
    "/portal/login",
    "/portal/order",
    "/portal/order/:path+",
    "/portal/orders",
    "/portal/orders/:path+",
    "/portal/profile",
    "/portal/profile/:path+",
    "/portal/guide",
    "/portal/guide/:path+",
    "/superadmin/login",
    "/superadmin/companies",
    "/superadmin/companies/:path+",
    "/superadmin/customers",
    "/superadmin/customers/:path+",
  ],
};
