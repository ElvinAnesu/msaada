"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SessionUser, Ticket } from "@/lib/types";
import { agentNav } from "@/lib/agent-nav";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { TicketList } from "@/components/tickets/ticket-card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/states";

export default function AgentUnassignedTickets({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickingUp, setPickingUp] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/tickets?unassigned=true")
      .then((r) => r.json())
      .then((data) => setTickets(data.tickets || []))
      .finally(() => setLoading(false));
  }, []);

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
        <h1 className="text-2xl font-bold text-slate-900">Unassigned Tickets</h1>
        <p className="text-sm text-slate-600">Available tickets waiting to be picked up</p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <TicketList
          tickets={tickets}
          hrefPrefix="/dashboard/agent/tickets"
          showCustomer
          emptyTitle="No unassigned tickets"
          renderAction={(ticket) => (
            <Button
              size="sm"
              onClick={() => handlePickup(ticket.id)}
              loading={pickingUp === ticket.id}
            >
              Pick up
            </Button>
          )}
        />
      )}
    </DashboardLayout>
  );
}
