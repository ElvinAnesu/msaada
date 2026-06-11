"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SessionUser, Ticket } from "@/lib/types";
import { TicketDetailView } from "@/components/tickets/ticket-detail";
import { TicketDetailLayout } from "@/components/tickets/ticket-detail-layout";
import { TicketReminderButton } from "@/components/tickets/ticket-reminder-button";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/states";

interface CustomerTicketDetailProps {
  ticketId: string;
  user: SessionUser;
}

export function CustomerTicketDetail({ ticketId, user }: CustomerTicketDetailProps) {
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [reopening, setReopening] = useState(false);
  const [chatKey, setChatKey] = useState(0);

  useEffect(() => {
    fetch(`/api/tickets/${ticketId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ticket) setTicket(data.ticket);
      })
      .finally(() => setLoading(false));
  }, [ticketId]);

  async function handleReopen() {
    setReopening(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reopen" }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to reopen ticket");
        return;
      }
      toast.success("Ticket reopened");
      setTicket(json.ticket);
      router.refresh();
    } catch {
      toast.error("Failed to reopen ticket");
    } finally {
      setReopening(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (!ticket) return <p className="text-slate-500">Ticket not found</p>;

  const canReopen = ticket.status === "closed";
  const canRemind = !!ticket.agent_id && ticket.status !== "closed";

  return (
    <TicketDetailLayout
      key={chatKey}
      ticketId={ticketId}
      currentUserId={user.id}
      ticketStatus={ticket.status}
    >
      <TicketDetailView ticket={ticket} showAgentContact hideNotes />

      <div className="flex flex-wrap gap-3">
        {canRemind && (
          <TicketReminderButton
            ticketId={ticketId}
            onSent={() => setChatKey((k) => k + 1)}
          />
        )}
        {canReopen && (
          <Button variant="outline" onClick={handleReopen} loading={reopening}>
            Reopen ticket
          </Button>
        )}
      </div>
    </TicketDetailLayout>
  );
}
