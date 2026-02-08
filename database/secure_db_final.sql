-- 1. Enable Security (RLS)
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- 2. Clean up OLD policies (Drop everything to be safe)
DROP POLICY IF EXISTS "Public can read content" ON content;
DROP POLICY IF EXISTS "Admins can insert content" ON content;
DROP POLICY IF EXISTS "Admins can update content" ON content;
DROP POLICY IF EXISTS "Public Read Content" ON content;
DROP POLICY IF EXISTS "Auth Update Content" ON content;

DROP POLICY IF EXISTS "Public can read settings" ON site_settings;
DROP POLICY IF EXISTS "Admins can all on settings" ON site_settings;
DROP POLICY IF EXISTS "Public Read Settings" ON site_settings;
DROP POLICY IF EXISTS "Auth Update Settings" ON site_settings;

DROP POLICY IF EXISTS "Public can read calendar" ON calendar_events;
DROP POLICY IF EXISTS "Admins can all on calendar" ON calendar_events;
DROP POLICY IF EXISTS "Public Read Calendar" ON calendar_events;
DROP POLICY IF EXISTS "Auth Update Calendar" ON calendar_events;

DROP POLICY IF EXISTS "Public can insert messages" ON contact_messages;
DROP POLICY IF EXISTS "Admins can read messages" ON contact_messages;
DROP POLICY IF EXISTS "Public Send Messages" ON contact_messages;
DROP POLICY IF EXISTS "Auth Read Messages" ON contact_messages;

-- 3. Create NEW Policies (Explicit Permissions)

-- CONTENT: Public Read, Authenticated Edit
CREATE POLICY "Public Read Content" ON content FOR SELECT USING (true);
CREATE POLICY "Auth Insert Content" ON content FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth Update Content" ON content FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth Delete Content" ON content FOR DELETE USING (auth.role() = 'authenticated');

-- SETTINGS: Public Read, Authenticated Edit
CREATE POLICY "Public Read Settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Auth All Settings" ON site_settings FOR ALL USING (auth.role() = 'authenticated');

-- CALENDAR: Public Read, Authenticated Edit
CREATE POLICY "Public Read Calendar" ON calendar_events FOR SELECT USING (true);
CREATE POLICY "Auth All Calendar" ON calendar_events FOR ALL USING (auth.role() = 'authenticated');

-- MESSAGES: Public Send, Authenticated Read
CREATE POLICY "Public Send Messages" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth Read Messages" ON contact_messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth Update Messages" ON contact_messages FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth Delete Messages" ON contact_messages FOR DELETE USING (auth.role() = 'authenticated');
