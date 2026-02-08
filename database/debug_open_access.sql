-- DANGER: This disables security to test if permissions are the problem
-- Run this, try to save, and let the developer know if it worked.

ALTER TABLE content DISABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages DISABLE ROW LEVEL SECURITY;
