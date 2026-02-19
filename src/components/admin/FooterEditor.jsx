import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Save, Loader2 } from 'lucide-react';

const FooterEditor = ({ content, onUpdate }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [footerContent, setFooterContent] = useState(undefined);
  const [gaMeasurementId, setGaMeasurementId] = useState(undefined);
  const [gaApiSecret, setGaApiSecret] = useState("");

  useEffect(() => {
    if (content) {
      setFooterContent(content.footer_content ?? '');
      setGaMeasurementId(content.ga_measurement_id ?? '');
    }
  }, [content]);

  const handleSave = async () => {
    if (!content?.id) return;
    setLoading(true);

    try {
      // Oppdater footer_content i content-tabellen
      const { error: contentError } = await supabase
        .from('content')
        .update({ footer_content: footerContent })
        .eq('id', content.id);
      if (contentError) throw contentError;

      // Oppdater Google Analytics Measurement ID i site_settings via RLS-funksjon
      if (gaMeasurementId) {
        const { error: gaError } = await supabase
          .rpc('upsert_site_setting', {
            p_key: 'google_analytics_id',
            p_value: gaMeasurementId
          });
        if (gaError) throw gaError;
      }

      toast({
        title: "Footer og Analytics oppdatert",
        description: "Informasjonen er lagret.",
        className: "bg-green-50 border-green-200"
      });

      if (onUpdate) onUpdate();
    } catch (error) {
      toast({
        title: "Feil ved lagring",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (footerContent === undefined || gaMeasurementId === undefined) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Laster innhold ...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Footer Tekst (Om bedriften i bunntekst)
        </label>
        <textarea
          value={footerContent}
          onChange={(e) => setFooterContent(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-[#1B4965] focus:border-[#1B4965]"
          placeholder="Kort tekst om bedriften..."
        />
        <p className="mt-2 text-xs text-gray-500">
          Dette vises vanligvis i første kolonne i bunnteksten.
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Google Analytics</label>
        <input
          type="text"
          value={gaMeasurementId}
          onChange={e => setGaMeasurementId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#1B4965] focus:border-[#1B4965] mb-2"
          placeholder="Measurement ID (G-XXXXXXXXXX)"
        />
        <p className="text-xs text-gray-500">Koble nettsiden til Google Analytics 4 for å spore besøkende.</p>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSave}
          disabled={loading}
          className="bg-[#1B4965] hover:bg-[#0F3347] text-white w-full md:w-auto"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Lagre endringer
        </Button>
      </div>
    </div>
  );
};

export default FooterEditor;
