import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, context: RouteContext) {
  const auth = await requireAuth(["customer"]);
  if (auth instanceof Response) return auth;

  const { id } = await context.params;
  const supabase = createAdminClient();

  const { data: ticket, error } = await supabase
    .from("tickets")
    .select("id, customer_id, agent_id, status")
    .eq("id", id)
    .single();

  if (error || !ticket) return apiError("Ticket not found", 404);
  if (ticket.customer_id !== auth.user.id) return apiError("Forbidden", 403);
  if (!ticket.agent_id) {
    return apiError("No agent assigned to this ticket yet");
  }
  if (ticket.status === "closed") {
    return apiError("Cannot send reminder on a closed ticket");
  }

  const { error: reminderError } = await supabase.from("ticket_reminders").insert({
    ticket_id: id,
    customer_id: auth.user.id,
  });

  if (reminderError) return apiError(reminderError.message, 500);

  const reminderText =
    "🔔 Reminder: The customer is waiting for an update on this ticket.";

  const { data: chatMessage, error: messageError } = await supabase
    .from("ticket_messages")
    .insert({
      ticket_id: id,
      sender_id: auth.user.id,
      message: reminderText,
    })
    .select("*, sender:profiles(id, full_name, role)")
    .single();

  if (messageError) return apiError(messageError.message, 500);

  return apiSuccess({ message: chatMessage });
}
