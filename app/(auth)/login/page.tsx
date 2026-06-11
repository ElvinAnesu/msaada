import Link from "next/link";
import { LoginForm } from "@/components/forms/login-form";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold text-primary">
            Hesu Help Desk
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-600">
            Sign in to your account
          </p>
        </div>
        <Card>
          <LoginForm />
        </Card>
      </div>
    </div>
  );
}
