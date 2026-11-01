ALTER TABLE public.push_devices ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'en' CHECK (language IN ('en','sv','fr'));
ALTER TABLE public.push_devices ADD COLUMN IF NOT EXISTS first_name text NOT NULL DEFAULT '' CHECK (char_length(first_name) <= 60);
ALTER TABLE public.push_devices ADD COLUMN IF NOT EXISTS last_lunch_reminded_on date;