import { getSessionUser } from "@/lib/auth/session";
import { HelpDeskShell } from "@/components/layout/help-desk-shell";
import { SubmitTicketForm } from "@/components/forms/submit-ticket-form";
import { Card } from "@/components/ui/card";

export default async function SubmitTicketPage() {
  const user = await getSessionUser();
  const customer =
    user?.role === "customer" ? user : null;

  return (
    <HelpDeskShell breadcrumb="Submit a ticket">
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="mb-2 text-2xl font-normal text-primary">
          Submit a ticket
        </h1>
        <p className="mb-6 text-sm text-slate-600">
          {customer
            ? "Submit a new issue to your department."
            : "Enter your email and issue details. You must have a registered account."}
        </p>
        <Card>
          <SubmitTicketForm user={customer} />
        </Card>
      </div>
    </HelpDeskShell>
  );
}
