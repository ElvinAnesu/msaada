"use client";

import { cn } from "@/lib/utils";
import { TicketPriority, TicketStatus } from "@/lib/types";
import {
  formatStatusLabel,
  priorityBadgeClass,
  statusBadgeClass,
} from "@/lib/utils";
import { Badge } from "./badge";

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <Badge className={statusBadgeClass(status)}>
      {formatStatusLabel(status)}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <Badge className={priorityBadgeClass(priority)}>{priority}</Badge>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
      <div className="mb-2 text-4xl">📭</div>
      <h3 className="text-lg font-medium text-slate-900">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center py-12", className)}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}
