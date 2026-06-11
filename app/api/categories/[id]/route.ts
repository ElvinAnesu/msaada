import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth, apiError, apiSuccess, zodFirstError } from "@/lib/api-helpers";
import { categorySchema } from "@/lib/validations/schemas";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireAuth(["admin"]);
  if (auth instanceof Response) return auth;

  const { id } = await context.params;
  const body = await request.json();
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return apiError(zodFirstError(parsed.error));
  }

  const supabase = createAdminClient();

  const { data: existing, error: fetchError } = await supabase
    .from("categories")
    .select("name")
    .eq("id", id)
    .single();

  if (fetchError || !existing) return apiError("Category not found", 404);

  const { data, error } = await supabase
    .from("categories")
    .update({ name: parsed.data.name })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return apiError("Category already exists");
    return apiError(error.message);
  }

  if (existing.name !== parsed.data.name) {
    await supabase
      .from("tickets")
      .update({ category: parsed.data.name })
      .eq("category", existing.name);
  }

  return apiSuccess({ category: data });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const auth = await requireAuth(["admin"]);
  if (auth instanceof Response) return auth;

  const { id } = await context.params;
  const supabase = createAdminClient();

  const { data: category, error: fetchError } = await supabase
    .from("categories")
    .select("name")
    .eq("id", id)
    .single();

  if (fetchError || !category) return apiError("Category not found", 404);

  const { count } = await supabase
    .from("tickets")
    .select("*", { count: "exact", head: true })
    .eq("category", category.name);

  if (count && count > 0) {
    return apiError("Cannot delete category assigned to tickets");
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return apiError(error.message);
  return apiSuccess({ success: true });
}
