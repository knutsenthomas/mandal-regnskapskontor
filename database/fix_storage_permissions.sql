-- 1. Sørg for at 'images' bucket er konfigurert riktig (HVIS den ikke finnes fra før)
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('images', 'images', true)
-- ON CONFLICT (id) DO NOTHING;

-- 2. Fjern gamle regler hvis de finnes for å unngå konflikter
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;

-- 3. Tillat alle å se bilder (trengs for at nettsiden skal vise logoen)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'images' );

-- 4. Tillat innloggede administratorer å laste opp nye bilder
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'images' );

-- 5. Tillat innloggede administratorer å endre eksisterende bilder
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'images' );

-- 6. Tillat innloggede administratorer å slette bilder
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'images' );
