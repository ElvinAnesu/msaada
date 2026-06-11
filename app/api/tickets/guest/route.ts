import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { apiError, apiSuccess } from "@/lib/api-helpers";
import { insertTicket, uploadTicketAttachments } from "@/lib/tickets/create-ticket";

async function findCustomerByEmail(email: string) {
  const supabase = createAdminClient();
  return supabase
    .from("profiles")
    .select("id, department_id, role, active, full_name, email")
    .ilike("email", email.trim())
    .eq("role", "customer")
    .maybeSingle();
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const priority = formData.get("priority") as string;
    const subject = formData.get("subject") as string;
    const description = formData.get("description") as string;

    if (!email || !priority || !subject || !description) {
      return apiError("All fields are required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return apiError("Please enter a valid email address");
    }

    const { data: customer, error: customerError } =
      await findCustomerByEmail(email);

    if (customerError) return apiError(customerError.message, 500);

    if (!customer) {
      return apiError("No account found for this email. Please register first.", 404);
    }

    if (!customer.active) {
      return apiError("This account is deactivated. Please contact support.", 403);
    }

    if (!customer.department_id) {
      return apiError(
        "Your account has no department assigned. Please contact support."
      );
    }

    const { data: ticket, error: ticketError } = await insertTicket({
      customerId: customer.id,
      departmentId: customer.department_id,
      priority,
      subject,
      description,
    });

    if (ticketError || !ticket) {
      return apiError(ticketError?.message || "Failed to create ticket");
    }

    const files = formData.getAll("files") as File[];
    await uploadTicketAttachments(ticket.id, files, customer.id);

    return apiSuccess({ ticket }, 201);
  } catch {
    return apiError("Failed to create ticket", 500);
  }
}
