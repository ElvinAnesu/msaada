"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SessionUser, Ticket } from "@/lib/types";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { TicketList } from "@/components/tickets/ticket-card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/states";
import { cn } from "@/lib/utils";

const agentNav = [
  { href: "/dashboard/agent", label: "Dashboard", icon: "📋" },
];

export default function AgentDashboard({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [tab, setTab] = useState<"unassigned" | "my">("unassigned");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickingUp, setPickingUp] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (tab === "unassigned") params.set("unassigned", "true");
    else params.set("my_tickets", "true");
    fetch(`/api/tickets?${params}`)
      .then((r) => r.json())
      .then((data) => setTickets(data.tickets || []))
      .finally(() => setLoading(false));
  }, [tab]);

  async function handlePickup(ticketId: string) {
    setPickingUp(ticketId);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "pickup" }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to pick up ticket");
        return;
      }
      toast.success("Ticket assigned to you");
      router.push(`/dashboard/agent/tickets/${ticketId}`);
    } catch {
      toast.error("Failed to pick up ticket");
    } finally {
      setPickingUp(null);
    }
  }

  return (
    <DashboardLayout user={user} navItems={agentNav}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Agent Dashboard</h1>
        <p className="text-sm text-slate-600">Manage support tickets</p>
      </div>

      <div className="mb-6 flex gap-2 border-b border-slate-200">
        {(["unassigned", "my"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 text-sm font-medium capitalize transition-colors",
              tab === t
                ? "border-b-2 border-primary text-primary"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            {t === "unassigned" ? "Unassigned Queue" : "My Tickets"}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <TicketList
          tickets={tickets}
          hrefPrefix="/dashboard/agent/tickets"
          showCustomer
          emptyTitle={
            tab === "unassigned" ? "No unassigned tickets" : "No tickets assigned to you"
          }
          renderAction={
            tab === "unassigned"
              ? (ticket) => (
                  <Button
                    size="sm"
                    onClick={() => handlePickup(ticket.id)}
                    loading={pickingUp === ticket.id}
                  >
                    Pick up
                  </Button>
                )
              : undefined
          }
        />
      )}
    </DashboardLayout>
  );
}
