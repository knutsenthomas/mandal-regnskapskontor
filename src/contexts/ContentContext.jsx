import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/customSupabaseClient';

const ContentContext = createContext();

export function ContentProvider({ children }) {
  const [blocks, setBlocks] = useState({});
  const [loading, setLoading] = useState(true);

  // Hent alle content blocks
  const fetchBlocks = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('content_blocks').select('*');
    if (!error && data) {
      const mapped = {};
      data.forEach((block) => {
        mapped[block.slug] = block;
      });
      setBlocks(mapped);
    }
    setLoading(false);
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
  }, [fetchBlocks]);

  return (
    <ContentContext.Provider value={{ blocks, loading, updateBlock, fetchBlocks }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent(slug) {
  const { blocks, loading, updateBlock } = useContext(ContentContext);
  return {
    content: blocks[slug]?.content || '',
    type: blocks[slug]?.type || 'text',
    loading,
    update: (content, type) => updateBlock(slug, content, type),
  };
}
