"use client";

import { useCallback, useEffect, useState } from "react";
import { SessionUser, Ticket } from "@/lib/types";
import { agentNav } from "@/lib/agent-nav";
import { useRealtimeStream } from "@/lib/hooks/use-realtime-stream";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { TicketList } from "@/components/tickets/ticket-card";
import { LoadingSpinner } from "@/components/ui/states";
import { cn } from "@/lib/utils";

export default function AgentMyTickets({ user }: { user: SessionUser }) {
  const [tab, setTab] = useState<"open" | "closed">("open");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTickets = useCallback(
    (showSpinner = false) => {
      if (showSpinner) setLoading(true);
      const params = new URLSearchParams({
        my_tickets: "true",
        ticket_state: tab,
      });
      fetch(`/api/tickets?${params}`)
        .then((r) => r.json())
        .then((data) => setTickets(data.tickets || []))
        .finally(() => setLoading(false));
    },
    [tab]
  );

  useEffect(() => {
    loadTickets(true);
  }, [loadTickets]);

  useRealtimeStream((event) => {
    if (event.table === "tickets") loadTickets();
  });

  return (
    <DashboardLayout user={user} navItems={agentNav}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">My Tickets</h1>
        <p className="text-sm text-slate-600">Tickets assigned to you</p>
      </div>

      <div className="mb-6 flex gap-2 border-b border-slate-200">
        {(["open", "closed"] as const).map((t) => (
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
            {t}
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
            tab === "open" ? "No open tickets assigned to you" : "No closed tickets"
          }
        />
      )}
    </DashboardLayout>
  );
}
