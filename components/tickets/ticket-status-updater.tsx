"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Ticket, TicketStatus } from "@/lib/types";
import { formatStatusLabel, getForwardStatusOptions } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface TicketStatusUpdaterProps {
  ticketId: string;
  ticket: Ticket;
  onUpdated: (ticket: Ticket) => void;
  showReopen?: boolean;
  onReopen?: () => void;
  reopening?: boolean;
}

export function TicketStatusUpdater({
  ticketId,
  ticket,
  onUpdated,
  showReopen,
  onReopen,
  reopening,
}: TicketStatusUpdaterProps) {
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus>(ticket.status);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    setSelectedStatus(ticket.status);
  }, [ticket.status]);

  const statusOptions = getForwardStatusOptions(ticket.status);
  const canUpdate = selectedStatus !== ticket.status;

  async function handleUpdateStatus() {
    if (!canUpdate) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "status", status: selectedStatus }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to update status");
        setSelectedStatus(ticket.status);
        return;
      }
      toast.success(`Status updated to ${formatStatusLabel(selectedStatus)}`);
      onUpdated(json.ticket);
    } catch {
      toast.error("Failed to update status");
      setSelectedStatus(ticket.status);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <Card>
      <h3 className="mb-4 text-lg font-semibold">Update ticket status</h3>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Select
            label="Status"
            options={statusOptions}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as TicketStatus)}
          />
        </div>
        <Button
          onClick={handleUpdateStatus}
          loading={updating}
          disabled={!canUpdate}
        >
          Update status
        </Button>
      </div>
      {showReopen && onReopen && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <Button variant="outline" onClick={onReopen} loading={reopening}>
            Reopen ticket
          </Button>
        </div>
      )}
    </Card>
  );
}
