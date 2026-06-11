import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import AdminReportsPage from "@/components/dashboard/admin-reports";

export default async function ReportsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard/customer");
  return <AdminReportsPage user={user} />;
}
