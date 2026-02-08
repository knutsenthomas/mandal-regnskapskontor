-- FIXED: This script avoids the "ON CONFLICT" error by checking existence manually.

-- 1. Make sure RLS is on
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 2. Allow authenticated users to read the admin list (so login check works)
DROP POLICY IF EXISTS "Auth Read Admin Users" ON admin_users;
CREATE POLICY "Auth Read Admin Users" ON admin_users FOR SELECT TO authenticated USING (true);

-- 3. Insert current user ONLY if they aren't already there
-- We use WHERE NOT EXISTS instead of ON CONFLICT to avoid errors if your table setup is slightly different.
INSERT INTO admin_users (email)
SELECT auth.jwt() ->> 'email' 
WHERE auth.jwt() ->> 'email' IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM admin_users WHERE email = (auth.jwt() ->> 'email')
);
