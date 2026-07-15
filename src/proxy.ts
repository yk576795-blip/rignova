import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, validateSessionToken } from "@/lib/admin-auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin/* routes.
  // Exclude /admin/login so old bookmarks get the redirect page, not a loop.
  if (
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/admin/login")
  ) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;

    if (!token || !validateSessionToken(token)) {
      const loginUrl = new URL("/admin-login", request.url);
      if (!pathname.startsWith("/api/")) {
        loginUrl.searchParams.set("from", pathname);
      }
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
