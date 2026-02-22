-- Table: content_blocks
CREATE TABLE IF NOT EXISTS content_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL, -- f.eks. 'hero.title', 'about.text', osv.
  content text NOT NULL,
  type text DEFAULT 'text', -- f.eks. 'text', 'html', 'markdown', 'json', etc.
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Function: update_content_block
CREATE OR REPLACE FUNCTION update_content_block(
  p_slug text,
  p_content text,
  p_type text DEFAULT 'text'
) RETURNS void AS $$
BEGIN
  INSERT INTO content_blocks (slug, content, type, updated_at)
  VALUES (p_slug, p_content, p_type, now())
  ON CONFLICT (slug) DO UPDATE
    SET content = EXCLUDED.content,
        type = EXCLUDED.type,
        updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- Policy: Allow authenticated users to update content_blocks
-- (tilpass etter behov)
