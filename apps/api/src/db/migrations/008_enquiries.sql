CREATE TABLE enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  site text NOT NULL,
  brief text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX enquiries_created_idx ON enquiries (created_at DESC);
CREATE INDEX enquiries_unread_idx ON enquiries (created_at DESC) WHERE read_at IS NULL;
