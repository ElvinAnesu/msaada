"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { SessionUser } from "@/lib/types";
import { adminNav } from "@/lib/admin-nav";
import { useRealtimeStream } from "@/lib/hooks/use-realtime-stream";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "@/components/ui/bar-chart";
import { DonutChart } from "@/components/ui/donut-chart";
import { LoadingSpinner } from "@/components/ui/states";
import { cn } from "@/lib/utils";

interface AdminStats {
  total_tickets: number;
  open_tickets: number;
  closed_tickets: number;
  unassigned: number;
  customers: number;
  agents: number;
  admins: number;
  categories: number;
}

interface TopAgent {
  id: string;
  full_name: string;
  open: number;
  closed: number;
  total: number;
}

interface DashboardData {
  stats: AdminStats;
  tickets_by_status: { label: string; value: number; color: string }[];
  tickets_by_priority: { label: string; value: number; color: string }[];
  tickets_by_category: { label: string; value: number }[];
  tickets_last_7_days: { label: string; value: number }[];
  top_agents: TopAgent[];
}

const statCards = [
  { key: "open_tickets" as const, label: "Open Tickets", href: "/dashboard/admin/tickets", color: "border-teal-200 bg-teal-50 text-teal-900" },
  { key: "closed_tickets" as const, label: "Closed Tickets", href: "/dashboard/admin/tickets", color: "border-slate-200 bg-slate-50 text-slate-900" },
  { key: "unassigned" as const, label: "Unassigned", href: "/dashboard/admin/tickets", color: "border-amber-200 bg-amber-50 text-amber-900" },
  { key: "total_tickets" as const, label: "Total Tickets", href: "/dashboard/admin/tickets", color: "border-indigo-200 bg-indigo-50 text-indigo-900" },
  { key: "customers" as const, label: "Customers", href: "/dashboard/admin/customers", color: "border-blue-200 bg-blue-50 text-blue-900" },
  { key: "agents" as const, label: "Agents", href: "/dashboard/admin/users", color: "border-purple-200 bg-purple-50 text-purple-900" },
  { key: "admins" as const, label: "Admins", href: "/dashboard/admin/users", color: "border-rose-200 bg-rose-50 text-rose-900" },
  { key: "categories" as const, label: "Categories", href: "/dashboard/admin/categories", color: "border-orange-200 bg-orange-50 text-orange-900" },
];

export default function AdminOverview({ user }: { user: SessionUser }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((json) => {
        if (json.stats) setData(json as DashboardData);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useRealtimeStream((event) => {
    if (event.table === "tickets") loadDashboard();
  });

  return (
    <DashboardLayout user={user} navItems={adminNav}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-sm text-slate-600">Live overview of support operations</p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-6">
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
                  {data?.stats[card.key] ?? 0}
                </p>
              </Link>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tickets by Status</CardTitle>
              </CardHeader>
              <DonutChart
                data={(data?.tickets_by_status || [])
                  .filter((s) => s.value > 0)
                  .map((s) => ({
                    label: s.label,
                    value: s.value,
                    color: s.color,
                  }))}
              />
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tickets by Priority</CardTitle>
              </CardHeader>
              <BarChart
                data={(data?.tickets_by_priority || []).map((p) => ({
                  label: p.label,
                  value: p.value,
                  color: p.color,
                }))}
              />
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>New Tickets — Last 7 Days</CardTitle>
              </CardHeader>
              <BarChart
                data={(data?.tickets_last_7_days || []).map((d) => ({
                  label: d.label,
                  value: d.value,
                  color: "bg-primary",
                }))}
              />
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tickets by Category</CardTitle>
              </CardHeader>
              <BarChart
                data={(data?.tickets_by_category || []).map((c) => ({
                  label: c.label,
                  value: c.value,
                  color: "bg-indigo-500",
                }))}
              />
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Agents</CardTitle>
            </CardHeader>
            {data?.top_agents && data.top_agents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3">Agent</th>
                      <th className="px-4 py-3 text-right">Open</th>
                      <th className="px-4 py-3 text-right">Closed</th>
                      <th className="px-4 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.top_agents.map((agent, i) => (
                      <tr key={agent.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <span className="mr-2 font-mono text-xs text-slate-400">
                            #{i + 1}
                          </span>
                          <span className="font-medium text-slate-900">
                            {agent.full_name}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-teal-700">
                          {agent.open}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600">
                          {agent.closed}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-900">
                          {agent.total}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No agent assignments yet</p>
            )}
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
