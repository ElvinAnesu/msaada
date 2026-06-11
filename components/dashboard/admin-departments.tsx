"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { SessionUser, Department } from "@/lib/types";
import { departmentSchema, DepartmentInput } from "@/lib/validations/schemas";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/states";

const adminNav = [
  { href: "/dashboard/admin", label: "Tickets", icon: "🎫" },
  { href: "/dashboard/admin/users", label: "Users", icon: "👥" },
  { href: "/dashboard/admin/customers", label: "Customers", icon: "👤" },
  { href: "/dashboard/admin/departments", label: "Departments", icon: "🏢" },
  { href: "/dashboard/admin/reports", label: "Reports", icon: "📊" },
];

export default function AdminDepartmentsPage({ user }: { user: SessionUser }) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Department | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DepartmentInput>({
    resolver: zodResolver(departmentSchema),
  });

  function loadDepartments() {
    fetch("/api/departments")
      .then((r) => r.json())
      .then((data) => setDepartments(data.departments || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadDepartments();
  }, []);

  async function onSubmit(data: DepartmentInput) {
    try {
      const url = editing
        ? `/api/departments/${editing.id}`
        : "/api/departments";
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to save department");
        return;
      }
      toast.success(editing ? "Department updated" : "Department created");
      reset();
      setEditing(null);
      loadDepartments();
    } catch {
      toast.error("Failed to save department");
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/departments/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to delete");
        return;
      }
      toast.success("Department deleted");
      loadDepartments();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(null);
    }
  }

  function startEdit(dept: Department) {
    setEditing(dept);
    setValue("name", dept.name);
  }

  return (
    <DashboardLayout user={user} navItems={adminNav}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Departments</h1>
        <p className="text-sm text-slate-600">Manage support departments</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{editing ? "Edit Department" : "Add Department"}</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Department Name"
              error={errors.name?.message}
              {...register("name")}
            />
            <div className="flex gap-3">
              <Button type="submit" loading={isSubmitting}>
                {editing ? "Update" : "Add"}
              </Button>
              {editing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditing(null);
                    reset();
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Departments</CardTitle>
          </CardHeader>
          {loading ? (
            <LoadingSpinner />
          ) : departments.length === 0 ? (
            <p className="text-sm text-slate-500">No departments yet</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {departments.map((dept) => (
                <li key={dept.id} className="flex items-center justify-between py-3">
                  <span className="font-medium text-slate-900">{dept.name}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => startEdit(dept)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(dept.id)}
                      loading={deleting === dept.id}
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
