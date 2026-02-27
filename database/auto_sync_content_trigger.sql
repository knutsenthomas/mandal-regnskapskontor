-- Funksjon for å synkronisere data fra content-tabellen til content_blocks automatisk.
-- Denne funksjonen utløses når en rad i 'content' oppdateres eller settes inn.

CREATE OR REPLACE FUNCTION sync_content_to_blocks()
RETURNS trigger AS $$
BEGIN
    -- === HERO SEKSJON ===
    IF NEW.hero_title IS NOT NULL THEN
        PERFORM update_content_block('hero.title', NEW.hero_title, 'text');
    END IF;

    IF NEW.hero_subtitle IS NOT NULL THEN
        PERFORM update_content_block('hero.lines', NEW.hero_subtitle, 'text');
    END IF;

    IF NEW.hero_image IS NOT NULL THEN
        PERFORM update_content_block('hero.image', NEW.hero_image, 'text');
    END IF;

    -- === OM OSS SEKSJON ===
    IF NEW.about_text IS NOT NULL THEN
        PERFORM update_content_block('about.text', NEW.about_text, 'html');
    END IF;
    
    IF NEW.about_image IS NOT NULL THEN
        PERFORM update_content_block('about.image', NEW.about_image, 'text');
    END IF;
    
    IF NEW.about_values IS NOT NULL THEN
        PERFORM update_content_block('about.values', to_json(NEW.about_values)::text, 'json');
    END IF;

    -- === KONTAKT SEKSJON ===
    IF NEW.contact_phone IS NOT NULL THEN
        PERFORM update_content_block('contact.phone', NEW.contact_phone, 'text');
        PERFORM update_content_block('footer.phone', NEW.contact_phone, 'text');
    END IF;

    IF NEW.contact_email IS NOT NULL THEN
        PERFORM update_content_block('contact.email', NEW.contact_email, 'text');
        PERFORM update_content_block('footer.email', NEW.contact_email, 'text');
    END IF;

    IF NEW.contact_address IS NOT NULL THEN
        PERFORM update_content_block('contact.address', NEW.contact_address, 'text');
        PERFORM update_content_block('footer.address', NEW.contact_address, 'text');
    END IF;

    -- === FOOTER SEKSJON ===
    IF NEW.footer_text IS NOT NULL THEN
        PERFORM update_content_block('footer.companyDesc', NEW.footer_text, 'html');
    END IF;

    -- Returner selve raden for at selve UPDATE/INSERT-operasjonen skal fortsette som normalt
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Fjern den gamle triggeren hvis den finnes (for sikkerhetsskyld)
DROP TRIGGER IF EXISTS trigger_sync_content_to_blocks ON public.content;

-- Opprett triggeren. Etter enhver oppdatering eller innsetting i 'content'-tabellen,
-- vil den avfyre funksjonen vår som kopierer dataene over.
CREATE TRIGGER trigger_sync_content_to_blocks
AFTER INSERT OR UPDATE ON public.content
FOR EACH ROW
EXECUTE FUNCTION sync_content_to_blocks();
