import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { setAuthCookies } from "@/lib/auth/cookies";
import { registerSchema } from "@/lib/validations/schemas";
import { apiError, apiSuccess, zodFirstError } from "@/lib/api-helpers";

export async function POST(request: NextRequest) {
  let accessToken: string | null = null;
  let refreshToken: string | null = null;
  let redirectPath = "/login";

  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(zodFirstError(parsed.error));
    }

    const { username, full_name, email, phone, department_id, password } =
      parsed.data;
    const supabase = createAdminClient();

    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (existing) {
      return apiError("Username already taken");
    }

    const { data: existingEmail } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingEmail) {
      return apiError("Email already registered");
    }

    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { username, full_name },
      });

    if (authError || !authUser.user) {
      return apiError(authError?.message || "Registration failed");
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: authUser.user.id,
      username,
      full_name,
      email,
      phone,
      department_id,
      role: "customer",
    });

    if (profileError) {
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return apiError("Failed to create profile");
    }

    const { data: sessionData, error: sessionError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (!sessionError && sessionData.session) {
      accessToken = sessionData.session.access_token;
      refreshToken = sessionData.session.refresh_token;
      redirectPath = "/dashboard/customer";
    }
  } catch {
    return apiError("Registration failed", 500);
  }

  if (accessToken && refreshToken) {
    await setAuthCookies(accessToken, refreshToken);
  }

  return apiSuccess({ redirect: redirectPath });
}
