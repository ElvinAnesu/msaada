"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SessionUser } from "@/lib/types";
import { adminNav } from "@/lib/admin-nav";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { LoadingSpinner } from "@/components/ui/states";
import { cn } from "@/lib/utils";

interface AdminStats {
  total_tickets: number;
  pending: number;
  in_progress: number;
  closed: number;
  unassigned: number;
  customers: number;
  agents: number;
  categories: number;
}

const statCards = [
  {
    key: "total_tickets" as const,
    label: "Total Tickets",
    href: "/dashboard/admin/tickets",
    color: "border-slate-200 bg-slate-50 text-slate-900",
  },
  {
    key: "pending" as const,
    label: "Pending",
    href: "/dashboard/admin/tickets",
    color: "border-gray-200 bg-gray-50 text-gray-900",
  },
  {
    key: "unassigned" as const,
    label: "Unassigned",
    href: "/dashboard/admin/tickets",
    color: "border-amber-200 bg-amber-50 text-amber-900",
  },
  {
    key: "in_progress" as const,
    label: "In Progress",
    href: "/dashboard/admin/tickets",
    color: "border-purple-200 bg-purple-50 text-purple-900",
  },
  {
    key: "closed" as const,
    label: "Closed",
    href: "/dashboard/admin/tickets",
    color: "border-teal-200 bg-teal-50 text-teal-900",
  },
  {
    key: "customers" as const,
    label: "Customers",
    href: "/dashboard/admin/customers",
    color: "border-blue-200 bg-blue-50 text-blue-900",
  },
  {
    key: "agents" as const,
    label: "Agents",
    href: "/dashboard/admin/users",
    color: "border-indigo-200 bg-indigo-50 text-indigo-900",
  },
  {
    key: "categories" as const,
    label: "Categories",
    href: "/dashboard/admin/categories",
    color: "border-rose-200 bg-rose-50 text-rose-900",
  },
];

export default function AdminOverview({ user }: { user: SessionUser }) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => setStats(data.stats || null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout user={user} navItems={adminNav}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-sm text-slate-600">Overall system overview</p>
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

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/dashboard/admin/tickets"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <h2 className="font-semibold text-slate-900">All Tickets</h2>
          <p className="mt-1 text-sm text-slate-600">
            Search, filter, reassign, and manage tickets
          </p>
        </Link>
        <Link
          href="/dashboard/admin/categories"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <h2 className="font-semibold text-slate-900">Categories</h2>
          <p className="mt-1 text-sm text-slate-600">
            Add and manage ticket categories
          </p>
        </Link>
        <Link
          href="/dashboard/admin/reports"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <h2 className="font-semibold text-slate-900">Reports</h2>
          <p className="mt-1 text-sm text-slate-600">
            Export and review ticket reports
          </p>
        </Link>
      </div>
    </DashboardLayout>
  );
}
