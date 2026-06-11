import Link from "next/link";
import { Suspense } from "react";
import { RegisterForm } from "@/components/forms/register-form";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/states";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold text-primary">
            Hesu Help Desk
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Create account</h1>
          <p className="mt-1 text-sm text-slate-600">
            Register as a customer to submit and track tickets
          </p>
        </div>
        <Card>
          <Suspense fallback={<LoadingSpinner />}>
            <RegisterForm />
          </Suspense>
        </Card>
      </div>
    </div>
  );
}
