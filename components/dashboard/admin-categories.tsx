"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { SessionUser, Category } from "@/lib/types";
import { categorySchema, CategoryInput } from "@/lib/validations/schemas";
import { adminNav } from "@/lib/admin-nav";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/states";

export default function AdminCategoriesPage({ user }: { user: SessionUser }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
  });

  function loadCategories() {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function onSubmit(data: CategoryInput) {
    try {
      const url = editing
        ? `/api/categories/${editing.id}`
        : "/api/categories";
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to save category");
        return;
      }
      toast.success(editing ? "Category updated" : "Category created");
      reset();
      setEditing(null);
      loadCategories();
    } catch {
      toast.error("Failed to save category");
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to delete");
        return;
      }
      toast.success("Category deleted");
      loadCategories();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(null);
    }
  }

  function startEdit(cat: Category) {
    setEditing(cat);
    setValue("name", cat.name);
  }

  return (
    <DashboardLayout user={user} navItems={adminNav}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
        <p className="text-sm text-slate-600">Manage ticket categories</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{editing ? "Edit Category" : "Add Category"}</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Category Name"
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
            <CardTitle>All Categories</CardTitle>
          </CardHeader>
          {loading ? (
            <LoadingSpinner />
          ) : categories.length === 0 ? (
            <p className="text-sm text-slate-500">No categories yet</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {categories.map((cat) => (
                <li key={cat.id} className="flex items-center justify-between py-3">
                  <span className="font-medium capitalize text-slate-900">
                    {cat.name}
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => startEdit(cat)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(cat.id)}
                      loading={deleting === cat.id}
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
