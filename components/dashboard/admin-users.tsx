"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { SessionUser, Profile, Department } from "@/lib/types";
import {
  createAgentSchema,
  createAdminSchema,
  CreateAgentInput,
  CreateAdminInput,
} from "@/lib/validations/schemas";
import { adminNav } from "@/lib/admin-nav";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/states";
import { cn } from "@/lib/utils";

export default function AdminUsersPage({ user }: { user: SessionUser }) {
  const [tab, setTab] = useState<"agents" | "admins">("agents");
  const [agents, setAgents] = useState<Profile[]>([]);
  const [admins, setAdmins] = useState<Profile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [deactivating, setDeactivating] = useState<string | null>(null);

  const agentForm = useForm<CreateAgentInput>({
    resolver: zodResolver(createAgentSchema),
  });

  const adminForm = useForm<CreateAdminInput>({
    resolver: zodResolver(createAdminSchema),
  });

  function loadUsers() {
    Promise.all([
      fetch("/api/users/agents").then((r) => r.json()),
      fetch("/api/users/admins").then((r) => r.json()),
    ])
      .then(([agentsData, adminsData]) => {
        setAgents(agentsData.agents || []);
        setAdmins(adminsData.admins || []);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadUsers();
    fetch("/api/departments")
      .then((r) => r.json())
      .then((data) => setDepartments(data.departments || []));
  }, []);

  async function onCreateAgent(data: CreateAgentInput) {
    try {
      const res = await fetch("/api/users/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to create agent");
        return;
      }
      toast.success("Agent created");
      agentForm.reset();
      loadUsers();
    } catch {
      toast.error("Failed to create agent");
    }
  }

  async function onCreateAdmin(data: CreateAdminInput) {
    try {
      const res = await fetch("/api/users/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to create admin");
        return;
      }
      toast.success("Admin created");
      adminForm.reset();
      loadUsers();
    } catch {
      toast.error("Failed to create admin");
    }
  }

  async function handleDeactivate(id: string) {
    setDeactivating(id);
    try {
      const res = await fetch(`/api/users/agents/${id}`, { method: "PATCH" });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to deactivate");
        return;
      }
      toast.success("Agent deactivated");
      loadUsers();
    } catch {
      toast.error("Failed to deactivate");
    } finally {
      setDeactivating(null);
    }
  }

  const list = tab === "agents" ? agents : admins;

  return (
    <DashboardLayout user={user} navItems={adminNav}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <p className="text-sm text-slate-600">Manage agents and administrators</p>
      </div>

      <div className="mb-6 flex gap-2 border-b border-slate-200">
        {(["agents", "admins"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 text-sm font-medium capitalize transition-colors",
              tab === t
                ? "border-b-2 border-primary text-primary"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{tab === "agents" ? "Create Agent" : "Create Admin"}</CardTitle>
          </CardHeader>
          {tab === "agents" ? (
            <form onSubmit={agentForm.handleSubmit(onCreateAgent)} className="space-y-4">
              <Input label="Username" error={agentForm.formState.errors.username?.message} {...agentForm.register("username")} />
              <Input label="Full Name" error={agentForm.formState.errors.full_name?.message} {...agentForm.register("full_name")} />
              <Input label="Email" type="email" error={agentForm.formState.errors.email?.message} {...agentForm.register("email")} />
              <Input label="Phone" error={agentForm.formState.errors.phone?.message} {...agentForm.register("phone")} />
              <Input label="Password" type="password" error={agentForm.formState.errors.password?.message} {...agentForm.register("password")} />
              <Select
                label="Department"
                placeholder="Select department"
                options={departments.map((d) => ({ value: d.id, label: d.name }))}
                error={agentForm.formState.errors.department_id?.message}
                {...agentForm.register("department_id")}
              />
              <Button type="submit" loading={agentForm.formState.isSubmitting}>Create Agent</Button>
            </form>
          ) : (
            <form onSubmit={adminForm.handleSubmit(onCreateAdmin)} className="space-y-4">
              <Input label="Username" error={adminForm.formState.errors.username?.message} {...adminForm.register("username")} />
              <Input label="Full Name" error={adminForm.formState.errors.full_name?.message} {...adminForm.register("full_name")} />
              <Input label="Email" type="email" error={adminForm.formState.errors.email?.message} {...adminForm.register("email")} />
              <Input label="Phone" error={adminForm.formState.errors.phone?.message} {...adminForm.register("phone")} />
              <Input label="Password" type="password" error={adminForm.formState.errors.password?.message} {...adminForm.register("password")} />
              <Button type="submit" loading={adminForm.formState.isSubmitting}>Create Admin</Button>
            </form>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{tab === "agents" ? "Agents" : "Admins"}</CardTitle>
          </CardHeader>
          {loading ? (
            <LoadingSpinner />
          ) : list.length === 0 ? (
            <p className="text-sm text-slate-500">No {tab} yet</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {list.map((person) => (
                <li key={person.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-slate-900">{person.full_name}</p>
                    <p className="text-sm text-slate-500">@{person.username}</p>
                    <p className="text-xs text-slate-400">
                      {person.role === "agent"
                        ? `${person.department?.name || "No department"} · `
                        : ""}
                      {person.active ? "Active" : "Inactive"}
                      {person.id === user.id ? " · You" : ""}
                    </p>
                  </div>
                  {tab === "agents" && person.active && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeactivate(person.id)}
                      loading={deactivating === person.id}
                    >
                      Deactivate
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
