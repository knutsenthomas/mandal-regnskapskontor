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
    if (!dashboardContent) return '[Innhold mangler]';

    switch (slug) {
      case 'hero.title':
        return dashboardContent.hero_title || '[Innhold mangler]';
      case 'hero.lines':
        return dashboardContent.hero_lines ?? dashboardContent.hero_subtitle ?? '[Innhold mangler]';
      case 'hero.image':
        return dashboardContent.hero_image || '[Innhold mangler]';

      case 'about.text':
        return dashboardContent.about_text || '[Innhold mangler]';
      case 'about.image':
        return dashboardContent.about_image || '[Innhold mangler]';
      case 'about.values':
        return dashboardContent.about_values ?? '[Innhold mangler]';

      case 'contact.phone':
        return dashboardContent.contact_phone || '[Innhold mangler]';
      case 'contact.email':
        return dashboardContent.contact_email || '[Innhold mangler]';
      case 'contact.address':
        return dashboardContent.contact_address || '[Innhold mangler]';

      case 'footer.companyName':
        return dashboardContent.company_name || '[Innhold mangler]';
      case 'footer.companyDesc':
        return dashboardContent.footer_text || '[Innhold mangler]';
      case 'footer.quicklinksLabel':
        return '[Innhold mangler]';
      case 'footer.contactLabel':
        return '[Innhold mangler]';
      case 'footer.phone':
        return dashboardContent.contact_phone || dashboardContent.phone || '[Innhold mangler]';
      case 'footer.email':
        return dashboardContent.contact_email || dashboardContent.email || '[Innhold mangler]';
      case 'footer.address':
        return dashboardContent.contact_address || dashboardContent.address || '[Innhold mangler]';
      case 'footer.hoursLabel':
        return '[Innhold mangler]';
      case 'footer.hours.weeklabel':
        return '[Innhold mangler]';
      case 'footer.hoursWeek':
        return '[Innhold mangler]';
      case 'footer.hours.weekendlabel':
        return '[Innhold mangler]';
      case 'footer.hoursWeekend':
        return '[Innhold mangler]';
      case 'footer.copyright':
        return `© ${new Date().getFullYear()} Mandal Regnskapskontor. Alle rettigheter reservert.`;
      case 'footer.adminlink':
        return '[Innhold mangler]';
      case 'footer.link.home':
        return '[Innhold mangler]';
      case 'footer.link.services':
        return '[Innhold mangler]';
      case 'footer.link.about':
        return '[Innhold mangler]';
      case 'footer.link.contact':
        return '[Innhold mangler]';

      default:
        return '[Innhold mangler]';
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
