import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import AgentMyTickets from "@/components/dashboard/agent-my-tickets";

export default async function AgentMyTicketsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "agent") {
    redirect(user.role === "admin" ? "/dashboard/admin" : "/dashboard/customer");
  }
  return <AgentMyTickets user={user} />;
}
