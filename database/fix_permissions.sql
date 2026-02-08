-- Enable RLS on key tables
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- CONTENT TABLE POLICIES
DROP POLICY IF EXISTS "Public can read content" ON content;
CREATE POLICY "Public can read content" ON content FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert content" ON content;
CREATE POLICY "Admins can insert content" ON content FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can update content" ON content;
CREATE POLICY "Admins can update content" ON content FOR UPDATE USING (auth.role() = 'authenticated');

-- SITE_SETTINGS TABLE POLICIES
DROP POLICY IF EXISTS "Public can read settings" ON site_settings;
CREATE POLICY "Public can read settings" ON site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can all on settings" ON site_settings;
CREATE POLICY "Admins can all on settings" ON site_settings FOR ALL USING (auth.role() = 'authenticated');

-- CALENDAR TABLE POLICIES
DROP POLICY IF EXISTS "Public can read calendar" ON calendar_events;
CREATE POLICY "Public can read calendar" ON calendar_events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can all on calendar" ON calendar_events;
CREATE POLICY "Admins can all on calendar" ON calendar_events FOR ALL USING (auth.role() = 'authenticated');

-- CONTACT MESSAGES POLICIES
DROP POLICY IF EXISTS "Public can insert messages" ON contact_messages;
CREATE POLICY "Public can insert messages" ON contact_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read messages" ON contact_messages;
CREATE POLICY "Admins can read messages" ON contact_messages FOR SELECT USING (auth.role() = 'authenticated');

-- PROFILE POLICIES (Run this only if you have created the profiles table)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users can see and edit their own profile" ON profiles;
        CREATE POLICY "Users can see and edit their own profile" ON profiles
        FOR ALL USING (auth.uid() = id);
    END IF;
END $$;
