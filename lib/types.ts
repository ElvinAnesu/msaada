export type UserRole = "customer" | "agent" | "admin";

export type TicketPriority = "low" | "medium" | "high" | "critical";

export type TicketStatus =
  | "pending"
  | "assigned"
  | "in_progress"
  | "escalated"
  | "closed";

export interface Profile {
  id: string;
  username: string;
  role: UserRole;
  full_name: string;
  email: string;
  phone: string | null;
  department_id: string | null;
  active: boolean;
  created_at: string;
  department?: Department | null;
}

export interface Department {
  id: string;
  name: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Ticket {
  id: string;
  ticket_number: number;
  subject: string;
  description: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  customer_id: string;
  agent_id: string | null;
  department_id: string | null;
  created_at: string;
  updated_at: string;
  customer?: Profile;
  agent?: Profile | null;
  department?: Department | null;
  notes?: TicketNote[];
  attachments?: TicketAttachment[];
}

export interface TicketNote {
  id: string;
  ticket_id: string;
  author_id: string | null;
  note: string;
  created_at: string;
  author?: Profile | null;
}

export interface TicketAttachment {
  id: string;
  ticket_id: string;
  file_url: string;
  file_name: string;
  uploaded_by: string | null;
  created_at: string;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  sender?: Pick<Profile, "id" | "full_name" | "role"> | null;
}

export type SessionUser = Profile;
