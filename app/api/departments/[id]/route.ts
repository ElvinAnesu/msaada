import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth, apiError, apiSuccess, zodFirstError } from "@/lib/api-helpers";
import { departmentSchema } from "@/lib/validations/schemas";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireAuth(["admin"]);
  if (auth instanceof Response) return auth;

  const { id } = await context.params;
  const body = await request.json();
  const parsed = departmentSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(zodFirstError(parsed.error));
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("departments")
    .update({ name: parsed.data.name })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return apiError("Department already exists");
    return apiError(error.message);
  }
  return apiSuccess({ department: data });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const auth = await requireAuth(["admin"]);
  if (auth instanceof Response) return auth;

  const { id } = await context.params;
  const supabase = createAdminClient();

  const { count } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("department_id", id);

  if (count && count > 0) {
    return apiError("Cannot delete department with assigned agents");
  }

  const { error } = await supabase.from("departments").delete().eq("id", id);
  if (error) return apiError(error.message);
  return apiSuccess({ success: true });
}
