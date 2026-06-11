import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  authCookieOptions,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
} from "@/lib/auth/cookie-options";

export type ResolvedSession =
  | {
      valid: true;
      accessToken: string;
      refreshToken: string;
      refreshed: boolean;
    }
  | { valid: false };

export function createAuthClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SECRET_KEY!;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function resolveSession(
  accessToken: string | undefined,
  refreshToken: string | undefined
): Promise<ResolvedSession> {
  const supabase = createAuthClient();

  if (accessToken) {
    const { data, error } = await supabase.auth.getUser(accessToken);
    if (!error && data.user && refreshToken) {
      return {
        valid: true,
        accessToken,
        refreshToken,
        refreshed: false,
      };
    }
  }

  if (refreshToken) {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });
    if (!error && data.session) {
      return {
        valid: true,
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        refreshed: true,
      };
    }
  }

  return { valid: false };
}

export function applyAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
    ...authCookieOptions,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...authCookieOptions,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

export function clearAuthCookiesOnResponse(response: NextResponse) {
  const expired = { ...authCookieOptions, maxAge: 0 };
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", expired);
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", expired);
}

const PUBLIC_PAGES = ["/submit-ticket"];

function isPublicApiPath(pathname: string): boolean {
  return (
    pathname === "/api/auth/login" ||
    pathname === "/api/auth/register" ||
    pathname === "/api/auth/logout" ||
    pathname === "/api/auth/me" ||
    pathname === "/api/departments" ||
    pathname === "/api/tickets/guest"
  );
}

export function requiresAuth(pathname: string): boolean {
  if (PUBLIC_PAGES.includes(pathname)) return false;
  if (pathname.startsWith("/dashboard")) return true;
  if (pathname.startsWith("/api/") && !isPublicApiPath(pathname)) return true;
  return false;
}
