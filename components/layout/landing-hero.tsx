"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HelpDeskShell } from "@/components/layout/help-desk-shell";

function ActionCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-1 items-center gap-4 rounded border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-white">
        {icon}
      </div>
      <div>
        <h3 className="text-base font-bold text-primary group-hover:underline sm:text-lg">
          {title}
        </h3>
        <p className="mt-0.5 text-sm text-slate-600">{description}</p>
      </div>
    </Link>
  );
}

export function LandingHero() {
  const [viewTicketsHref, setViewTicketsHref] = useState(
    "/login?redirect=/dashboard/customer"
  );
  const [viewTicketsDescription, setViewTicketsDescription] = useState(
    "Sign in to view tickets you submitted"
  );

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.user) return;
        if (data.user.role === "customer") {
          setViewTicketsHref("/dashboard/customer");
        } else {
          setViewTicketsHref("/dashboard");
        }
        setViewTicketsDescription("View tickets you submitted in the past");
      })
      .catch(() => {});
  }, []);

  return (
    <HelpDeskShell>
      <div className="flex flex-1 flex-col items-center justify-center">
        <h1 className="mb-10 text-center text-3xl font-normal text-primary sm:text-4xl">
          Hello, how can we help?
        </h1>

        <div className="flex w-full max-w-3xl flex-col gap-4 sm:flex-row">
          <ActionCard
            href="/submit-ticket"
            title="Submit a ticket"
            description="Submit a new issue to a department"
            icon={
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
          <ActionCard
            href={viewTicketsHref}
            title="View existing tickets"
            description={viewTicketsDescription}
            icon={
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
        </div>

        <Link
          href="/login"
          className="mt-10 text-sm font-medium text-primary hover:underline"
        >
          Login
        </Link>
      </div>
    </HelpDeskShell>
  );
}
