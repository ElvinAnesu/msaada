import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import AdminUsersPage from "@/components/dashboard/admin-users";

export default async function UsersPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard/customer");
  return <AdminUsersPage user={user} />;
}
