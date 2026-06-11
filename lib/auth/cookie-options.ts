export const ACCESS_TOKEN_COOKIE = "sb-access-token";
export const REFRESH_TOKEN_COOKIE = "sb-refresh-token";

export const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

// Keep users logged in until manual logout — sliding window renewed on each request
export const ACCESS_TOKEN_MAX_AGE = 60 * 60 * 24 * 365;
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 365;
