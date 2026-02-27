-- Skript for å legge til manglende kolonner i "content"-tabellen
-- slik at dashbordet for "Kontakt" og "Footer" fungerer riktig

ALTER TABLE public.content
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_address TEXT,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS footer_text TEXT;

RAISE NOTICE 'Kolonnene for kontakt og footer er nå lagt til i content-tabellen.';
