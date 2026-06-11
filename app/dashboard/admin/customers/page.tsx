import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import AdminCustomersPage from "@/components/dashboard/admin-customers";

export default async function CustomersPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard/customer");
  return <AdminCustomersPage user={user} />;
}
