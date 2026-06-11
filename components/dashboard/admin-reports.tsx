"use client";

import { useCallback, useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { SessionUser, Profile, Department } from "@/lib/types";
import { formatDate, formatTicketNumber } from "@/lib/utils";
import { adminNav } from "@/lib/admin-nav";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/states";

interface ReportRow {
  ticket_number: number;
  subject: string;
  customer_name: string;
  department: string;
  category: string;
  priority: string;
  status: string;
  assigned_agent: string;
  created_at: string;
  updated_at: string;
}

export default function AdminReportsPage({ user }: { user: SessionUser }) {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [agents, setAgents] = useState<Profile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    department_id: "",
    agent_id: "",
    status: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/users/agents").then((r) => r.json()),
      fetch("/api/departments").then((r) => r.json()),
    ]).then(([agentsData, deptsData]) => {
      setAgents(agentsData.agents || []);
      setDepartments(deptsData.departments || []);
    });
  }, []);

  const loadReports = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    try {
      const res = await fetch(`/api/reports?${params}`);
      const data = await res.json();
      setReports(data.reports || []);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  function exportToExcel() {
    const rows = reports.map((r) => ({
      "Ticket Number": formatTicketNumber(r.ticket_number),
      Subject: r.subject,
      "Customer Name": r.customer_name,
      Department: r.department,
      Category: r.category,
      Priority: r.priority,
      Status: r.status,
      "Assigned Agent": r.assigned_agent,
      "Created Date": formatDate(r.created_at),
      "Last Updated": formatDate(r.updated_at),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tickets Report");
    XLSX.writeFile(wb, `tickets-report-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  return (
    <DashboardLayout user={user} navItems={adminNav}>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="text-sm text-slate-600">Generate and export ticket reports</p>
        </div>
        <Button onClick={exportToExcel} disabled={reports.length === 0}>
          Export to Excel
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Start Date"
            type="date"
            value={filters.start_date}
            onChange={(e) =>
              setFilters((f) => ({ ...f, start_date: e.target.value }))
            }
          />
          <Input
            label="End Date"
            type="date"
            value={filters.end_date}
            onChange={(e) =>
              setFilters((f) => ({ ...f, end_date: e.target.value }))
            }
          />
          <Select
            label="Department"
            options={[
              { value: "", label: "All" },
              ...departments.map((d) => ({ value: d.id, label: d.name })),
            ]}
            value={filters.department_id}
            onChange={(e) =>
              setFilters((f) => ({ ...f, department_id: e.target.value }))
            }
          />
          <Select
            label="Agent"
            options={[
              { value: "", label: "All" },
              ...agents
                .filter((a) => a.active)
                .map((a) => ({ value: a.id, label: a.full_name })),
            ]}
            value={filters.agent_id}
            onChange={(e) =>
              setFilters((f) => ({ ...f, agent_id: e.target.value }))
            }
          />
          <Select
            label="Status"
            options={[
              { value: "", label: "All" },
              { value: "pending", label: "Pending" },
              { value: "assigned", label: "Assigned" },
              { value: "in_progress", label: "In Progress" },
              { value: "escalated", label: "Escalated" },
              { value: "closed", label: "Closed" },
            ]}
            value={filters.status}
            onChange={(e) =>
              setFilters((f) => ({ ...f, status: e.target.value }))
            }
          />
        </div>
        <div className="mt-4">
          <Button onClick={loadReports} loading={loading}>
            Apply Filters
          </Button>
        </div>
      </Card>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "Ticket #",
                  "Subject",
                  "Customer",
                  "Department",
                  "Category",
                  "Priority",
                  "Status",
                  "Agent",
                  "Created",
                  "Updated",
                ].map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap px-4 py-3 text-left font-medium text-slate-600"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                    No results found
                  </td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r.ticket_number} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-primary">
                      {formatTicketNumber(r.ticket_number)}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3">{r.subject}</td>
                    <td className="whitespace-nowrap px-4 py-3">{r.customer_name}</td>
                    <td className="whitespace-nowrap px-4 py-3">{r.department}</td>
                    <td className="whitespace-nowrap px-4 py-3">{r.category}</td>
                    <td className="whitespace-nowrap px-4 py-3 capitalize">{r.priority}</td>
                    <td className="whitespace-nowrap px-4 py-3 capitalize">
                      {r.status.replace(/_/g, " ")}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">{r.assigned_agent}</td>
                    <td className="whitespace-nowrap px-4 py-3">{formatDate(r.created_at)}</td>
                    <td className="whitespace-nowrap px-4 py-3">{formatDate(r.updated_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
