"use client";

import { Ticket } from "@/lib/types";
import { formatDate, formatTicketNumber, formatCategoryLabel } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { PriorityBadge, StatusBadge } from "@/components/ui/states";

export function TicketDetailView({
  ticket,
  showCustomerContact,
  showAgentContact,
  hideNotes,
}: {
  ticket: Ticket;
  showCustomerContact?: boolean;
  showAgentContact?: boolean;
  hideNotes?: boolean;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>{formatTicketNumber(ticket.ticket_number)}</CardTitle>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">{ticket.subject}</h2>
        </CardHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoItem label="Category" value={formatCategoryLabel(ticket.category)} />
          <InfoItem label="Department" value={ticket.department?.name || "—"} />
          <InfoItem label="Created" value={formatDate(ticket.created_at)} />
          <InfoItem label="Updated" value={formatDate(ticket.updated_at)} />
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-slate-700">Description</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
            {ticket.description}
          </p>
        </div>
      </Card>

      {showCustomerContact && ticket.customer && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Contact</CardTitle>
          </CardHeader>
          <div className="grid gap-2 sm:grid-cols-2">
            <InfoItem label="Name" value={ticket.customer.full_name} />
            <InfoItem label="Email" value={ticket.customer.email} />
            <InfoItem label="Phone" value={ticket.customer.phone || "—"} />
          </div>
        </Card>
      )}

      {showAgentContact && (
        <Card>
          <CardHeader>
            <CardTitle>Assigned Agent</CardTitle>
          </CardHeader>
          {ticket.agent ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <InfoItem label="Name" value={ticket.agent.full_name} />
              <InfoItem label="Email" value={ticket.agent.email} />
              <InfoItem label="Phone" value={ticket.agent.phone || "—"} />
            </div>
          ) : (
            <p className="text-sm text-slate-500">Not yet assigned</p>
          )}
        </Card>
      )}

      {ticket.attachments && ticket.attachments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Attachments</CardTitle>
          </CardHeader>
          <ul className="space-y-2">
            {ticket.attachments.map((att) => (
              <li key={att.id}>
                <a
                  href={att.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  📎 {att.file_name}
                </a>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {!hideNotes && ticket.notes && ticket.notes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {ticket.notes.map((note) => (
              <div
                key={note.id}
                className="rounded-lg bg-slate-50 p-3 text-sm"
              >
                <p className="whitespace-pre-wrap text-slate-700">{note.note}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {note.author?.full_name || "Agent"} · {formatDate(note.created_at)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="text-sm text-slate-900">{value}</p>
    </div>
  );
}
