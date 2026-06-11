"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SessionUser, Ticket, Profile, Department, Category } from "@/lib/types";
import { adminNav } from "@/lib/admin-nav";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { TicketCard } from "@/components/tickets/ticket-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/states";

export default function AdminTickets({ user }: { user: SessionUser }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [agents, setAgents] = useState<Profile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    category: "",
    department_id: "",
    agent_id: "",
    search: "",
  });
  const [reassigning, setReassigning] = useState<string | null>(null);
  const [reopenId, setReopenId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/users/agents").then((r) => r.json()),
      fetch("/api/departments").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([agentsData, deptsData, catsData]) => {
      setAgents(agentsData.agents || []);
      setDepartments(deptsData.departments || []);
      setCategories(catsData.categories || []);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    fetch(`/api/tickets?${params}`)
      .then((r) => r.json())
      .then((data) => setTickets(data.tickets || []))
      .finally(() => setLoading(false));
  }, [filters]);

  async function handleReassign(ticketId: string, agentId: string) {
    setReassigning(ticketId);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reassign", agent_id: agentId }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to reassign");
        return;
      }
      toast.success("Ticket reassigned");
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? json.ticket : t))
      );
    } catch {
      toast.error("Failed to reassign");
    } finally {
      setReassigning(null);
    }
  }

  async function handleReopen(ticketId: string) {
    setReopenId(ticketId);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reopen" }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to reopen");
        return;
      }
      toast.success("Ticket reopened");
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? json.ticket : t))
      );
    } catch {
      toast.error("Failed to reopen");
    } finally {
      setReopenId(null);
    }
  }

  return (
    <DashboardLayout user={user} navItems={adminNav}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">All Tickets</h1>
        <p className="text-sm text-slate-600">Manage and monitor all support tickets</p>
      </div>

      <div className="mb-6 flex flex-wrap items-end gap-3 lg:flex-nowrap">
        <div className="w-full min-w-[200px] flex-[2] lg:w-auto">
          <Input
            label="Search"
            placeholder="Customer, ticket #, subject..."
            value={filters.search}
            onChange={(e) =>
              setFilters((f) => ({ ...f, search: e.target.value }))
            }
          />
        </div>
        <div className="min-w-[130px] flex-1">
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
        <div className="min-w-[130px] flex-1">
          <Select
            label="Priority"
            options={[
              { value: "", label: "All" },
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
              { value: "critical", label: "Critical" },
            ]}
            value={filters.priority}
            onChange={(e) =>
              setFilters((f) => ({ ...f, priority: e.target.value }))
            }
          />
        </div>
        <div className="min-w-[130px] flex-1">
          <Select
            label="Category"
            options={[
              { value: "", label: "All" },
              ...categories.map((c) => ({ value: c.name, label: c.name })),
            ]}
            value={filters.category}
            onChange={(e) =>
              setFilters((f) => ({ ...f, category: e.target.value }))
            }
          />
        </div>
        <div className="min-w-[130px] flex-1">
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
        </div>
        <div className="min-w-[130px] flex-1">
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
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-4">
          {tickets.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
              <p className="text-slate-500">No tickets found</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <TicketCard
                  ticket={ticket}
                  href={`/dashboard/admin/tickets/${ticket.id}`}
                  showAgent
                  showCustomer
                />
                <div className="mt-3 flex flex-wrap items-center gap-3 border-t pt-3">
                  <Select
                    options={[
                      { value: "", label: "Reassign to..." },
                      ...agents
                        .filter((a) => a.active)
                        .map((a) => ({ value: a.id, label: a.full_name })),
                    ]}
                    value=""
                    onChange={(e) => {
                      if (e.target.value) handleReassign(ticket.id, e.target.value);
                    }}
                    disabled={reassigning === ticket.id}
                  />
                  {ticket.status === "closed" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReopen(ticket.id)}
                      loading={reopenId === ticket.id}
                    >
                      Reopen
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
