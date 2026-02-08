-- 1. Enable RLS (Ensure it is on)
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies to ensure clean slate
-- We use a DO block to loop through and drop policies to avoid "does not exist" errors cleanly
DO $$ 
DECLARE 
    r RECORD;
BEGIN 
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP 
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON "' || r.tablename || '";'; 
    END LOOP; 
END $$;

-- 3. Create Simplified "Admin Access" Policies (Authenticated Users get FULL access)

-- CONTENT
CREATE POLICY "Public Read Content" ON content FOR SELECT TO public USING (true);
CREATE POLICY "Admin Full Content" ON content FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- SITE SETTINGS
CREATE POLICY "Public Read Settings" ON site_settings FOR SELECT TO public USING (true);
CREATE POLICY "Admin Full Settings" ON site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- CALENDAR
CREATE POLICY "Public Read Calendar" ON calendar_events FOR SELECT TO public USING (true);
CREATE POLICY "Admin Full Calendar" ON calendar_events FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- MESSAGES
-- Public can ONLY insert (send messages)
CREATE POLICY "Public Send Messages" ON contact_messages FOR INSERT TO public WITH CHECK (true);
-- Admins can do everything (read, update, delete)
CREATE POLICY "Admin Full Messages" ON contact_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Check if PROFILES table exists and secure it too
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        -- Drop old policies on profiles manually here as the loop above handles it but good to be explicit
        -- (Loop handled it)
        
        -- Users can read/edit ONLY their own profile
        CREATE POLICY "User Own Profile" ON profiles FOR ALL TO authenticated 
        USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
    END IF;
END $$;
