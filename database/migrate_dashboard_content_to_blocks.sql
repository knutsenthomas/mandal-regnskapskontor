-- Skript for å kopiere eksisterende data fra "content"-tabellen over til "content_blocks"
-- Dette scriptet forutsetter at funksjonen `update_content_block` eksisterer i databasen.

DO $$
DECLARE
    r RECORD;
BEGIN
    -- Hent den første (og antakelig eneste) raden fra content-tabellen
    SELECT * INTO r FROM public.content LIMIT 1;
    
    IF FOUND THEN
        RAISE NOTICE 'Fant data i content-tabellen. Starter kopiering...';

        -- === HERO SEKSJON ===
        IF r.hero_title IS NOT NULL THEN
            PERFORM update_content_block('hero.title', r.hero_title, 'text');
        END IF;

        IF r.hero_subtitle IS NOT NULL THEN
            PERFORM update_content_block('hero.lines', r.hero_subtitle, 'text');
        END IF;

        IF r.hero_image IS NOT NULL THEN
            PERFORM update_content_block('hero.image', r.hero_image, 'text');
        END IF;

        -- === OM OSS SEKSJON ===
        IF r.about_text IS NOT NULL THEN
            PERFORM update_content_block('about.text', r.about_text, 'html');
        END IF;
        
        IF r.about_image IS NOT NULL THEN
            PERFORM update_content_block('about.image', r.about_image, 'text');
        END IF;
        
        IF r.about_values IS NOT NULL THEN
            PERFORM update_content_block('about.values', to_json(r.about_values)::text, 'json');
        END IF;

        -- === KONTAKT SEKSJON ===
        IF r.phone IS NOT NULL THEN
            PERFORM update_content_block('contact.phone', r.phone, 'text');
            PERFORM update_content_block('footer.phone', r.phone, 'text');
        END IF;

        IF r.email IS NOT NULL THEN
            PERFORM update_content_block('contact.email', r.email, 'text');
            PERFORM update_content_block('footer.email', r.email, 'text');
        END IF;

        IF r.address IS NOT NULL THEN
            PERFORM update_content_block('contact.address', r.address, 'text');
            PERFORM update_content_block('footer.address', r.address, 'text');
        END IF;

        -- === FOOTER SEKSJON ===
        IF r.footer_text IS NOT NULL THEN
            PERFORM update_content_block('footer.companyDesc', r.footer_text, 'html');
        END IF;
        
        RAISE NOTICE 'Fullført! alt dynamisk innhold fra dashbordet (content table) er kopiert til content_blocks.';
    ELSE
        RAISE NOTICE 'Fant ingen data i content-tabellen. Avbryter.';
    END IF;
END;
$$;
