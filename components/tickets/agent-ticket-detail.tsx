"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SessionUser, Ticket } from "@/lib/types";
import { useRealtimeStream } from "@/lib/hooks/use-realtime-stream";
import { TicketDetailView } from "@/components/tickets/ticket-detail";
import { TicketCategoryEditor } from "@/components/tickets/ticket-category-editor";
import { TicketStatusUpdater } from "@/components/tickets/ticket-status-updater";
import { TicketDetailLayout } from "@/components/tickets/ticket-detail-layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/states";
import { Card } from "@/components/ui/card";

interface AgentTicketDetailProps {
  ticketId: string;
  user: SessionUser;
}

export function AgentTicketDetail({ ticketId, user }: AgentTicketDetailProps) {
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reopening, setReopening] = useState(false);

  const loadTicket = useCallback(() => {
    fetch(`/api/tickets/${ticketId}`)
      .then((r) => r.json())
      .then((data) => setTicket(data.ticket))
      .finally(() => setLoading(false));
  }, [ticketId]);

  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

  useRealtimeStream((event) => {
    if (event.table === "tickets") {
      const id = (event.new?.id ?? event.old?.id) as string | undefined;
      if (id === ticketId) loadTicket();
    }
  });

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
        toast.error(json.error || "Failed to reopen");
        return;
      }
      toast.success("Ticket reopened");
      router.push("/dashboard/agent");
    } catch {
      toast.error("Failed to reopen");
    } finally {
      setReopening(false);
    }
  }

  async function handleSubmitNote(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim() && !files?.length) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      if (note.trim()) formData.append("note", note);
      if (files) Array.from(files).forEach((f) => formData.append("files", f));

      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to save");
        return;
      }
      toast.success("Note added");
      setNote("");
      setFiles(null);
      setTicket(json.ticket);
    } catch {
      toast.error("Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (!ticket) return <p className="text-slate-500">Ticket not found</p>;

  const canReopen = ticket.status === "closed";
  const isAssigned = ticket.agent_id !== null;
  const canUpdateStatus = isAssigned || ticket.agent_id === null;

  return (
    <TicketDetailLayout
      ticketId={ticketId}
      currentUserId={user.id}
      ticketStatus={ticket.status}
    >
      <TicketDetailView ticket={ticket} showCustomerContact />

      <TicketCategoryEditor
        ticketId={ticketId}
        currentCategory={ticket.category}
        onUpdated={setTicket}
      />

      {canUpdateStatus && (
        <TicketStatusUpdater
          ticketId={ticketId}
          ticket={ticket}
          onUpdated={setTicket}
          showReopen={canReopen}
          onReopen={canReopen ? handleReopen : undefined}
          reopening={reopening}
        />
      )}

      {isAssigned && !canReopen && (
        <Card>
          <h3 className="mb-4 text-lg font-semibold">Internal note / attachment</h3>
          <form onSubmit={handleSubmitNote} className="space-y-4">
            <Textarea
              label="Note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add an internal note (not shown in messages)..."
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Attachments
              </label>
              <input
                type="file"
                multiple
                onChange={(e) => setFiles(e.target.files)}
                className="w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-primary-light file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary"
              />
            </div>
            <Button type="submit" loading={submitting}>
              Save
            </Button>
          </form>
        </Card>
      )}
    </TicketDetailLayout>
  );
}
