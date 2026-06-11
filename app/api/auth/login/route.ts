import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { setAuthCookies } from "@/lib/auth/cookies";
import { loginSchema } from "@/lib/validations/schemas";
import { apiError, apiSuccess, zodFirstError } from "@/lib/api-helpers";
import { getDashboardPath } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  let accessToken: string | null = null;
  let refreshToken: string | null = null;
  let redirectPath = "/dashboard/customer";

  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(zodFirstError(parsed.error));
    }

    const { username, password } = parsed.data;
    const supabase = createAdminClient();

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, active, role")
      .eq("username", username)
      .single();

    if (profileError || !profile) {
      return apiError("Invalid username or password", 401);
    }

    if (!profile.active) {
      return apiError("Account is deactivated", 403);
    }

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: profile.email,
        password,
      });

    if (authError || !authData.session) {
      return apiError("Invalid username or password", 401);
    }

    accessToken = authData.session.access_token;
    refreshToken = authData.session.refresh_token;
    redirectPath = getDashboardPath(profile.role);
  } catch {
    return apiError("Login failed", 500);
  }

  if (accessToken && refreshToken) {
    await setAuthCookies(accessToken, refreshToken);
  }

  return apiSuccess({ redirect: redirectPath });
}
