import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Save, Loader2, Upload, Image as ImageIcon } from 'lucide-react';

const HeroEditor = ({ content, onUpdate }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    hero_title: '',
    hero_subtitle: '',
    hero_image: ''
  });

  useEffect(() => {
    if (content) {
      setFormData({
        hero_title: content.hero_title || '',
        hero_subtitle: content.hero_subtitle || '',
        hero_image: content.hero_image || ''
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
    if (!content?.id) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('content')
        .update(formData)
        .eq('id', content.id);

      if (error) throw error;

      toast({
        title: "Hero oppdatert",
        description: "Endringene er lagret.",
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

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Overskrift</label>
          <input
            type="text"
            name="hero_title"
            value={formData.hero_title}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#1B4965] focus:border-[#1B4965]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Underoverskrift</label>
          <textarea
            name="hero_subtitle"
            value={formData.hero_subtitle}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#1B4965] focus:border-[#1B4965]"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Bakgrunnsbilde</label>
        <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center bg-gray-50 relative overflow-hidden h-48">

          {formData.hero_image ? (
            <img
              src={formData.hero_image}
              alt="Preview"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
              Ingen bilde valgt (bruker standard)
            </div>
          )}

          <div className="relative z-10 flex flex-col items-center bg-white/90 p-4 rounded-xl shadow-sm backdrop-blur-sm">
            <ImageIcon className="w-8 h-8 text-gray-500 mb-2" />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="hero-upload"
              disabled={uploading}
            />
            <label
              htmlFor="hero-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              {uploading ? 'Laster opp...' : 'Velg nytt bilde'}
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <Button onClick={handleSave} disabled={loading || uploading} className="bg-[#1B4965] hover:bg-[#0F3347] text-white">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Lagre endringer
        </Button>
      </div>
    </div>
  );
};

export default HeroEditor;