import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth, apiError, apiSuccess, zodFirstError } from "@/lib/api-helpers";
import { createAgentSchema } from "@/lib/validations/schemas";

export async function GET() {
  const auth = await requireAuth(["admin"]);
  if (auth instanceof Response) return auth;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*, department:departments(id, name)")
    .eq("role", "agent")
    .order("created_at", { ascending: false });

  if (error) return apiError(error.message, 500);
  return apiSuccess({ agents: data });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(["admin"]);
  if (auth instanceof Response) return auth;

  try {
    const body = await request.json();
    const parsed = createAgentSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(zodFirstError(parsed.error));
    }

    const { username, full_name, email, phone, password, department_id } =
      parsed.data;
    const supabase = createAdminClient();

    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (existing) return apiError("Username already taken");

    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { username, full_name },
      });

    if (authError || !authUser.user) {
      return apiError(authError?.message || "Failed to create agent");
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: authUser.user.id,
        username,
        full_name,
        email,
        phone,
        role: "agent",
        department_id,
      })
      .select("*, department:departments(id, name)")
      .single();

    if (profileError) {
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return apiError("Failed to create agent profile");
    }

    return apiSuccess({ agent: profile }, 201);
  } catch {
    return apiError("Failed to create agent", 500);
  }
}
