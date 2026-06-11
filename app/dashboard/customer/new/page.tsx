import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { NewTicketForm } from "@/components/forms/new-ticket-form";
import { Card } from "@/components/ui/card";

const customerNav = [
  { href: "/dashboard/customer", label: "My Tickets", icon: "🎫" },
  { href: "/dashboard/customer/new", label: "New Ticket", icon: "➕" },
];

export default async function NewTicketPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "customer") {
    redirect(user.role === "admin" ? "/dashboard/admin" : "/dashboard/agent");
  }

  return (
    <DashboardLayout user={user} navItems={customerNav}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Submit New Ticket</h1>
        <p className="text-sm text-slate-600">Describe your issue and we&apos;ll help you resolve it</p>
      </div>
      <Card className="max-w-2xl">
        <NewTicketForm user={user} />
      </Card>
    </DashboardLayout>
  );
}
