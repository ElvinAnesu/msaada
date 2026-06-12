"use client";

import Link from "next/link";
import { Ticket } from "@/lib/types";
import { formatDate, formatTicketNumber, formatCategoryLabel } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { PriorityBadge, StatusBadge } from "@/components/ui/states";

interface TicketCardProps {
  ticket: Ticket;
  href: string;
  showAgent?: boolean;
  showCustomer?: boolean;
  action?: React.ReactNode;
}

export function TicketCard({
  ticket,
  href,
  showAgent,
  showCustomer,
  action,
}: TicketCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="font-mono text-sm font-semibold text-primary">
          {formatTicketNumber(ticket.ticket_number)}
        </span>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <StatusBadge status={ticket.status} prominent />
          <PriorityBadge priority={ticket.priority} prominent />
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <Link href={href} className="min-w-0 flex-1">
          <h3 className="truncate text-base font-medium text-slate-900">
            {ticket.subject}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">
            {ticket.description}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>{formatCategoryLabel(ticket.category)}</span>
            {ticket.department && <span>{ticket.department.name}</span>}
            <span>{formatDate(ticket.created_at)}</span>
            {showCustomer && ticket.customer && (
              <span>Customer: {ticket.customer.full_name}</span>
            )}
            {showAgent && (
              <span>
                Agent: {ticket.agent?.full_name || "Unassigned"}
              </span>
            )}
          </div>
        </Link>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </Card>
  );
}

export function TicketList({
  tickets,
  hrefPrefix,
  showAgent,
  showCustomer,
  renderAction,
  emptyTitle = "No tickets yet",
  emptyDescription,
}: {
  tickets: Ticket[];
  hrefPrefix: string;
  showAgent?: boolean;
  showCustomer?: boolean;
  renderAction?: (ticket: Ticket) => React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
        <div className="mb-2 text-4xl">📭</div>
        <h3 className="text-lg font-medium text-slate-900">{emptyTitle}</h3>
        {emptyDescription && (
          <p className="mt-1 text-sm text-slate-500">{emptyDescription}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <TicketCard
          key={ticket.id}
          ticket={ticket}
          href={`${hrefPrefix}/${ticket.id}`}
          showAgent={showAgent}
          showCustomer={showCustomer}
          action={renderAction?.(ticket)}
        />
      ))}
    </div>
  );
}
