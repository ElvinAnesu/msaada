-- Applied via Supabase MCP: create_initial_schema

CREATE TYPE user_role AS ENUM ('customer', 'agent', 'admin');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE ticket_status AS ENUM ('open', 'assigned', 'in_progress', 'escalated', 'resolved', 'closed');

CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'customer',
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE SEQUENCE ticket_number_seq START WITH 1001;

CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number INTEGER NOT NULL DEFAULT nextval('ticket_number_seq') UNIQUE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  priority ticket_priority NOT NULL DEFAULT 'medium',
  status ticket_status NOT NULL DEFAULT 'open',
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ticket_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ticket_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
