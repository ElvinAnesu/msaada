import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { CustomerTicketDetail } from "@/components/tickets/customer-ticket-detail";

const customerNav = [
  { href: "/dashboard/customer", label: "My Tickets", icon: "🎫" },
  { href: "/dashboard/customer/new", label: "New Ticket", icon: "➕" },
];

type PageProps = { params: Promise<{ id: string }> };

export default async function CustomerTicketPage({ params }: PageProps) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "customer") redirect("/dashboard/customer");

  const { id } = await params;

  return (
    <DashboardLayout user={user} navItems={customerNav}>
      <CustomerTicketDetail ticketId={id} user={user} />
    </DashboardLayout>
  );
}
