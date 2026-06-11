import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import AdminTickets from "@/components/dashboard/admin-tickets";

export default async function AdminTicketsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") {
    redirect(user.role === "agent" ? "/dashboard/agent" : "/dashboard/customer");
  }
  return <AdminTickets user={user} />;
}
