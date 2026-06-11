-- Convert any resolved rows to closed
UPDATE tickets SET status = 'closed' WHERE status = 'resolved';

-- Replace enum without 'resolved'
CREATE TYPE ticket_status_new AS ENUM (
  'pending', 'assigned', 'in_progress', 'escalated', 'closed'
);

ALTER TABLE tickets ALTER COLUMN status DROP DEFAULT;
ALTER TABLE tickets
  ALTER COLUMN status TYPE ticket_status_new
  USING status::text::ticket_status_new;

DROP TYPE ticket_status;
ALTER TYPE ticket_status_new RENAME TO ticket_status;
ALTER TABLE tickets ALTER COLUMN status SET DEFAULT 'pending'::ticket_status;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE ticket_messages;
