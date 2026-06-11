import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(_request: NextRequest, context: RouteContext) {
  const auth = await requireAuth(["admin"]);
  if (auth instanceof Response) return auth;

  const { id } = await context.params;
  const supabase = createAdminClient();

  const { data: agent, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .eq("role", "agent")
    .single();

  if (error || !agent) return apiError("Agent not found", 404);

  const { data: updated, error: updateError } = await supabase
    .from("profiles")
    .update({ active: false })
    .eq("id", id)
    .select()
    .single();

  if (updateError) return apiError(updateError.message);
  return apiSuccess({ agent: updated });
}
