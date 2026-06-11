"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Department } from "@/lib/types";
import { registerSchema, RegisterInput } from "@/lib/validations/schemas";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/states";
import Link from "next/link";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [deptError, setDeptError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { department_id: "", email: "" },
  });

  useEffect(() => {
    const email = searchParams.get("email");
    if (email) setValue("email", email);
  }, [searchParams, setValue]);

  useEffect(() => {
    fetch("/api/departments")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) {
          setDeptError(data.error || "Failed to load departments");
          return;
        }
        setDepartments(data.departments || []);
      })
      .catch(() => setDeptError("Failed to load departments"))
      .finally(() => setLoadingDepts(false));
  }, []);

  async function onSubmit(data: RegisterInput) {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Registration failed");
        return;
      }
      toast.success("Account created successfully!");
      router.push(json.redirect);
      router.refresh();
    } catch {
      toast.error("Registration failed");
    }
  }

  if (loadingDepts) return <LoadingSpinner />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Input
        label="Username"
        placeholder="Choose a username"
        error={errors.username?.message}
        {...register("username")}
      />
      <Input
        label="Full Name"
        placeholder="Your full name"
        error={errors.full_name?.message}
        {...register("full_name")}
      />
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        label="Phone Number"
        placeholder="+254..."
        error={errors.phone?.message}
        {...register("phone")}
      />
      <div className="sm:col-span-2">
        <Controller
          name="department_id"
          control={control}
          render={({ field }) => (
            <Combobox
              label="Department"
              placeholder="Search and select your department"
              options={departments.map((d) => ({
                value: d.id,
                label: d.name,
              }))}
              value={field.value}
              onChange={field.onChange}
              error={
                errors.department_id?.message ||
                deptError ||
                (departments.length === 0 ? "No departments available" : undefined)
              }
              disabled={departments.length === 0}
              emptyMessage="No matching departments"
            />
          )}
        />
      </div>
      <Input
        label="Password"
        type="password"
        placeholder="Create a password"
        error={errors.password?.message}
        {...register("password")}
      />
      <Input
        label="Confirm Password"
        type="password"
        placeholder="Confirm your password"
        error={errors.confirm_password?.message}
        {...register("confirm_password")}
      />
      <div className="sm:col-span-2">
        <Button
          type="submit"
          className="w-full"
          loading={isSubmitting}
          disabled={departments.length === 0}
        >
          Create Account
        </Button>
      </div>
      <p className="text-center text-sm text-slate-600 sm:col-span-2">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Login
        </Link>
      </p>
    </form>
  );
}
