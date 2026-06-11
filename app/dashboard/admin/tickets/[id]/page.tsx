import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AdminTicketDetail } from "@/components/tickets/admin-ticket-detail";
import { Ticket } from "@/lib/types";

const adminNav = [
  { href: "/dashboard/admin", label: "Tickets", icon: "🎫" },
  { href: "/dashboard/admin/users", label: "Users", icon: "👥" },
  { href: "/dashboard/admin/customers", label: "Customers", icon: "👤" },
  { href: "/dashboard/admin/departments", label: "Departments", icon: "🏢" },
  { href: "/dashboard/admin/reports", label: "Reports", icon: "📊" },
];

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
    redirect("/dashboard/admin");
  }

  return (
    <DashboardLayout user={user} navItems={adminNav}>
      <AdminTicketDetail ticket={ticket as Ticket} user={user} />
    </DashboardLayout>
  );
}
