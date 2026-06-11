import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/auth/cookie-options";
import {
  resolveSession,
  applyAuthCookies,
  requiresAuth,
} from "@/lib/auth/session-resolve";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  const hasSessionCookies = Boolean(accessToken || refreshToken);

  // Redirect authenticated users away from login/register
  if (
    (pathname === "/login" || pathname === "/register") &&
    hasSessionCookies
  ) {
    const session = await resolveSession(accessToken, refreshToken);
    if (session.valid) {
      const response = NextResponse.redirect(
        new URL("/dashboard", request.url)
      );
      applyAuthCookies(response, session.accessToken, session.refreshToken);
      return response;
    }
  }

  if (!requiresAuth(pathname)) {
    return NextResponse.next();
  }

  const session = await resolveSession(accessToken, refreshToken);

  if (!session.valid) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  // Sliding session — renew cookies on every authenticated request
  applyAuthCookies(response, session.accessToken, session.refreshToken);
  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register",
    "/submit-ticket",
    "/track-tickets",
    "/api/:path*",
  ],
};
