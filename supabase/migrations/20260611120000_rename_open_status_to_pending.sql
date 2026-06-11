ALTER TYPE ticket_status RENAME VALUE 'open' TO 'pending';
ALTER TABLE tickets ALTER COLUMN status SET DEFAULT 'pending';
