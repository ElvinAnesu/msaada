import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import AgentUnassignedTickets from "@/components/dashboard/agent-unassigned-tickets";

export default async function AgentUnassignedPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "agent") {
    redirect(user.role === "admin" ? "/dashboard/admin" : "/dashboard/customer");
  }
  return <AgentUnassignedTickets user={user} />;
}
