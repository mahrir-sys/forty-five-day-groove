CREATE TABLE public.translation_service_state (
 id boolean PRIMARY KEY DEFAULT true CHECK (id),
 paused_message text,
 paused_status integer,
 usage_date date NOT NULL DEFAULT CURRENT_DATE,
 request_count integer NOT NULL DEFAULT 0
);
GRANT ALL ON public.translation_service_state TO service_role;
ALTER TABLE public.translation_service_state ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.claim_translation_request() RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE current_state public.translation_service_state;
BEGIN
 INSERT INTO public.translation_service_state (id) VALUES (true) ON CONFLICT (id) DO NOTHING;
 SELECT * INTO current_state FROM public.translation_service_state WHERE id = true FOR UPDATE;
 IF current_state.paused_message IS NOT NULL THEN RETURN current_state.paused_message; END IF;
 IF current_state.usage_date = CURRENT_DATE AND current_state.request_count >= 100 THEN RETURN 'Translation daily limit reached. Please try again tomorrow.'; END IF;
 UPDATE public.translation_service_state SET usage_date = CURRENT_DATE,
 request_count = CASE WHEN usage_date = CURRENT_DATE THEN request_count + 1 ELSE 1 END WHERE id = true;
 RETURN NULL;
END; $$;
REVOKE ALL ON FUNCTION public.claim_translation_request() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_translation_request() TO service_role;