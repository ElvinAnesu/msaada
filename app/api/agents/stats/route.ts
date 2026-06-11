import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers";

export async function GET() {
  const auth = await requireAuth(["agent"]);
  if (auth instanceof Response) return auth;

  const supabase = createAdminClient();
  const agentId = auth.user.id;

  const [unassigned, myOpen, myClosed, inProgress] = await Promise.all([
    supabase
      .from("tickets")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")
      .is("agent_id", null),
    supabase
      .from("tickets")
      .select("*", { count: "exact", head: true })
      .eq("agent_id", agentId)
      .neq("status", "closed"),
    supabase
      .from("tickets")
      .select("*", { count: "exact", head: true })
      .eq("agent_id", agentId)
      .eq("status", "closed"),
    supabase
      .from("tickets")
      .select("*", { count: "exact", head: true })
      .eq("agent_id", agentId)
      .eq("status", "in_progress"),
  ]);

  if (unassigned.error) return apiError(unassigned.error.message, 500);
  if (myOpen.error) return apiError(myOpen.error.message, 500);
  if (myClosed.error) return apiError(myClosed.error.message, 500);
  if (inProgress.error) return apiError(inProgress.error.message, 500);

  return apiSuccess({
    stats: {
      unassigned: unassigned.count ?? 0,
      my_open: myOpen.count ?? 0,
      my_closed: myClosed.count ?? 0,
      in_progress: inProgress.count ?? 0,
    },
  });
}
