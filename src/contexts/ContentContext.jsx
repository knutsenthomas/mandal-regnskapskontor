import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/customSupabaseClient';

export const ContentContext = createContext({});
const DASHBOARD_MANAGED_SLUGS = new Set([
  'hero.title',
  'hero.lines',
  'hero.image',
  'about.text',
  'about.image',
  'about.values',
  'contact.phone',
  'contact.email',
  'contact.address',
  'footer.phone',
  'footer.email',
  'footer.address',
  'footer.hoursWeek',
]);

const hasValue = (value) => (
  Array.isArray(value)
    ? value.length > 0
    : typeof value === 'string'
      ? value !== ''
      : Boolean(value)
);

export function ContentProvider({ children }) {
  const [blocks, setBlocks] = useState({});
  const [dashboardContent, setDashboardContent] = useState(null);
  const [loading, setLoading] = useState(true);

  const getDashboardFallback = useCallback((slug) => {
    switch (slug) {
      case 'hero.title':
        return dashboardContent?.hero_title || 'Mandal Regnskapskontor';
      case 'hero.lines':
        return dashboardContent?.hero_lines ?? dashboardContent?.hero_subtitle ?? 'Din partner for profesjonell regnskap';
      case 'hero.image':
        return dashboardContent?.hero_image || '';

      case 'about.text':
        return dashboardContent?.about_text || 'Mandal regnskapskontor er et regnskapskontor med lang erfaring. Vi har tjenester som regnskap, lønn, fakturering og årsoppgjør – kombinert med operativ lederstøtte og praktisk hjelp der du trenger det.';
      case 'about.image':
        return dashboardContent?.about_image || '';
      case 'about.values':
        return dashboardContent?.about_values ?? [];

      case 'contact.phone':
        return dashboardContent?.contact_phone || '91 75 98 55';
      case 'contact.email':
        return dashboardContent?.contact_email || 'jan@mandalregnskapskontor.no';
      case 'contact.address':
        return dashboardContent?.contact_address || 'Gamle Hålandsbakken 8, 4517 Mandal';

      case 'footer.companyName':
        return dashboardContent?.company_name || 'Mandal Regnskapskontor';
      case 'footer.companyDesc':
        return dashboardContent?.footer_text || 'Autorisert regnskapsfører';
      case 'footer.quicklinksLabel':
        return 'Hurtiglenker';
      case 'footer.contactLabel':
        return 'Kontakt Oss';
      case 'footer.phone':
        return dashboardContent?.contact_phone || dashboardContent?.phone || '91 75 98 55';
      case 'footer.email':
        return dashboardContent?.contact_email || dashboardContent?.email || 'jan@mandalregnskapskontor.no';
      case 'footer.address':
        return dashboardContent?.contact_address || dashboardContent?.address || 'Gamle Hålandsbakken 8, 4517 Mandal';
      case 'footer.hoursLabel':
        return 'Åpningstider';
      case 'footer.hours.weeklabel':
        return 'Mandag - Fredag:';
      case 'footer.hoursWeek':
        return '08:00 - 16:00';
      case 'footer.hours.weekendlabel':
        return 'Lørdag - Søndag:';
      case 'footer.hoursWeekend':
        return 'Stengt';
      case 'footer.copyright':
        return `© ${new Date().getFullYear()} Mandal Regnskapskontor. Alle rettigheter reservert.`;
      case 'footer.adminlink':
        return 'Admin';
      case 'footer.link.home':
        return 'Hjem';
      case 'footer.link.services':
        return 'Tjenester';
      case 'footer.link.about':
        return 'Om oss';
      case 'footer.link.contact':
        return 'Kontakt';

      default:
        return null;
    }
  }, [dashboardContent]);

  // Hent alle content blocks
  const fetchBlocks = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [blocksResult, contentResult] = await Promise.all([
        supabase.from('content_blocks').select('*'),
        supabase.from('content').select('*').single(),
      ]);

      const { data, error } = blocksResult;
      if (!error && data) {
        const mapped = {};
        data.forEach((block) => {
          mapped[block.slug] = block;
        });
        setBlocks(mapped);
      }

      if (!contentResult.error && contentResult.data) {
        setDashboardContent(contentResult.data);
      } else if (contentResult.error?.code === 'PGRST116') {
        setDashboardContent(null);
      }
    } catch (err) {
      console.error("Error fetching content blocks:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);


  // Oppdater én content block
  const updateBlock = async (slug, content, type = 'text') => {
    const { error } = await supabase.rpc('update_content_block', {
      p_slug: slug,
      p_content: content,
      p_type: type,
    });
    if (!error) {
      await fetchBlocks(true);
    }
    return error;
  };

  useEffect(() => {
    fetchBlocks(false);

    const channel = supabase
      .channel('public:content_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content_blocks' }, () => {
        fetchBlocks(true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content' }, () => {
        fetchBlocks(true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchBlocks]);

  return (
    <ContentContext.Provider value={{ blocks, dashboardContent, loading, updateBlock, fetchBlocks, getDashboardFallback }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent(slug) {
  const { blocks, loading, updateBlock, getDashboardFallback } = useContext(ContentContext);
  const block = blocks[slug];
  const dashboardFallback = getDashboardFallback ? getDashboardFallback(slug) : '';
  const content = block?.content;
  const hasBlockValue = hasValue(content);
  const hasDashboardValue = hasValue(dashboardFallback);
  const prefersDashboard = DASHBOARD_MANAGED_SLUGS.has(slug);
  const resolvedContent = prefersDashboard
    ? (hasDashboardValue ? dashboardFallback : (hasBlockValue ? content : ''))
    : (hasBlockValue ? content : dashboardFallback);

  return {
    content: resolvedContent,
    type: block?.type || 'text',
    loading,
    update: (content, type) => updateBlock(slug, content, type),
  };
}
