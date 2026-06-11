import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(["admin"]);
  if (auth instanceof Response) return auth;

  const { searchParams } = new URL(request.url);
  const start_date = searchParams.get("start_date");
  const end_date = searchParams.get("end_date");
  const department_id = searchParams.get("department_id");
  const agent_id = searchParams.get("agent_id");
  const status = searchParams.get("status");

  const supabase = createAdminClient();
  let query = supabase
    .from("tickets")
    .select(
      `
      *,
      customer:profiles!tickets_customer_id_fkey(full_name),
      agent:profiles!tickets_agent_id_fkey(full_name),
      department:departments(name)
    `
    )
    .order("created_at", { ascending: false });

  if (start_date) query = query.gte("created_at", start_date);
  if (end_date) query = query.lte("created_at", `${end_date}T23:59:59`);
  if (department_id) query = query.eq("department_id", department_id);
  if (agent_id) query = query.eq("agent_id", agent_id);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return apiError(error.message, 500);

  const reports = (data || []).map((t) => ({
    ticket_number: t.ticket_number,
    subject: t.subject,
    customer_name: t.customer?.full_name || "",
    department: t.department?.name || "",
    category: t.category,
    priority: t.priority,
    status: t.status,
    assigned_agent: t.agent?.full_name || "Unassigned",
    created_at: t.created_at,
    updated_at: t.updated_at,
  }));

  return apiSuccess({ reports });
}
