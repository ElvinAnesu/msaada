"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SessionUser, Ticket } from "@/lib/types";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { TicketList } from "@/components/tickets/ticket-card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/states";

const customerNav = [
  { href: "/dashboard/customer", label: "My Tickets", icon: "🎫" },
  { href: "/dashboard/customer/new", label: "New Ticket", icon: "➕" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "assigned", label: "Assigned" },
  { value: "in_progress", label: "In Progress" },
  { value: "escalated", label: "Escalated" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

export default function CustomerDashboard({ user }: { user: SessionUser }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    fetch(`/api/tickets?${params}`)
      .then((r) => r.json())
      .then((data) => setTickets(data.tickets || []))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <DashboardLayout user={user} navItems={customerNav}>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Tickets</h1>
          <p className="text-sm text-slate-600">Track and manage your support requests</p>
        </div>
        <Link href="/dashboard/customer/new">
          <Button>New Ticket</Button>
        </Link>
      </div>

      <div className="mb-6 max-w-xs">
        <Select
          label="Filter by status"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <TicketList
          tickets={tickets}
          hrefPrefix="/dashboard/customer/tickets"
          emptyTitle="No tickets yet"
          emptyDescription="Submit your first support ticket to get started"
        />
      )}
    </DashboardLayout>
  );
}
