import { cookies } from "next/headers";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  authCookieOptions,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
} from "@/lib/auth/cookie-options";

export { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE };

export async function setAuthCookies(
  accessToken: string,
  refreshToken: string
) {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
    ...authCookieOptions,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
  cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...authCookieOptions,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE, "", {
    ...authCookieOptions,
    maxAge: 0,
  });
  cookieStore.set(REFRESH_TOKEN_COOKIE, "", {
    ...authCookieOptions,
    maxAge: 0,
  });
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}

export function getAccessTokenFromRequest(
  request: Request
): string | undefined {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return undefined;
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${ACCESS_TOKEN_COOKIE}=`));
  return match?.split("=")[1];
}
