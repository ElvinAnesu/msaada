import { clearAuthCookiesOnResponse } from "@/lib/auth/session-resolve";
import { apiSuccess } from "@/lib/api-helpers";

export async function POST() {
  const response = apiSuccess({ redirect: "/login" });
  clearAuthCookiesOnResponse(response);
  return response;
}
