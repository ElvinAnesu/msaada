"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { SessionUser, Profile, Department } from "@/lib/types";
import { createAgentSchema, CreateAgentInput } from "@/lib/validations/schemas";
import { adminNav } from "@/lib/admin-nav";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/states";

export default function AdminUsersPage({ user }: { user: SessionUser }) {
  const [agents, setAgents] = useState<Profile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [deactivating, setDeactivating] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateAgentInput>({
    resolver: zodResolver(createAgentSchema),
  });

  function loadAgents() {
    fetch("/api/users/agents")
      .then((r) => r.json())
      .then((data) => setAgents(data.agents || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadAgents();
    fetch("/api/departments")
      .then((r) => r.json())
      .then((data) => setDepartments(data.departments || []));
  }, []);

  async function onSubmit(data: CreateAgentInput) {
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
      reset();
      loadAgents();
    } catch {
      toast.error("Failed to create agent");
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
      loadAgents();
    } catch {
      toast.error("Failed to deactivate");
    } finally {
      setDeactivating(null);
    }
  }

  return (
    <DashboardLayout user={user} navItems={adminNav}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <p className="text-sm text-slate-600">Manage support agents</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create Agent</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Username" error={errors.username?.message} {...register("username")} />
            <Input label="Full Name" error={errors.full_name?.message} {...register("full_name")} />
            <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
            <Input label="Phone" error={errors.phone?.message} {...register("phone")} />
            <Input label="Password" type="password" error={errors.password?.message} {...register("password")} />
            <Select
              label="Department"
              placeholder="Select department"
              options={departments.map((d) => ({ value: d.id, label: d.name }))}
              error={errors.department_id?.message}
              {...register("department_id")}
            />
            <Button type="submit" loading={isSubmitting}>Create Agent</Button>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agents</CardTitle>
          </CardHeader>
          {loading ? (
            <LoadingSpinner />
          ) : agents.length === 0 ? (
            <p className="text-sm text-slate-500">No agents yet</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {agents.map((agent) => (
                <li key={agent.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-slate-900">{agent.full_name}</p>
                    <p className="text-sm text-slate-500">@{agent.username}</p>
                    <p className="text-xs text-slate-400">
                      {agent.department?.name || "No department"} ·{" "}
                      {agent.active ? "Active" : "Inactive"}
                    </p>
                  </div>
                  {agent.active && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeactivate(agent.id)}
                      loading={deactivating === agent.id}
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
