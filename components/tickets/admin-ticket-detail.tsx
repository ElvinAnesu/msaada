"use client";

import { useState } from "react";
import { SessionUser, Ticket } from "@/lib/types";
import { TicketDetailView } from "@/components/tickets/ticket-detail";
import { TicketCategoryEditor } from "@/components/tickets/ticket-category-editor";
import { TicketStatusUpdater } from "@/components/tickets/ticket-status-updater";
import { TicketDetailLayout } from "@/components/tickets/ticket-detail-layout";

interface AdminTicketDetailProps {
  ticket: Ticket;
  user: SessionUser;
}

export function AdminTicketDetail({ ticket: initialTicket, user }: AdminTicketDetailProps) {
  const [ticket, setTicket] = useState(initialTicket);
  const canReopen = ticket.status === "closed";

  return (
    <TicketDetailLayout
      ticketId={ticket.id}
      currentUserId={user.id}
      ticketStatus={ticket.status}
    >
      <TicketDetailView
        ticket={ticket}
        showCustomerContact
        showAgentContact
      />
      <TicketCategoryEditor
        ticketId={ticket.id}
        currentCategory={ticket.category}
        onUpdated={setTicket}
      />
      {!canReopen && (
        <TicketStatusUpdater
          ticketId={ticket.id}
          ticket={ticket}
          onUpdated={setTicket}
        />
      )}
    </TicketDetailLayout>
  );
}
