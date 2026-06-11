import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth, apiError, apiSuccess, zodFirstError } from "@/lib/api-helpers";
import { updateCustomerSchema } from "@/lib/validations/schemas";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireAuth(["admin"]);
  if (auth instanceof Response) return auth;

  const { id } = await context.params;

  try {
    const body = await request.json();
    const parsed = updateCustomerSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(zodFirstError(parsed.error));
    }

    const { username, full_name, email, phone, department_id, password } =
      parsed.data;
    const supabase = createAdminClient();

    const { data: customer, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .eq("role", "customer")
      .single();

    if (error || !customer) return apiError("Customer not found", 404);

    const { data: existingUsername } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .neq("id", id)
      .maybeSingle();

    if (existingUsername) return apiError("Username already taken");

    const { data: existingEmail } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .neq("id", id)
      .maybeSingle();

    if (existingEmail) return apiError("Email already registered");

    const authUpdates: {
      email?: string;
      password?: string;
      user_metadata?: { username: string; full_name: string };
    } = {
      user_metadata: { username, full_name },
    };

    if (email !== customer.email) {
      authUpdates.email = email;
    }

    if (password?.trim()) {
      authUpdates.password = password;
    }

    const { error: authError } = await supabase.auth.admin.updateUserById(
      id,
      authUpdates
    );

    if (authError) return apiError(authError.message);

    const { data: updated, error: updateError } = await supabase
      .from("profiles")
      .update({
        username,
        full_name,
        email,
        phone,
        department_id,
      })
      .eq("id", id)
      .select("*, department:departments(id, name)")
      .single();

    if (updateError) return apiError(updateError.message);
    return apiSuccess({ customer: updated });
  } catch {
    return apiError("Failed to update customer", 500);
  }
}
