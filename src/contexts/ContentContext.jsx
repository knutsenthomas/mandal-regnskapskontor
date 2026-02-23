import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/customSupabaseClient';

const ContentContext = createContext();
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
    if (!dashboardContent) return '';

    switch (slug) {
      case 'hero.title':
        return dashboardContent.hero_title || '';
      case 'hero.lines':
        return dashboardContent.hero_lines ?? dashboardContent.hero_subtitle ?? '';
      case 'hero.image':
        return dashboardContent.hero_image || '';

      case 'about.text':
        return dashboardContent.about_text || '';
      case 'about.image':
        return dashboardContent.about_image || '';
      case 'about.values':
        return dashboardContent.about_values ?? '';

      case 'contact.phone':
        return dashboardContent.contact_phone || '';
      case 'contact.email':
        return dashboardContent.contact_email || '';
      case 'contact.address':
        return dashboardContent.contact_address || '';

      // Keep footer contact details aligned with dashboard ContactEditor
      case 'footer.phone':
        return dashboardContent.contact_phone || '';
      case 'footer.email':
        return dashboardContent.contact_email || '';
      case 'footer.address':
        return dashboardContent.contact_address || '';
      case 'footer.hoursWeek':
        return dashboardContent.opening_hours || '';

      default:
        return '';
    }
  }, [dashboardContent]);

  // Hent alle content blocks
  const fetchBlocks = useCallback(async () => {
    try {
      setLoading(true);
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
      setLoading(false);
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
      await fetchBlocks();
    }
    return error;
  };

  useEffect(() => {
    fetchBlocks();

    const channel = supabase
      .channel('public:content_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content_blocks' }, () => {
        fetchBlocks();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content' }, () => {
        fetchBlocks();
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
