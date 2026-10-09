import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { parseTenantSubdomain, publicSitePath } from "@/lib/publish-host";

const AUTH_COOKIE =
  process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME ?? "safnom_token";

const protectedPaths = ["/profile", "/workspace", "/dashboard"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api/v1/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/sites/")
  ) {
    return NextResponse.next();
  }

  const host = request.headers.get("host") ?? "";
  const tenantSubdomain = parseTenantSubdomain(host);

  if (tenantSubdomain && !pathname.startsWith("/sites/")) {
    const segments = pathname.split("/").filter(Boolean);
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = publicSitePath(tenantSubdomain, segments);
    return NextResponse.rewrite(rewriteUrl);
  }

  const isProtected = protectedPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/|favicon.ico|brand/|icon.png|apple-icon.png).*)",
  ],
};
