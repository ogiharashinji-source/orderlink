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

export async function proxy(req: NextRequest) {
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

  // ── 旧 /superadmin/* を 404 でブロック ──
  if (pathname.startsWith("/superadmin")) {
    return new NextResponse(null, { status: 404 });
  }

  // ── スーパー管理者 (ADMIN_PATH 環境変数で動的管理) ──
  const SA_PATH = process.env.ADMIN_PATH;
  if (SA_PATH && (pathname.startsWith(`/${SA_PATH}/`) || pathname === `/${SA_PATH}`)) {
    // pathname から /superadmin/* に対応する内部パスを算出
    const rest = pathname.slice(SA_PATH.length + 1); // e.g. "/login", "/companies", "/companies/5"

    // リライト時に SA_PATH をリクエストヘッダーとして付与（サーバーコンポーネントで読み取る）
    const reqHeaders = new Headers(req.headers);
    reqHeaders.set("x-admin-path", SA_PATH);

    if (rest === "/login" || rest === "" || rest === "/") {
      if (await isValidSuperAdmin(superToken)) {
        return NextResponse.redirect(new URL(`/${SA_PATH}/companies`, req.url));
      }
      return NextResponse.rewrite(new URL("/superadmin/login", req.url), {
        request: { headers: reqHeaders },
      });
    }

    if (/^\/(companies|customers)(\/|$)/.test(rest)) {
      if (!(await isValidSuperAdmin(superToken))) {
        return NextResponse.redirect(new URL(`/${SA_PATH}/login`, req.url));
      }
      return NextResponse.rewrite(new URL(`/superadmin${rest}`, req.url), {
        request: { headers: reqHeaders },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  // 静的ファイル・画像・favicon 以外のすべてのパスで実行（動的 ADMIN_PATH 対応のため）
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)" ],
};
