-- 1. Ensure `content` table exists
CREATE TABLE IF NOT EXISTS content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_image TEXT,
  services_data JSONB DEFAULT '[]'::jsonb,
  logo_url TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  about_title TEXT,
  about_text TEXT,
  about_image TEXT,
  footer_text TEXT,
  facebook_url TEXT,
  linkedin_url TEXT
);

-- 2. Ensure `site_settings` table exists
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Ensure `calendar_events` table exists
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  description TEXT,
  location TEXT,
  is_all_day BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Ensure `contact_messages` table exists
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    navn TEXT,
    bedriftsnavn TEXT,
    epost TEXT,
    telefon TEXT,
    melding TEXT,
    lest BOOLEAN DEFAULT FALSE
);

-- 5. Insert default content if empty
INSERT INTO content (hero_title, hero_subtitle, services_data)
SELECT 'Mandal Regnskapskontor AS', 'Din partner for profesjonell regnskap', '[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM content);

-- 6. Insert default settings if empty
INSERT INTO site_settings (key, value)
VALUES ('google_analytics_id', '')
ON CONFLICT (key) DO NOTHING;

-- 7. ENABLE RLS
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- 8. POLICIES (Idempotent)
-- Content
DROP POLICY IF EXISTS "Public can read content" ON content;
CREATE POLICY "Public can read content" ON content FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert content" ON content;
CREATE POLICY "Admins can insert content" ON content FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can update content" ON content;
CREATE POLICY "Admins can update content" ON content FOR UPDATE USING (auth.role() = 'authenticated');

-- Settings
DROP POLICY IF EXISTS "Public can read settings" ON site_settings;
CREATE POLICY "Public can read settings" ON site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can all on settings" ON site_settings;
CREATE POLICY "Admins can all on settings" ON site_settings FOR ALL USING (auth.role() = 'authenticated');

-- Calendar
DROP POLICY IF EXISTS "Public can read calendar" ON calendar_events;
CREATE POLICY "Public can read calendar" ON calendar_events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can all on calendar" ON calendar_events;
CREATE POLICY "Admins can all on calendar" ON calendar_events FOR ALL USING (auth.role() = 'authenticated');

-- Messages
DROP POLICY IF EXISTS "Public can insert messages" ON contact_messages;
CREATE POLICY "Public can insert messages" ON contact_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read messages" ON contact_messages;
CREATE POLICY "Admins can read messages" ON contact_messages FOR SELECT USING (auth.role() = 'authenticated');
