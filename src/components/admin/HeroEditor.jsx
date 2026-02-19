import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Save, Loader2, Upload } from 'lucide-react';

const HeroEditor = ({ content, onUpdate }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (content) {
      setFormData({
        hero_title: content.hero_title ?? '',
        hero_subtitle: content.hero_subtitle ?? '',
        hero_image: content.hero_image ?? ''
      });
    }
  }, [content]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `hero-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, hero_image: data.publicUrl }));

      toast({
        title: "Bilde lastet opp",
        description: "Husk å trykke lagre for å oppdatere forsiden.",
        className: "bg-green-50 border-green-200"
      });
    } catch (error) {
      toast({
        title: "Feil ved opplasting",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!content?.id) {
      toast({
        title: "Feil",
        description: "Kan ikke lagre fordi innholds-ID mangler. Prøv å laste siden på nytt, eller kontakt utvikler.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.rpc('update_hero_content', {
      p_id: content.id,
      p_title: formData.hero_title,
      p_subtitle: formData.hero_subtitle,
      p_image: formData.hero_image
    });

    if (error) {
      toast({
        title: "Feil ved lagring",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Hero oppdatert",
        description: "Endringene er lagret.",
        className: "bg-green-50 border-green-200"
      });
      if (onUpdate) onUpdate();
    }
    setLoading(false);
  };

  if (!formData) {
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Tittel</label>
        <input
          type="text"
          name="hero_title"
          value={formData.hero_title}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#1B4965] focus:border-[#1B4965] mb-2"
          placeholder="Hovedtittel på forsiden"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Undertittel</label>
        <input
          type="text"
          name="hero_subtitle"
          value={formData.hero_subtitle}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#1B4965] focus:border-[#1B4965] mb-2"
          placeholder="Undertittel på forsiden"
        />
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Forsidebilde</label>
        <div className="flex items-center space-x-4">
          {formData.hero_image && (
            <img src={formData.hero_image} alt="Hero" className="h-16 rounded shadow border" />
          )}
          <label className="flex items-center px-3 py-2 bg-gray-100 rounded cursor-pointer border border-gray-200 hover:bg-gray-200">
            <Upload className="w-4 h-4 mr-2" />
            <span>Last opp bilde</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSave}
          disabled={loading || uploading}
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

export default HeroEditor;