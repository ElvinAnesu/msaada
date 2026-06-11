import { TicketPriority, TicketStatus } from "./types";

export function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatTicketNumber(num: number): string {
  return `TKT-${num}`;
}

export const STATUS_ORDER: TicketStatus[] = [
  "pending",
  "assigned",
  "in_progress",
  "escalated",
  "closed",
];

export function isTicketClosed(status: TicketStatus): boolean {
  return status === "closed";
}

export function getNextStatus(current: TicketStatus): TicketStatus | null {
  const idx = STATUS_ORDER.indexOf(current);
  if (idx === -1 || idx >= STATUS_ORDER.length - 1) return null;
  return STATUS_ORDER[idx + 1];
}

export function getForwardStatusOptions(current: TicketStatus) {
  const idx = STATUS_ORDER.indexOf(current);
  if (idx === -1) return [];
  return STATUS_ORDER.slice(idx).map((status) => ({
    value: status,
    label: status.replace(/_/g, " "),
  }));
}

export function statusBadgeClass(status: TicketStatus): string {
  const map: Record<TicketStatus, string> = {
    pending: "bg-gray-100 text-gray-800 ring-gray-200",
    assigned: "bg-teal-100 text-teal-800 ring-teal-200",
    in_progress: "bg-purple-100 text-purple-800 ring-purple-200",
    escalated: "bg-amber-100 text-amber-800 ring-amber-200",
    closed: "bg-slate-100 text-slate-800 ring-slate-200",
  };
  return map[status];
}

export function priorityBadgeClass(priority: TicketPriority): string {
  const map: Record<TicketPriority, string> = {
    low: "bg-blue-100 text-blue-800 ring-blue-200",
    medium: "bg-yellow-100 text-yellow-800 ring-yellow-200",
    high: "bg-orange-100 text-orange-800 ring-orange-200",
    critical: "bg-red-100 text-red-800 ring-red-200",
  };
  return map[priority];
}

export function formatStatusLabel(status: TicketStatus): string {
  return status
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const DEFAULT_TICKET_CATEGORY = "Unclassified";

export function formatCategoryLabel(category: string): string {
  return category === DEFAULT_TICKET_CATEGORY ? "Not classified" : category;
}

