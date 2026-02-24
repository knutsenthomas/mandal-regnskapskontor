-- OPPDATERING FOR BRUKERADMINISTRASJON
-- Dette gir eksisterende administratorer rettighet til å legge til/fjerne andre fra listen.

-- Sørg for at RLS er på
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Fjern gamle begrensende regler
DROP POLICY IF EXISTS "Auth Read Admin Users" ON admin_users;
DROP POLICY IF EXISTS "Admin Manage Admin Users" ON admin_users;

-- 1. Alle innloggede kan LESE listen (nødvendig for selve innlogging-sjekken)
CREATE POLICY "Auth Read Admin Users" ON admin_users 
FOR SELECT 
TO authenticated 
USING (true);

-- 2. Kun brukere som ALLEREDE står i admin-listen kan LEGGE TIL eller SLETTE
-- Dette hindrer vanlige brukere (hvis de finnes) i å gi seg selv tilgang.
CREATE POLICY "Admin Manage Admin Users" ON admin_users 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM admin_users WHERE email = auth.jwt() ->> 'email'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users WHERE email = auth.jwt() ->> 'email'
  )
);
