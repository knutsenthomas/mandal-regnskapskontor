import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Save, Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import { uploadImageToPublicBucket, getUploadErrorMessage } from '@/lib/storageUpload';
import { useContent } from '@/contexts/ContentContext';
import AdminHeader from './layout/AdminHeader';

const HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const normalizeHexColor = (value) => {
  if (typeof value !== 'string') return '';
  const raw = value.trim();
  if (!raw) return '';
  if (!HEX_COLOR_REGEX.test(raw)) return '';
  if (raw.length === 4) {
    return `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}`.toUpperCase();
  }
  return raw.toUpperCase();
};

const HeroEditor = ({ content, onUpdate }) => {
  const { toast } = useToast();
  const heroPrimaryColor = useContent('hero.primaryColor');
  const heroButton = useContent('hero.button');
  const heroButtonUrl = useContent('hero.buttonUrl');
  const loc1Name = useContent('hero.loc1Name');
  const loc1Addr = useContent('hero.loc1Addr');
  const loc2Name = useContent('hero.loc2Name');
  const loc2Addr = useContent('hero.loc2Addr');
  const showLocations = useContent('hero.showLocations');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (content) {
      setFormData({
        hero_title: content.hero_title ?? '',
        hero_lines: Array.isArray(content.hero_lines) ? content.hero_lines : [''],
        hero_image: content.hero_image ?? '',
        hero_primary_color: normalizeHexColor(heroPrimaryColor.content),
        hero_button: heroButton.content || 'Kontakt oss',
        hero_button_url: heroButtonUrl.content || '#kontakt',
        hero_loc1_name: loc1Name.content || 'Mandal',
        hero_loc1_addr: loc1Addr.content || 'Bryggegata 1, 4514 Mandal',
        hero_loc2_name: loc2Name.content || 'Grimstad',
        hero_loc2_addr: loc2Addr.content || 'Storgata 1, 4876 Grimstad',
        hero_show_locations: showLocations.content === 'true',
      });
    }
  }, [content, heroPrimaryColor.content, heroButton.content, heroButtonUrl.content, loc1Name.content, loc1Addr.content, loc2Name.content, loc2Addr.content, showLocations.content]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLineChange = (idx, value) => {
    setFormData(prev => ({
      ...prev,
      hero_lines: prev.hero_lines.map((line, i) => i === idx ? value : line)
    }));
  };

  const handleAddLine = () => {
    setFormData(prev => ({
      ...prev,
      hero_lines: [...(prev.hero_lines || []), '']
    }));
  };

  const handleRemoveLine = (idx) => {
    setFormData(prev => ({
      ...prev,
      hero_lines: (prev.hero_lines || []).filter((_, i) => i !== idx)
    }));
  };

  const handleImageUpload = async (e) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;
      const { publicUrl } = await uploadImageToPublicBucket({
        file,
        bucket: 'images',
        folder: 'hero',
        prefix: 'hero',
        maxBytes: 8 * 1024 * 1024,
      });
      setFormData(prev => ({ ...prev, hero_image: publicUrl }));

      toast({
        title: "Bilde lastet opp",
        description: "Husk å trykke lagre for å oppdatere forsiden.",
        className: "bg-green-50 border-green-200"
      });
    } catch (error) {
      toast({
        title: "Feil ved opplasting",
        description: getUploadErrorMessage(error),
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      if (e?.target) e.target.value = '';
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

    const heroOverlayColor = normalizeHexColor(formData.hero_primary_color);
    if (formData.hero_primary_color?.trim() && !heroOverlayColor) {
      toast({
        title: "Ugyldig farge",
        description: "Bruk hex-format, for eksempel #1B4965, eller la feltet være tomt for å bruke temaets hovedfarge.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.rpc('update_hero_content', {
        p_id: content.id,
        p_title: formData.hero_title,
        p_lines: formData.hero_lines,
        p_image: formData.hero_image
      });

      if (error) throw error;
      const heroColorError = await heroPrimaryColor.update(heroOverlayColor, 'text');
      if (heroColorError) throw heroColorError;

      const buttonUpdateError = await heroButton.update(formData.hero_button, 'text');
      if (buttonUpdateError) throw buttonUpdateError;

      const buttonUrlUpdateError = await heroButtonUrl.update(formData.hero_button_url, 'text');
      if (buttonUrlUpdateError) throw buttonUrlUpdateError;

      await Promise.all([
        loc1Name.update(formData.hero_loc1_name, 'text'),
        loc1Addr.update(formData.hero_loc1_addr, 'text'),
        loc2Name.update(formData.hero_loc2_name, 'text'),
        loc2Addr.update(formData.hero_loc2_addr, 'text'),
        showLocations.update(formData.hero_show_locations ? 'true' : 'false', 'text'),
      ]);

      toast({
        title: "Hero oppdatert",
        description: "Endringene er lagret.",
        className: "bg-green-50 border-green-200"
      });
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Hero save error:", error);
      toast({
        title: "Feil ved lagring",
        description: error.message || "Kunne ikke lagre hero-innhold.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
    <div className="space-y-6">
      <AdminHeader
        icon={ImageIcon}
        title="Forside (Hero)"
        description="Administrer hovedbilde, tittel og farge på forsiden av nettsiden."
      >
        <Button
          onClick={handleSave}
          disabled={loading || uploading}
          className="bg-[#1B4965] hover:bg-[#0F3347] text-white flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Lagre endringer
        </Button>
      </AdminHeader>

      <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hovedtittel</label>
          <input
            type="text"
            name="hero_title"
            value={formData.hero_title}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:outline-none mb-2"
            placeholder="Hovedtittel på forsiden"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tekstlinjer under tittel</label>
          <div className="space-y-2">
            {formData.hero_lines && formData.hero_lines.map((line, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={line}
                  onChange={e => handleLineChange(idx, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  placeholder={`Linje ${idx + 1}`}
                />
                {formData.hero_lines.length > 1 && (
                  <button type="button" onClick={() => handleRemoveLine(idx)} className="text-red-500 text-xs px-2 py-1">Fjern</button>
                )}
              </div>
            ))}
            <button type="button" onClick={handleAddLine} className="text-[#1B4965] text-xs mt-2 px-3 py-1.5 border border-[#1B4965]/20 rounded-lg hover:bg-[#1B4965]/5 transition-colors">+ Legg til linje</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Knappetekst</label>
            <input
              type="text"
              name="hero_button"
              value={formData.hero_button}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:outline-none"
              placeholder="Kontakt oss"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Knappelenke (URL)</label>
            <input
              type="text"
              name="hero_button_url"
              value={formData.hero_button_url}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:outline-none"
              placeholder="#kontakt"
            />
            <p className="text-[10px] text-gray-400 mt-1">Bruk #ID for å rulle til en seksjon (f.eks #kontakt) eller en full URL.</p>
          </div>
        </div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Lokasjoner & Adresser</label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{formData.hero_show_locations ? 'Synlig' : 'Skjult'}</span>
            <input
              type="checkbox"
              checked={formData.hero_show_locations}
              onChange={(e) => setFormData(prev => ({ ...prev, hero_show_locations: e.target.checked }))}
              className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
          </div>
        </div>
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-lg bg-gray-50/30 transition-opacity ${formData.hero_show_locations ? 'opacity-100' : 'opacity-40'}`}>
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase text-gray-400">Lokasjon 1</h4>
            <input
              type="text"
              name="hero_loc1_name"
              value={formData.hero_loc1_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Mandal"
            />
            <input
              type="text"
              name="hero_loc1_addr"
              value={formData.hero_loc1_addr}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Bryggegata 1, 4514 Mandal"
            />
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase text-gray-400">Lokasjon 2</h4>
            <input
              type="text"
              name="hero_loc2_name"
              value={formData.hero_loc2_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Grimstad"
            />
            <input
              type="text"
              name="hero_loc2_addr"
              value={formData.hero_loc2_addr}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Storgata 1, 4876 Grimstad"
            />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Forsidebilde</label>
        <div className="flex items-center space-x-4">
          {formData.hero_image && (
            <div className="rounded-lg overflow-hidden shadow border border-gray-200 bg-white">
              <img src={formData.hero_image} alt="Hero" className="h-16 object-cover" />
            </div>
          )}
          <label className="flex items-center px-4 py-2 bg-gray-50 rounded-lg cursor-pointer border border-gray-200 hover:bg-gray-100 transition-colors">
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
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Hero-farge (valgfritt)</label>
        <p className="text-xs text-gray-500 mb-3">
          Farge på overlay i hero-seksjonen. La stå tom for å bruke hovedfargen fra fargetema.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="color"
            value={normalizeHexColor(formData.hero_primary_color) || '#1B4965'}
            onInput={(e) => setFormData((prev) => ({ ...prev, hero_primary_color: e.target.value }))}
            onChange={(e) => setFormData((prev) => ({ ...prev, hero_primary_color: e.target.value }))}
            className="h-10 w-14 cursor-pointer rounded-lg border border-gray-300 bg-white p-1"
            aria-label="Velg hero-farge"
          />
          <input
            type="text"
            value={formData.hero_primary_color}
            onChange={(e) => setFormData((prev) => ({ ...prev, hero_primary_color: e.target.value }))}
            className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:outline-none"
            placeholder="#1B4965"
          />
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, hero_primary_color: '' }))}
            className="text-xs px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Bruk temaets hovedfarge
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroEditor;
