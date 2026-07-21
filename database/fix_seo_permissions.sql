-- 1. Sikre at tabellen bruker 'nokkelord' (med o) for å samsvare med React-koden hvis tabellen opprettes på nytt
-- Hvis tabellen allerede eksisterer med 'nøkkelord' (med ø), vil vi også prøve å endre kolonnenavnet.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='seo_innstillinger' AND column_name='nøkkelord'
  ) THEN
    ALTER TABLE seo_innstillinger RENAME COLUMN "nøkkelord" TO "nokkelord";
  END IF;
END $$;

-- 2. Aktiver Row Level Security (RLS) på seo_innstillinger-tabellen
ALTER TABLE seo_innstillinger ENABLE ROW LEVEL SECURITY;

-- 3. Rydd opp i eventuelle gamle policies for å unngå duplikater
DROP POLICY IF EXISTS "Public can read seo_innstillinger" ON seo_innstillinger;
DROP POLICY IF EXISTS "Admins can manage seo_innstillinger" ON seo_innstillinger;
DROP POLICY IF EXISTS "Public Read SEO" ON seo_innstillinger;
DROP POLICY IF EXISTS "Auth All SEO" ON seo_innstillinger;

-- 4. Opprett policy som tillater alle (inkl. anonyme besøkende) å lese SEO-innstillinger
-- Dette er kritisk for at nettsiden skal kunne vise meta-tags for Google-roboter
CREATE POLICY "Public Read SEO" ON seo_innstillinger 
  FOR SELECT USING (true);

-- 5. Opprett policy som tillater innloggede administratorer (som jan@mandalregnskapskontor.no)
-- å opprette, oppdatere og slette SEO-innstillinger
CREATE POLICY "Auth All SEO" ON seo_innstillinger 
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
