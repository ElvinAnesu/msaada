import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers";

type RouteContext = { params: Promise<{ id: string }> };

async function getTicketAccess(id: string, userId: string, role: string) {
  const supabase = createAdminClient();
  const { data: ticket, error } = await supabase
    .from("tickets")
    .select("id, customer_id, agent_id, status")
    .eq("id", id)
    .single();

  if (error || !ticket) return { error: apiError("Ticket not found", 404) };

  const canAccess =
    role === "admin" ||
    (role === "customer" && ticket.customer_id === userId) ||
    (role === "agent" &&
      (ticket.agent_id === userId || ticket.agent_id === null));

  if (!canAccess) return { error: apiError("Forbidden", 403) };

  return { ticket };
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;

  const { id } = await context.params;
  const access = await getTicketAccess(id, auth.user.id, auth.user.role);
  if ("error" in access && access.error) return access.error;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("ticket_messages")
    .select("*, sender:profiles(id, full_name, role)")
    .eq("ticket_id", id)
    .order("created_at", { ascending: true });

  if (error) return apiError(error.message, 500);
  return apiSuccess({ messages: data || [] });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;

  const { id } = await context.params;
  const access = await getTicketAccess(id, auth.user.id, auth.user.role);
  if ("error" in access && access.error) return access.error;

  if (access.ticket.status === "closed") {
    return apiError("Messaging is closed for this ticket");
  }

  const body = await request.json();
  const message = (body.message as string)?.trim();
  if (!message) return apiError("Message cannot be empty");

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("ticket_messages")
    .insert({
      ticket_id: id,
      sender_id: auth.user.id,
      message,
    })
    .select("*, sender:profiles(id, full_name, role)")
    .single();

  if (error) return apiError(error.message, 500);
  return apiSuccess({ message: data }, 201);
}
