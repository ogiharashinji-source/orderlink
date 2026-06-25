import { NextRequest, NextResponse } from "next/server";

const ADMIN_PATHS = ["/requests", "/orders", "/products", "/customers", "/fax", "/settings"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminPath = ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (!isAdminPath) return NextResponse.next();

  const token = req.cookies.get("auth_token")?.value;
  if (!token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/requests/:path*", "/orders/:path*", "/products/:path*", "/customers/:path*", "/fax/:path*", "/settings/:path*"],
};
