import { SessionUser } from "@/lib/types";
import { SubmitTicketForm } from "@/components/forms/submit-ticket-form";

interface NewTicketFormProps {
  user: SessionUser;
}

export function NewTicketForm({ user }: NewTicketFormProps) {
  return <SubmitTicketForm user={user} />;
}
