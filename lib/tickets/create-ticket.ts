import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_TICKET_CATEGORY } from "@/lib/utils";

export async function uploadTicketAttachments(
  ticketId: string,
  files: File[],
  uploadedBy: string | null
) {
  const supabase = createAdminClient();

  for (const file of files) {
    if (!file || file.size === 0) continue;
    const ext = file.name.split(".").pop();
    const path = `${ticketId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("attachments")
      .upload(path, buffer, { contentType: file.type, upsert: false });

    if (uploadError) continue;

    const { data: urlData } = supabase.storage
      .from("attachments")
      .getPublicUrl(path);

    await supabase.from("ticket_attachments").insert({
      ticket_id: ticketId,
      file_url: urlData.publicUrl,
      file_name: file.name,
      uploaded_by: uploadedBy,
    });
  }
}

export async function insertTicket({
  customerId,
  departmentId,
  priority,
  subject,
  description,
}: {
  customerId: string;
  departmentId: string;
  priority: string;
  subject: string;
  description: string;
}) {
  const supabase = createAdminClient();

  return supabase
    .from("tickets")
    .insert({
      department_id: departmentId,
      category: DEFAULT_TICKET_CATEGORY,
      priority,
      subject,
      description,
      customer_id: customerId,
      status: "pending",
    })
    .select(
      `
      *,
      department:departments(id, name)
    `
    )
    .single();
}
