-- Sender keys for evening reminder notifications (single row, created on first use by the server).
CREATE TABLE public.push_keys (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  public_key text NOT NULL,
  private_jwk jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.push_keys TO service_role;
ALTER TABLE public.push_keys ENABLE ROW LEVEL SECURITY;

-- One row per phone/browser that turned on evening reminders. No login: the device proves
-- ownership with a secret whose hash is stored here.
CREATE TABLE public.push_devices (
  id uuid PRIMARY KEY,
  secret_hash text NOT NULL,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  timezone text NOT NULL DEFAULT 'Europe/Stockholm',
  start_date date,
  challenge_count integer NOT NULL DEFAULT 0,
  checked_dates date[] NOT NULL DEFAULT '{}',
  last_reminded_on date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.push_devices TO service_role;
ALTER TABLE public.push_devices ENABLE ROW LEVEL SECURITY;
-- No policies: only server code (service role) can read or write these tables.