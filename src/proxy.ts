import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, validateSessionToken } from "@/lib/admin-auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPage =
    pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");
  const isAdminApi =
    pathname.startsWith("/api/admin") &&
    !pathname.startsWith("/api/admin/auth");

  if (isAdminPage || isAdminApi) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;

    if (!token || !validateSessionToken(token)) {
      // API routes get 401 JSON, page routes get redirected to login
      if (isAdminApi) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL("/admin-login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
