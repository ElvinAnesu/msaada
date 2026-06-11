"use client";

import { TicketChatPanel } from "@/components/tickets/ticket-chat-panel";

interface TicketDetailLayoutProps {
  ticketId: string;
  currentUserId: string;
  canSendMessages?: boolean;
  children: React.ReactNode;
}

export function TicketDetailLayout({
  ticketId,
  currentUserId,
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
          canSend={canSendMessages}
        />
      </div>
    </div>
  );
}
