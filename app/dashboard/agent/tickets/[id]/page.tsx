import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AgentTicketDetail } from "@/components/tickets/agent-ticket-detail";

const agentNav = [
  { href: "/dashboard/agent", label: "Dashboard", icon: "📋" },
];

type PageProps = { params: Promise<{ id: string }> };

export default async function AgentTicketPage({ params }: PageProps) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "agent") redirect("/dashboard/agent");

  const { id } = await params;

  return (
    <DashboardLayout user={user} navItems={agentNav}>
      <AgentTicketDetail ticketId={id} user={user} />
    </DashboardLayout>
  );
}
