import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';

// Dynamisk SEO-komponent
export default function DynamicSEO({ page = 'home' }) {
  const [seo, setSeo] = useState(null);

  useEffect(() => {
    async function fetchSEO() {
      const { data } = await supabase
        .from('seo_innstillinger')
        .select('*')
        .eq('side', page)
        .single();
      setSeo(data);
    }
    fetchSEO();
  }, [page]);

  if (!seo) return null;

  return (
    <Helmet>
      <title>{seo.tittel}</title>
      <meta name="description" content={seo.beskrivelse} />
      <meta name="keywords" content={seo.nokkelord} />
      <meta name="robots" content={seo.robots} />
      <link rel="canonical" href={seo.canonical} />
      {/* Open Graph */}
      <meta property="og:title" content={seo.open_graph_tittel} />
      <meta property="og:description" content={seo.open_graph_beskrivelse} />
      <meta property="og:image" content={seo.open_graph_bilde} />
      <meta property="og:type" content={seo.open_graph_type} />
      {/* Twitter Card */}
      <meta name="twitter:title" content={seo.twitter_tittel} />
      <meta name="twitter:description" content={seo.twitter_beskrivelse} />
      <meta name="twitter:image" content={seo.twitter_bilde} />
      {/* Structured Data */}
      {seo.strukturert_data && (
        <script type="application/ld+json">{seo.strukturert_data}</script>
      )}
    </Helmet>
  );
}
