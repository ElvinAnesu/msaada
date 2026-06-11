"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loginSchema, LoginInput } from "@/lib/validations/schemas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function LoginForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Login failed");
        return;
      }
      toast.success("Welcome back!");
      router.push(json.redirect);
      router.refresh();
    } catch {
      toast.error("Login failed");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Username"
        placeholder="Enter your username"
        error={errors.username?.message}
        {...register("username")}
      />
      <Input
        label="Password"
        type="password"
        placeholder="Enter your password"
        error={errors.password?.message}
        {...register("password")}
      />
      <Button type="submit" className="w-full" loading={isSubmitting}>
        Sign In
      </Button>
      <p className="text-center text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Register
        </Link>
      </p>
    </form>
  );
}
