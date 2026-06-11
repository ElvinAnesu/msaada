import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import AdminDashboard from "@/components/dashboard/admin-dashboard";

export default async function AdminDashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") {
    redirect(user.role === "agent" ? "/dashboard/agent" : "/dashboard/customer");
  }
  return <AdminDashboard user={user} />;
}
