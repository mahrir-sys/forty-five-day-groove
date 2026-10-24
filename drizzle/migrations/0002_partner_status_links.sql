CREATE TABLE public.partner_links (id uuid PRIMARY KEY, owner_hash text NOT NULL, read_token text NOT NULL UNIQUE, snapshot jsonb NOT NULL DEFAULT '{}'::jsonb, updated_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.partner_links TO service_role;
ALTER TABLE public.partner_links ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.read_partner_status(token text) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT jsonb_build_object('snapshot', snapshot, 'updatedAt', updated_at) FROM public.partner_links WHERE read_token = token AND updated_at > now() - interval '90 days' $$;
REVOKE ALL ON FUNCTION public.read_partner_status(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.read_partner_status(text) TO anon, authenticated, service_role;