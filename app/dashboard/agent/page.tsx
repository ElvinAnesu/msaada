import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import AgentDashboard from "@/components/dashboard/agent-dashboard";

export default async function AgentDashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "agent") {
    redirect(user.role === "admin" ? "/dashboard/admin" : "/dashboard/customer");
  }
  return <AgentDashboard user={user} />;
}
