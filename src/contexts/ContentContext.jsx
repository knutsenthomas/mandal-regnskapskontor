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
  const getInitialBlocks = () => {
    try {
      const cached = localStorage.getItem('cached_content_blocks');
      if (cached) return JSON.parse(cached);
    } catch (e) { }
    return {};
  };

  const getInitialDashboard = () => {
    try {
      const cached = localStorage.getItem('cached_dashboard_content');
      if (cached) return JSON.parse(cached);
    } catch (e) { }
    return null;
  };

  const [blocks, setBlocks] = useState(getInitialBlocks);
  const [dashboardContent, setDashboardContent] = useState(getInitialDashboard);
  const [loading, setLoading] = useState(!(localStorage.getItem('cached_content_blocks') && localStorage.getItem('cached_dashboard_content')));

  // FIKS: Fjernet all hardkodet tekst. Nå stoler vi kun på databasen (content og content_blocks)
  const getDashboardFallback = useCallback((slug) => {
    switch (slug) {
      case 'hero.title':
        return dashboardContent?.hero_title || null;
      case 'hero.lines':
        return dashboardContent?.hero_lines ?? dashboardContent?.hero_subtitle ?? null;
      case 'hero.image':
        return dashboardContent?.hero_image || null;

      case 'about.text':
        return dashboardContent?.about_text || null;
      case 'about.image':
        return dashboardContent?.about_image || null;
      case 'about.values':
        return dashboardContent?.about_values ?? null;

      case 'contact.phone':
        return dashboardContent?.contact_phone || null;
      case 'contact.email':
        return dashboardContent?.contact_email || null;
      case 'contact.address':
        return dashboardContent?.contact_address || null;

      case 'footer.companyName':
        return dashboardContent?.company_name || null;
      case 'footer.companyDesc':
        return dashboardContent?.footer_text || null;
      case 'footer.phone':
        return dashboardContent?.contact_phone || dashboardContent?.phone || null;
      case 'footer.email':
        return dashboardContent?.contact_email || dashboardContent?.email || null;
      case 'footer.address':
        return dashboardContent?.contact_address || dashboardContent?.address || null;

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
        try { localStorage.setItem('cached_content_blocks', JSON.stringify(mapped)); } catch (e) { }
      }

      if (!contentResult.error && contentResult.data) {
        setDashboardContent(contentResult.data);
        try { localStorage.setItem('cached_dashboard_content', JSON.stringify(contentResult.data)); } catch (e) { }
      } else {
        setDashboardContent(null);
        try { localStorage.removeItem('cached_dashboard_content'); } catch (e) { }
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
    let isMounted = true;
    fetchBlocks(false).then(() => {
      if (!isMounted) return;
      setLoading(false); // Failsafe
    });

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
      isMounted = false;
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
  const dashboardFallback = getDashboardFallback ? getDashboardFallback(slug) : null;
  const content = block?.content;
  const hasBlockValue = hasValue(content);
  const hasDashboardValue = hasValue(dashboardFallback);
  const prefersDashboard = DASHBOARD_MANAGED_SLUGS.has(slug);

  const resolvedContent = prefersDashboard
    ? (hasDashboardValue ? dashboardFallback : (hasBlockValue ? content : ''))
    : (hasBlockValue ? content : dashboardFallback || '');

  return {
    content: resolvedContent,
    type: block?.type || 'text',
    loading,
    update: (content, type) => updateBlock(slug, content, type),
  };
}