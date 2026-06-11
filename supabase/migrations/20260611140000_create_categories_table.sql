CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO categories (name) VALUES
  ('system configuration'),
  ('system failure'),
  ('hardware configuration'),
  ('hardware failure'),
  ('network installation'),
  ('network maintenance'),
  ('incidence');
