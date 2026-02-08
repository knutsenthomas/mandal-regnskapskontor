
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Save, Loader2 } from 'lucide-react';

const FooterEditor = ({ content, onUpdate }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [footerContent, setFooterContent] = useState('');

  useEffect(() => {
    if (content) {
      setFooterContent(content.footer_content || '');
    }
  }, [content]);

  const handleSave = async () => {
    if (!content?.id) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('content')
        .update({ footer_content: footerContent })
        .eq('id', content.id);

      if (error) throw error;

      toast({
        title: "Footer oppdatert",
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
