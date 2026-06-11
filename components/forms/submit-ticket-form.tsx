"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  createTicketSchema,
  guestTicketSchema,
  CreateTicketInput,
  GuestTicketInput,
} from "@/lib/validations/schemas";
import { SessionUser } from "@/lib/types";
import { formatTicketNumber } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface SubmitTicketFormProps {
  user?: SessionUser | null;
}

export function SubmitTicketForm({ user }: SubmitTicketFormProps) {
  const router = useRouter();
  const isGuest = !user;
  const [files, setFiles] = useState<FileList | null>(null);
  const [registerPrompt, setRegisterPrompt] = useState<{ email: string } | null>(
    null
  );
  const [submittedTicket, setSubmittedTicket] = useState<{
    number: string;
    email: string;
  } | null>(null);

  const guestForm = useForm<GuestTicketInput>({
    resolver: zodResolver(guestTicketSchema),
    defaultValues: { priority: "medium", email: "" },
  });

  const authForm = useForm<CreateTicketInput>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: { priority: "medium" },
  });

  const errors = isGuest ? guestForm.formState.errors : authForm.formState.errors;
  const isSubmitting = isGuest
    ? guestForm.formState.isSubmitting
    : authForm.formState.isSubmitting;

  async function onSubmit(data: GuestTicketInput | CreateTicketInput) {
    setRegisterPrompt(null);
    try {
      const formData = new FormData();
      formData.append("priority", data.priority);
      formData.append("subject", data.subject);
      formData.append("description", data.description);

      let guestEmail = "";
      if (isGuest) {
        guestEmail = (data as GuestTicketInput).email;
        formData.append("email", guestEmail);
      }

      if (files) {
        Array.from(files).forEach((f) => formData.append("files", f));
      }

      const endpoint = isGuest ? "/api/tickets/guest" : "/api/tickets";
      const res = await fetch(endpoint, { method: "POST", body: formData });
      const json = await res.json();

      if (res.status === 404 && isGuest) {
        setRegisterPrompt({ email: guestEmail });
        return;
      }

      if (!res.ok) {
        toast.error(json.error || "Failed to submit ticket");
        return;
      }

      const ticketNum = formatTicketNumber(json.ticket.ticket_number);
      toast.success(`Ticket ${ticketNum} submitted successfully!`);

      if (isGuest) {
        setSubmittedTicket({ number: ticketNum, email: guestEmail });
        return;
      }

      router.push(`/dashboard/customer/tickets/${json.ticket.id}`);
      router.refresh();
    } catch {
      toast.error("Failed to submit ticket");
    }
  }

  if (user && !user.department_id) {
    return (
      <p className="text-sm text-red-600">
        Your account has no department assigned. Please contact support.
      </p>
    );
  }

  if (submittedTicket) {
    return (
      <Card className="text-center">
        <div className="mb-2 text-4xl">✅</div>
        <h3 className="text-lg font-semibold text-primary">Ticket Submitted</h3>
        <p className="mt-2 text-sm text-slate-600">
          Your ticket <strong>{submittedTicket.number}</strong> has been created.
        </p>
        <p className="mt-3 text-sm text-slate-500">
          Sign in to track the status of your tickets.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/login?redirect=/dashboard/customer">
            <Button>Sign in to track tickets</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {registerPrompt && (
        <Card className="border-amber-200 bg-amber-50">
          <h3 className="font-semibold text-amber-900">Registration required</h3>
          <p className="mt-1 text-sm text-amber-800">
            No account was found for{" "}
            <strong>{registerPrompt.email}</strong>. Please register before
            submitting a ticket.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/register?email=${encodeURIComponent(registerPrompt.email)}`}
            >
              <Button>Register Now</Button>
            </Link>
            <Button variant="outline" onClick={() => setRegisterPrompt(null)}>
              Use a different email
            </Button>
          </div>
        </Card>
      )}

      <form
        onSubmit={
          isGuest
            ? guestForm.handleSubmit(onSubmit)
            : authForm.handleSubmit(onSubmit)
        }
        className="space-y-4"
      >
        {isGuest && (
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={guestForm.formState.errors.email?.message}
            {...guestForm.register("email")}
          />
        )}

        {user?.department && (
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
            <span className="font-medium text-slate-700">Department: </span>
            <span className="text-slate-900">{user.department.name}</span>
          </div>
        )}

        <Select
          label="Priority"
          options={[
            { value: "low", label: "Low" },
            { value: "medium", label: "Medium" },
            { value: "high", label: "High" },
            { value: "critical", label: "Critical" },
          ]}
          error={errors.priority?.message}
          {...(isGuest
            ? guestForm.register("priority")
            : authForm.register("priority"))}
        />
        <Input
          label="Subject"
          placeholder="Brief summary of your issue"
          error={errors.subject?.message}
          {...(isGuest
            ? guestForm.register("subject")
            : authForm.register("subject"))}
        />
        <Textarea
          label="Description"
          placeholder="Describe your issue in detail..."
          error={errors.description?.message}
          {...(isGuest
            ? guestForm.register("description")
            : authForm.register("description"))}
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Attachments
          </label>
          <input
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt"
            onChange={(e) => setFiles(e.target.files)}
            className="w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-light file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary"
          />
        </div>
        <div className="flex gap-3">
          <Button type="submit" loading={isSubmitting}>
            Submit Ticket
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
