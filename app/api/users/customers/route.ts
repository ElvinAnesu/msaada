import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(["admin"]);
  if (auth instanceof Response) return auth;

  const search = request.nextUrl.searchParams.get("search")?.trim() || "";
  const supabase = createAdminClient();

  let query = supabase
    .from("profiles")
    .select("*, department:departments(id, name)")
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  if (search) {
    const term = `%${search}%`;
    query = query.or(
      `full_name.ilike.${term},username.ilike.${term},email.ilike.${term},phone.ilike.${term}`
    );
  }

  const { data, error } = await query;

  if (error) return apiError(error.message, 500);
  return apiSuccess({ customers: data });
}
