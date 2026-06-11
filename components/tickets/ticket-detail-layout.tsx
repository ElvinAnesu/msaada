"use client";

import { TicketChatPanel } from "@/components/tickets/ticket-chat-panel";
import { TicketStatus } from "@/lib/types";

interface TicketDetailLayoutProps {
  ticketId: string;
  currentUserId: string;
  ticketStatus: TicketStatus;
  canSendMessages?: boolean;
  children: React.ReactNode;
}

export function TicketDetailLayout({
  ticketId,
  currentUserId,
  ticketStatus,
  canSendMessages = true,
  children,
}: TicketDetailLayoutProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">{children}</div>
      <div className="lg:col-span-1">
        <TicketChatPanel
          ticketId={ticketId}
          currentUserId={currentUserId}
          ticketStatus={ticketStatus}
          canSend={canSendMessages}
        />
      </div>
    </div>
  );
}
