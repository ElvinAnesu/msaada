import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import AdminCategoriesPage from "@/components/dashboard/admin-categories";

export default async function AdminCategoriesRoute() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") {
    redirect(user.role === "agent" ? "/dashboard/agent" : "/dashboard/customer");
  }
  return <AdminCategoriesPage user={user} />;
}
