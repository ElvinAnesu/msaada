import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth, apiError, apiSuccess, zodFirstError } from "@/lib/api-helpers";
import { categorySchema } from "@/lib/validations/schemas";

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) return apiError(error.message, 500);
  return apiSuccess({ categories: data });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(["admin"]);
  if (auth instanceof Response) return auth;

  const body = await request.json();
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return apiError(zodFirstError(parsed.error));
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .insert({ name: parsed.data.name })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return apiError("Category already exists");
    return apiError(error.message);
  }
  return apiSuccess({ category: data }, 201);
}
