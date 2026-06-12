import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers";
import { TicketPriority, TicketStatus } from "@/lib/types";

const STATUSES: TicketStatus[] = [
  "pending",
  "assigned",
  "in_progress",
  "escalated",
  "closed",
];

const PRIORITIES: TicketPriority[] = ["low", "medium", "high", "critical"];

const STATUS_COLORS: Record<TicketStatus, string> = {
  pending: "#94a3b8",
  assigned: "#14b8a6",
  in_progress: "#a855f7",
  escalated: "#f59e0b",
  closed: "#64748b",
};

const PRIORITY_COLORS: Record<TicketPriority, string> = {
  low: "#3b82f6",
  medium: "#eab308",
  high: "#f97316",
  critical: "#ef4444",
};

export async function GET() {
  const auth = await requireAuth(["admin"]);
  if (auth instanceof Response) return auth;

  const supabase = createAdminClient();

  const [
    totalTickets,
    openTickets,
    closedTickets,
    unassigned,
    customers,
    agents,
    admins,
    categories,
    allTickets,
  ] = await Promise.all([
    supabase.from("tickets").select("*", { count: "exact", head: true }),
    supabase
      .from("tickets")
      .select("*", { count: "exact", head: true })
      .neq("status", "closed"),
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
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin")
      .eq("active", true),
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase
      .from("tickets")
      .select(
        "status, priority, category, created_at, agent_id, agent:profiles!tickets_agent_id_fkey(id, full_name)"
      ),
  ]);

  const results = [
    totalTickets,
    openTickets,
    closedTickets,
    unassigned,
    customers,
    agents,
    admins,
    categories,
    allTickets,
  ];

  for (const result of results) {
    if (result.error) return apiError(result.error.message, 500);
  }

  const tickets = allTickets.data || [];

  const ticketsByStatus = STATUSES.map((status) => ({
    label: status.replace(/_/g, " "),
    value: tickets.filter((t) => t.status === status).length,
    color: STATUS_COLORS[status],
  }));

  const ticketsByPriority = PRIORITIES.map((priority) => ({
    label: priority,
    value: tickets.filter((t) => t.priority === priority).length,
    color: PRIORITY_COLORS[priority],
  }));

  const categoryMap = new Map<string, number>();
  for (const ticket of tickets) {
    const cat = ticket.category || "Unclassified";
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
  }
  const ticketsByCategory = Array.from(categoryMap.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const agentMap = new Map<
    string,
    { id: string; full_name: string; open: number; closed: number; total: number }
  >();

  for (const ticket of tickets) {
    if (!ticket.agent_id || !ticket.agent) continue;
    const agent = Array.isArray(ticket.agent) ? ticket.agent[0] : ticket.agent;
    if (!agent?.full_name) continue;
    const existing = agentMap.get(ticket.agent_id) || {
      id: ticket.agent_id,
      full_name: agent.full_name,
      open: 0,
      closed: 0,
      total: 0,
    };
    existing.total += 1;
    if (ticket.status === "closed") existing.closed += 1;
    else existing.open += 1;
    agentMap.set(ticket.agent_id, existing);
  }

  const topAgents = Array.from(agentMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const last7Days: { label: string; value: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    const label = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    const value = tickets.filter((t) => t.created_at.slice(0, 10) === key).length;
    last7Days.push({ label, value });
  }

  return apiSuccess({
    stats: {
      total_tickets: totalTickets.count ?? 0,
      open_tickets: openTickets.count ?? 0,
      closed_tickets: closedTickets.count ?? 0,
      unassigned: unassigned.count ?? 0,
      customers: customers.count ?? 0,
      agents: agents.count ?? 0,
      admins: admins.count ?? 0,
      categories: categories.count ?? 0,
    },
    tickets_by_status: ticketsByStatus,
    tickets_by_priority: ticketsByPriority,
    tickets_by_category: ticketsByCategory,
    tickets_last_7_days: last7Days,
    top_agents: topAgents,
  });
}
