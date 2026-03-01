-- Aktiverer RLS (Row Level Security) på de tre relevante tabellene
ALTER TABLE public.content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Fjerner gamle SELECT policies for sikkerhets skyld, for å unngå konflikter
DROP POLICY IF EXISTS "Public Read Content Blocks" ON public.content_blocks;
DROP POLICY IF EXISTS "Public Read Content" ON public.content;
DROP POLICY IF EXISTS "Public Read Settings" ON public.site_settings;

-- Oppretter nye policies som gir 100% anonym, offentlig lesetilgang
CREATE POLICY "Public Read Content Blocks" 
ON public.content_blocks 
FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Public Read Content" 
ON public.content 
FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Public Read Settings" 
ON public.site_settings 
FOR SELECT 
TO public 
USING (true);

-- Bekreftelse på at det ble kjørt
DO $$
BEGIN
  RAISE NOTICE 'RLS er nå konfigurert. Offentlig lesetilgang er åpnet for content_blocks, content og site_settings.';
END $$;
