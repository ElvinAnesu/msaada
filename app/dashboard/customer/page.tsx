import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import CustomerDashboard from "@/components/dashboard/customer-dashboard";

export default async function CustomerDashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "customer") {
    redirect(user.role === "admin" ? "/dashboard/admin" : "/dashboard/agent");
  }
  return <CustomerDashboard user={user} />;
}
