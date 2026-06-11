import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers";
import { insertTicket, uploadTicketAttachments } from "@/lib/tickets/create-ticket";

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const category = searchParams.get("category");
  const department_id = searchParams.get("department_id");
  const agent_id = searchParams.get("agent_id");
  const search = searchParams.get("search");
  const customer_id = searchParams.get("customer_id");
  const unassigned = searchParams.get("unassigned");
  const my_tickets = searchParams.get("my_tickets");
  const ticket_state = searchParams.get("ticket_state");

  const supabase = createAdminClient();
  let query = supabase
    .from("tickets")
    .select(
      `
      *,
      customer:profiles!tickets_customer_id_fkey(id, full_name, email, phone, username),
      agent:profiles!tickets_agent_id_fkey(id, full_name, email, phone, username),
      department:departments(id, name)
    `
    )
    .order("created_at", { ascending: false });

  const { user } = auth;

  if (user.role === "customer") {
    query = query.eq("customer_id", user.id);
  } else if (user.role === "agent") {
    if (unassigned === "true") {
      query = query.eq("status", "pending").is("agent_id", null);
    } else if (my_tickets === "true") {
      query = query.eq("agent_id", user.id);
      if (ticket_state === "open") {
        query = query.neq("status", "closed");
      } else if (ticket_state === "closed") {
        query = query.eq("status", "closed");
      }
    }
  }

  if (status) query = query.eq("status", status);
  if (priority) query = query.eq("priority", priority);
  if (category) query = query.eq("category", category);
  if (department_id) query = query.eq("department_id", department_id);
  if (agent_id) query = query.eq("agent_id", agent_id);
  if (customer_id) query = query.eq("customer_id", customer_id);

  const { data, error } = await query;

  if (error) return apiError(error.message, 500);

  let tickets = data || [];

  if (search && user.role === "admin") {
    const term = search.toLowerCase();
    tickets = tickets.filter((t) => {
      const ticketNum = `TKT-${t.ticket_number}`.toLowerCase();
      const subject = t.subject.toLowerCase();
      const customerName = t.customer?.full_name?.toLowerCase() || "";
      return (
        ticketNum.includes(term) ||
        subject.includes(term) ||
        customerName.includes(term)
      );
    });
  }

  return apiSuccess({ tickets });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(["customer"]);
  if (auth instanceof Response) return auth;

  try {
    const formData = await request.formData();
    const priority = formData.get("priority") as string;
    const subject = formData.get("subject") as string;
    const description = formData.get("description") as string;

    if (!priority || !subject || !description) {
      return apiError("All fields are required");
    }

    if (!auth.user.department_id) {
      return apiError(
        "Your account has no department assigned. Please contact support."
      );
    }

    const { data: ticket, error: ticketError } = await insertTicket({
      customerId: auth.user.id,
      departmentId: auth.user.department_id,
      priority,
      subject,
      description,
    });

    if (ticketError || !ticket) {
      return apiError(ticketError?.message || "Failed to create ticket");
    }

    const files = formData.getAll("files") as File[];
    await uploadTicketAttachments(ticket.id, files, auth.user.id);

    return apiSuccess({ ticket }, 201);
  } catch {
    return apiError("Failed to create ticket", 500);
  }
}
