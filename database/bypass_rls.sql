-- PLAN B (FIXED): Bypass Table RLS using a Secure Function

-- 1. Create the function (Idempotent - OR REPLACE handles updates)
CREATE OR REPLACE FUNCTION update_hero_content(
    p_id UUID,
    p_title TEXT,
    p_subtitle TEXT,
    p_image TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- <--- THE MAGIC KEY: Runs as superuser
SET search_path = public
AS $$
DECLARE
    updated_row JSONB;
BEGIN
    -- 2. Update the table directly
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

-- 2. Allow logged-in users to execute this function
GRANT EXECUTE ON FUNCTION update_hero_content TO authenticated;

-- 3. Ensure public read access (Fixed: Drops old policy first to avoid error)
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Content" ON content; 
CREATE POLICY "Public Read Content" ON content FOR SELECT TO public USING (true);
