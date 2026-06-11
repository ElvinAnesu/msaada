"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface TicketReminderButtonProps {
  ticketId: string;
  disabled?: boolean;
  onSent?: () => void;
}

export function TicketReminderButton({
  ticketId,
  disabled,
  onSent,
}: TicketReminderButtonProps) {
  const [sending, setSending] = useState(false);

  async function handleReminder() {
    setSending(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/reminder`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to send reminder");
        return;
      }
      toast.success("Reminder sent to your assigned agent");
      onSent?.();
    } catch {
      toast.error("Failed to send reminder");
    } finally {
      setSending(false);
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleReminder}
      loading={sending}
      disabled={disabled}
    >
      🔔 Send reminder to agent
    </Button>
  );
}
