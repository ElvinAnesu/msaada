"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SessionUser } from "@/lib/types";
import { agentNav } from "@/lib/agent-nav";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { LoadingSpinner } from "@/components/ui/states";
import { cn } from "@/lib/utils";

interface AgentStats {
  unassigned: number;
  my_open: number;
  my_closed: number;
  in_progress: number;
}

const statCards = [
  {
    key: "unassigned" as const,
    label: "Unassigned",
    href: "/dashboard/agent/unassigned",
    color: "border-amber-200 bg-amber-50 text-amber-900",
  },
  {
    key: "my_open" as const,
    label: "My Open",
    href: "/dashboard/agent/my-tickets",
    color: "border-teal-200 bg-teal-50 text-teal-900",
  },
  {
    key: "in_progress" as const,
    label: "In Progress",
    href: "/dashboard/agent/my-tickets",
    color: "border-purple-200 bg-purple-50 text-purple-900",
  },
  {
    key: "my_closed" as const,
    label: "My Closed",
    href: "/dashboard/agent/my-tickets",
    color: "border-slate-200 bg-slate-50 text-slate-900",
  },
];

export default function AgentDashboard({ user }: { user: SessionUser }) {
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/agents/stats")
      .then((r) => r.json())
      .then((data) => setStats(data.stats || null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout user={user} navItems={agentNav}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Agent Dashboard</h1>
        <p className="text-sm text-slate-600">Overview of your support queue</p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <Link
              key={card.key}
              href={card.href}
              className={cn(
                "rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md",
                card.color
              )}
            >
              <p className="text-sm font-medium opacity-80">{card.label}</p>
              <p className="mt-2 text-3xl font-bold">
                {stats?.[card.key] ?? 0}
              </p>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/agent/unassigned"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <h2 className="font-semibold text-slate-900">Unassigned Tickets</h2>
          <p className="mt-1 text-sm text-slate-600">
            View and pick up tickets waiting in the queue
          </p>
        </Link>
        <Link
          href="/dashboard/agent/my-tickets"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <h2 className="font-semibold text-slate-900">My Tickets</h2>
          <p className="mt-1 text-sm text-slate-600">
            Manage your open and closed assigned tickets
          </p>
        </Link>
      </div>
    </DashboardLayout>
  );
}
