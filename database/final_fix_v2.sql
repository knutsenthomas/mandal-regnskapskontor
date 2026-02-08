-- FINAL FIX: Cleans up all permissions and sets them correctly.

-- 1. ADMIN USERS (Login) - Ensure this stays fixed
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Auth Read Admin Users" ON admin_users;
CREATE POLICY "Auth Read Admin Users" ON admin_users FOR SELECT TO authenticated USING (true);


-- 2. CONTENT (Saving Text/Images)
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
-- Drop ANY potential old policies
DROP POLICY IF EXISTS "Public can read content" ON content;
DROP POLICY IF EXISTS "Admins can insert content" ON content;
DROP POLICY IF EXISTS "Admins can update content" ON content;
DROP POLICY IF EXISTS "Public Read Content" ON content;
DROP POLICY IF EXISTS "Auth Update Content" ON content;
DROP POLICY IF EXISTS "Admin Full Content" ON content;
DROP POLICY IF EXISTS "Auth Insert Content" ON content;
DROP POLICY IF EXISTS "Auth Delete Content" ON content;

-- Create clean policies
CREATE POLICY "Public Read Content" ON content FOR SELECT TO public USING (true);
CREATE POLICY "Admin Write Content" ON content FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- 3. SITE SETTINGS (Analytics ID etc)
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read settings" ON site_settings;
DROP POLICY IF EXISTS "Admins can all on settings" ON site_settings;
DROP POLICY IF EXISTS "Public Read Settings" ON site_settings;
DROP POLICY IF EXISTS "Auth Update Settings" ON site_settings;
DROP POLICY IF EXISTS "Admin Full Settings" ON site_settings;
DROP POLICY IF EXISTS "Auth All Settings" ON site_settings;

CREATE POLICY "Public Read Settings" ON site_settings FOR SELECT TO public USING (true);
CREATE POLICY "Admin Write Settings" ON site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- 4. CALENDAR
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read calendar" ON calendar_events;
DROP POLICY IF EXISTS "Admins can all on calendar" ON calendar_events;
DROP POLICY IF EXISTS "Public Read Calendar" ON calendar_events;
DROP POLICY IF EXISTS "Auth Update Calendar" ON calendar_events;
DROP POLICY IF EXISTS "Admin Full Calendar" ON calendar_events;
DROP POLICY IF EXISTS "Auth All Calendar" ON calendar_events;

CREATE POLICY "Public Read Calendar" ON calendar_events FOR SELECT TO public USING (true);
CREATE POLICY "Admin Write Calendar" ON calendar_events FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- 5. MESSAGES
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can insert messages" ON contact_messages;
DROP POLICY IF EXISTS "Admins can read messages" ON contact_messages;
DROP POLICY IF EXISTS "Public Send Messages" ON contact_messages;
DROP POLICY IF EXISTS "Auth Read Messages" ON contact_messages;
DROP POLICY IF EXISTS "Admin Full Messages" ON contact_messages;

CREATE POLICY "Public Send Messages" ON contact_messages FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admin Write Messages" ON contact_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);
