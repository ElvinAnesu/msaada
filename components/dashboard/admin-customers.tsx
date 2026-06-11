"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { SessionUser, Profile, Department } from "@/lib/types";
import {
  updateCustomerSchema,
  UpdateCustomerInput,
} from "@/lib/validations/schemas";
import { adminNav } from "@/lib/admin-nav";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/states";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function AdminCustomersPage({ user }: { user: SessionUser }) {
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateCustomerInput>({
    resolver: zodResolver(updateCustomerSchema),
  });

  const loadCustomers = useCallback((searchTerm: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set("search", searchTerm.trim());

    fetch(`/api/users/customers?${params}`)
      .then((r) => r.json())
      .then((data) => setCustomers(data.customers || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadCustomers(search);
  }, [search, loadCustomers]);

  useEffect(() => {
    fetch("/api/departments")
      .then((r) => r.json())
      .then((data) => setDepartments(data.departments || []));
  }, []);

  function openEdit(customer: Profile) {
    setSelectedId(customer.id);
    reset({
      username: customer.username,
      full_name: customer.full_name,
      email: customer.email,
      phone: customer.phone || "",
      department_id: customer.department_id || "",
      password: "",
      confirm_password: "",
    });
  }

  async function onSubmit(data: UpdateCustomerInput) {
    if (!selectedId) return;

    const payload = { ...data };
    if (!payload.password?.trim()) {
      delete payload.password;
      delete payload.confirm_password;
    }

    try {
      const res = await fetch(`/api/users/customers/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to update customer");
        return;
      }
      toast.success("Customer updated");
      setCustomers((prev) =>
        prev.map((c) => (c.id === selectedId ? json.customer : c))
      );
      reset({
        ...data,
        password: "",
        confirm_password: "",
      });
    } catch {
      toast.error("Failed to update customer");
    }
  }

  const selectedCustomer = customers.find((c) => c.id === selectedId);

  return (
    <DashboardLayout user={user} navItems={adminNav}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
        <p className="text-sm text-slate-600">
          View and manage registered customers
        </p>
      </div>

      <div className="mb-6">
        <Input
          label="Search"
          placeholder="Name, username, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>All Customers ({customers.length})</CardTitle>
          </CardHeader>
          {loading ? (
            <LoadingSpinner />
          ) : customers.length === 0 ? (
            <p className="text-sm text-slate-500">No customers found</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {customers.map((customer) => (
                <li key={customer.id}>
                  <button
                    type="button"
                    onClick={() => openEdit(customer)}
                    className={cn(
                      "flex w-full items-center justify-between py-3 text-left transition-colors hover:bg-slate-50",
                      selectedId === customer.id && "bg-primary-light/40"
                    )}
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {customer.full_name}
                      </p>
                      <p className="text-sm text-slate-500">
                        @{customer.username}
                      </p>
                      <p className="text-xs text-slate-400">
                        {customer.email} ·{" "}
                        {customer.department?.name || "No department"} ·{" "}
                        {formatDate(customer.created_at)}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-primary">
                      Edit
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {selectedCustomer
                ? `Edit ${selectedCustomer.full_name}`
                : "Edit Customer"}
            </CardTitle>
          </CardHeader>
          {!selectedId ? (
            <p className="text-sm text-slate-500">
              Select a customer from the list to edit their details.
            </p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                error={errors.full_name?.message}
                {...register("full_name")}
              />
              <Input
                label="Username"
                error={errors.username?.message}
                {...register("username")}
              />
              <Input
                label="Email"
                type="email"
                error={errors.email?.message}
                {...register("email")}
              />
              <Input
                label="Phone"
                error={errors.phone?.message}
                {...register("phone")}
              />
              <Select
                label="Department"
                placeholder="Select department"
                options={departments.map((d) => ({
                  value: d.id,
                  label: d.name,
                }))}
                error={errors.department_id?.message}
                {...register("department_id")}
              />
              <Input
                label="New Password"
                type="password"
                placeholder="Leave blank to keep current password"
                error={errors.password?.message}
                {...register("password")}
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm new password"
                error={errors.confirm_password?.message}
                {...register("confirm_password")}
              />
              <Button type="submit" loading={isSubmitting}>
                Save changes
              </Button>
            </form>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
