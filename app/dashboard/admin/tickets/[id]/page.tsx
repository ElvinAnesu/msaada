import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminNav } from "@/lib/admin-nav";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AdminTicketDetail } from "@/components/tickets/admin-ticket-detail";
import { Ticket } from "@/lib/types";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminTicketPage({ params }: PageProps) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard/customer");

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: ticket, error } = await supabase
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

  if (error || !ticket) {
    redirect("/dashboard/admin/tickets");
  }

  return (
    <DashboardLayout user={user} navItems={adminNav}>
      <AdminTicketDetail ticket={ticket as Ticket} user={user} />
    </DashboardLayout>
  );
}
