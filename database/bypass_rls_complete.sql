-- COMPLETE BYPASS RLS SCRIPT
-- This creates secure functions for ALL parts of the admin panel.

-- 1. HERO (Already exists, but included for completeness)
CREATE OR REPLACE FUNCTION update_hero_content(
    p_id UUID,
    p_title TEXT,
    p_subtitle TEXT,
    p_image TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    updated_row JSONB;
BEGIN
    UPDATE content
    SET 
        hero_title = p_title,
        hero_subtitle = p_subtitle,
        hero_image = p_image
    WHERE id = p_id
    RETURNING to_jsonb(content.*) INTO updated_row;
    RETURN updated_row;
END;
$$;
GRANT EXECUTE ON FUNCTION update_hero_content TO authenticated;

-- 2. SERVICES (JSON Data)
CREATE OR REPLACE FUNCTION update_services_content(
    p_id UUID,
    p_services JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    updated_row JSONB;
BEGIN
    UPDATE content
    SET services_data = p_services
    WHERE id = p_id
    RETURNING to_jsonb(content.*) INTO updated_row;
    RETURN updated_row;
END;
$$;
GRANT EXECUTE ON FUNCTION update_services_content TO authenticated;

-- 3. GENERAL SETTINGS (Logo)
CREATE OR REPLACE FUNCTION update_general_content(
    p_id UUID,
    p_logo_url TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    updated_row JSONB;
BEGIN
    UPDATE content
    SET logo_url = p_logo_url
    WHERE id = p_id
    RETURNING to_jsonb(content.*) INTO updated_row;
    RETURN updated_row;
END;
$$;
GRANT EXECUTE ON FUNCTION update_general_content TO authenticated;

-- 3b. ABOUT (Text, Image, Values)
CREATE OR REPLACE FUNCTION update_about_content(
    p_id UUID,
    p_text TEXT,
    p_image TEXT,
    p_values JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    updated_row JSONB;
BEGIN
    UPDATE content
    SET
        about_text = p_text,
        about_image = p_image,
        about_values = p_values
    WHERE id = p_id
    RETURNING to_jsonb(content.*) INTO updated_row;
    RETURN updated_row;
END;
$$;
GRANT EXECUTE ON FUNCTION update_about_content TO authenticated;

-- 4. SITE SETTINGS (Analytics ID etc)
CREATE OR REPLACE FUNCTION upsert_site_setting(
    p_key TEXT,
    p_value TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    updated_row JSONB;
BEGIN
    INSERT INTO site_settings (key, value)
    VALUES (p_key, p_value)
    ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value
    RETURNING to_jsonb(site_settings.*) INTO updated_row;
    RETURN updated_row;
END;
$$;
GRANT EXECUTE ON FUNCTION upsert_site_setting TO authenticated;

-- 5. SERVICE DETAILS (Upsert)
CREATE OR REPLACE FUNCTION upsert_service_details(
    p_service_id TEXT,
    p_extended_description TEXT,
    p_target_audience TEXT,
    p_offerings JSONB,
    p_process_steps JSONB,
    p_pricing_packages JSONB,
    p_faqs JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    updated_row JSONB;
BEGIN
    INSERT INTO service_details (
        service_id,
        extended_description,
        target_audience,
        offerings,
        process_steps,
        pricing_packages,
        faqs
    )
    VALUES (
        p_service_id,
        p_extended_description,
        p_target_audience,
        p_offerings,
        p_process_steps,
        p_pricing_packages,
        p_faqs
    )
    ON CONFLICT (service_id) DO UPDATE
    SET
        extended_description = EXCLUDED.extended_description,
        target_audience = EXCLUDED.target_audience,
        offerings = EXCLUDED.offerings,
        process_steps = EXCLUDED.process_steps,
        pricing_packages = EXCLUDED.pricing_packages,
        faqs = EXCLUDED.faqs
    RETURNING to_jsonb(service_details.*) INTO updated_row;
    RETURN updated_row;
END;
$$;
GRANT EXECUTE ON FUNCTION upsert_service_details TO authenticated;

-- 5. Fix Public Read Access one last time (just to be safe)
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Content" ON content;
CREATE POLICY "Public Read Content" ON content FOR SELECT TO public USING (true);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Settings" ON site_settings;
CREATE POLICY "Public Read Settings" ON site_settings FOR SELECT TO public USING (true);
