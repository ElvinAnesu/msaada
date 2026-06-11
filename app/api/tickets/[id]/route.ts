import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth, apiError, apiSuccess, zodFirstError } from "@/lib/api-helpers";
import { updateCategorySchema } from "@/lib/validations/schemas";

type RouteContext = { params: Promise<{ id: string }> };

async function getTicket(id: string) {
  const supabase = createAdminClient();
  return supabase
    .from("tickets")
    .select(
      `
      *,
      customer:profiles!tickets_customer_id_fkey(id, full_name, email, phone, username),
      agent:profiles!tickets_agent_id_fkey(id, full_name, email, phone, username),
      department:departments(id, name),
      notes:ticket_notes(*, author:profiles(id, full_name, role)),
      attachments:ticket_attachments(*)
    `
    )
    .eq("id", id)
    .single();
}

function canAccessTicket(
  role: string,
  userId: string,
  ticket: { customer_id: string; agent_id: string | null }
) {
  if (role === "admin") return true;
  if (role === "customer" && ticket.customer_id === userId) return true;
  if (role === "agent" && ticket.agent_id === userId) return true;
  if (role === "agent" && ticket.agent_id === null) return true;
  return false;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;

  const { id } = await context.params;
  const { data: ticket, error } = await getTicket(id);

  if (error || !ticket) return apiError("Ticket not found", 404);

  if (!canAccessTicket(auth.user.role, auth.user.id, ticket)) {
    return apiError("Forbidden", 403);
  }

  if (ticket.notes) {
    ticket.notes.sort(
      (a: { created_at: string }, b: { created_at: string }) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }

  return apiSuccess({ ticket });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireAuth(["agent", "admin"]);
  if (auth instanceof Response) return auth;

  const { id } = await context.params;
  const body = await request.json();
  const { action } = body;

  const supabase = createAdminClient();
  const { data: ticket, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !ticket) return apiError("Ticket not found", 404);

  if (action === "pickup") {
    if (auth.user.role !== "agent") return apiError("Forbidden", 403);
    if (ticket.status !== "pending" || ticket.agent_id) {
      return apiError("Ticket is not available for pickup");
    }
    const { data: updated, error: updateError } = await supabase
      .from("tickets")
      .update({ agent_id: auth.user.id, status: "assigned" })
      .eq("id", id)
      .select()
      .single();
    if (updateError) return apiError(updateError.message);
    return apiSuccess({ ticket: updated });
  }

  if (action === "reopen") {
    const allowed =
      auth.user.role === "admin" ||
      (auth.user.role === "customer" && ticket.customer_id === auth.user.id) ||
      (auth.user.role === "agent" && ticket.agent_id === auth.user.id);

    if (!allowed) return apiError("Forbidden", 403);
    if (ticket.status !== "closed") {
      return apiError("Only closed tickets can be reopened");
    }

    const { data: updated, error: updateError } = await supabase
      .from("tickets")
      .update({ status: "pending", agent_id: null })
      .eq("id", id)
      .select()
      .single();
    if (updateError) return apiError(updateError.message);
    return apiSuccess({ ticket: updated });
  }

  if (action === "status") {
    if (auth.user.role === "agent" && ticket.agent_id !== auth.user.id) {
      return apiError("Forbidden", 403);
    }
    const { status } = body;
    const order = [
      "pending",
      "assigned",
      "in_progress",
      "escalated",
      "closed",
    ];
    const currentIdx = order.indexOf(ticket.status);
    const newIdx = order.indexOf(status);
    if (newIdx === -1) return apiError("Invalid status");
    if (newIdx <= currentIdx) {
      return apiError("Status can only move forward");
    }
    const { data: updated, error: updateError } = await supabase
      .from("tickets")
      .update({ status })
      .eq("id", id)
      .select()
      .single();
    if (updateError) return apiError(updateError.message);
    return apiSuccess({ ticket: updated });
  }

  if (action === "reassign") {
    if (auth.user.role !== "admin") return apiError("Forbidden", 403);
    const { agent_id } = body;
    if (!agent_id) return apiError("Agent is required");
    const { data: updated, error: updateError } = await supabase
      .from("tickets")
      .update({ agent_id, status: "assigned" })
      .eq("id", id)
      .select()
      .single();
    if (updateError) return apiError(updateError.message);
    return apiSuccess({ ticket: updated });
  }

  if (action === "update_category") {
    const canUpdateCategory =
      auth.user.role === "admin" ||
      (auth.user.role === "agent" &&
        (ticket.agent_id === auth.user.id ||
          (ticket.status === "pending" && ticket.agent_id === null)));

    if (!canUpdateCategory) {
      return apiError("Forbidden", 403);
    }
    const parsed = updateCategorySchema.safeParse(body);
    if (!parsed.success) {
      return apiError(zodFirstError(parsed.error));
    }
    const { category } = parsed.data;
    const { data: validCategory, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("name", category)
      .maybeSingle();

    if (categoryError) return apiError(categoryError.message);
    if (!validCategory) return apiError("Invalid category");
    const { data: updated, error: updateError } = await supabase
      .from("tickets")
      .update({ category })
      .eq("id", id)
      .select()
      .single();
    if (updateError) return apiError(updateError.message);
    const { data: fullTicket } = await getTicket(id);
    return apiSuccess({ ticket: fullTicket || updated });
  }

  return apiError("Invalid action");
}

export async function POST(request: NextRequest, context: RouteContext) {
  const auth = await requireAuth(["agent", "admin"]);
  if (auth instanceof Response) return auth;

  const { id } = await context.params;
  const formData = await request.formData();
  const note = formData.get("note") as string | null;
  const files = formData.getAll("files") as File[];

  const supabase = createAdminClient();
  const { data: ticket, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !ticket) return apiError("Ticket not found", 404);

  if (auth.user.role === "agent" && ticket.agent_id !== auth.user.id) {
    return apiError("Forbidden", 403);
  }

  if (note) {
    await supabase.from("ticket_notes").insert({
      ticket_id: id,
      note,
      author_id: auth.user.id,
    });
  }

  for (const file of files) {
    if (!file || file.size === 0) continue;
    const ext = file.name.split(".").pop();
    const path = `${id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("attachments")
      .upload(path, buffer, { contentType: file.type, upsert: false });

    if (uploadError) continue;

    const { data: urlData } = supabase.storage
      .from("attachments")
      .getPublicUrl(path);

    await supabase.from("ticket_attachments").insert({
      ticket_id: id,
      file_url: urlData.publicUrl,
      file_name: file.name,
      uploaded_by: auth.user.id,
    });
  }

  const { data: updated } = await getTicket(id);
  return apiSuccess({ ticket: updated });
}
