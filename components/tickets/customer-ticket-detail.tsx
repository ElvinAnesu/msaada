"use client";

import { useEffect, useState } from "react";
import { SessionUser, Ticket } from "@/lib/types";
import { TicketDetailView } from "@/components/tickets/ticket-detail";
import { TicketDetailLayout } from "@/components/tickets/ticket-detail-layout";
import { TicketReminderButton } from "@/components/tickets/ticket-reminder-button";
import { LoadingSpinner } from "@/components/ui/states";

interface CustomerTicketDetailProps {
  ticketId: string;
  user: SessionUser;
}

export function CustomerTicketDetail({ ticketId, user }: CustomerTicketDetailProps) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatKey, setChatKey] = useState(0);

  useEffect(() => {
    fetch(`/api/tickets/${ticketId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ticket) setTicket(data.ticket);
      })
      .finally(() => setLoading(false));
  }, [ticketId]);

  if (loading) return <LoadingSpinner />;
  if (!ticket) return <p className="text-slate-500">Ticket not found</p>;

  const canRemind = !!ticket.agent_id && ticket.status !== "closed";

  return (
    <TicketDetailLayout
      key={chatKey}
      ticketId={ticketId}
      currentUserId={user.id}
      ticketStatus={ticket.status}
    >
      <TicketDetailView ticket={ticket} showAgentContact hideNotes />

      {canRemind && (
        <div className="flex flex-wrap gap-3">
          <TicketReminderButton
            ticketId={ticketId}
            onSent={() => setChatKey((k) => k + 1)}
          />
        </div>
      )}
    </TicketDetailLayout>
  );
}
