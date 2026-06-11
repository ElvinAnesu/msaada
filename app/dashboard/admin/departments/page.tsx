import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import AdminDepartmentsPage from "@/components/dashboard/admin-departments";

export default async function DepartmentsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard/customer");
  return <AdminDepartmentsPage user={user} />;
}
