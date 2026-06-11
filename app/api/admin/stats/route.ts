import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers";

export async function GET() {
  const auth = await requireAuth(["admin"]);
  if (auth instanceof Response) return auth;

  const supabase = createAdminClient();

  const [
    totalTickets,
    pending,
    inProgress,
    closed,
    unassigned,
    customers,
    agents,
    categories,
  ] = await Promise.all([
    supabase.from("tickets").select("*", { count: "exact", head: true }),
    supabase
      .from("tickets")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("tickets")
      .select("*", { count: "exact", head: true })
      .eq("status", "in_progress"),
    supabase
      .from("tickets")
      .select("*", { count: "exact", head: true })
      .eq("status", "closed"),
    supabase
      .from("tickets")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")
      .is("agent_id", null),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "customer")
      .eq("active", true),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "agent")
      .eq("active", true),
    supabase.from("categories").select("*", { count: "exact", head: true }),
  ]);

  const results = [
    totalTickets,
    pending,
    inProgress,
    closed,
    unassigned,
    customers,
    agents,
    categories,
  ];

  for (const result of results) {
    if (result.error) return apiError(result.error.message, 500);
  }

  return apiSuccess({
    stats: {
      total_tickets: totalTickets.count ?? 0,
      pending: pending.count ?? 0,
      in_progress: inProgress.count ?? 0,
      closed: closed.count ?? 0,
      unassigned: unassigned.count ?? 0,
      customers: customers.count ?? 0,
      agents: agents.count ?? 0,
      categories: categories.count ?? 0,
    },
  });
}
