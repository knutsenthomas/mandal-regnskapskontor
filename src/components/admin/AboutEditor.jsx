import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Save, Loader2, Plus, Trash2, Upload, Image as ImageIcon, Info, Heart } from 'lucide-react';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { uploadImageToPublicBucket, getUploadErrorMessage } from '@/lib/storageUpload';
import AdminHeader from './layout/AdminHeader';

const AboutEditor = ({ content, onUpdate }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [aboutText, setAboutText] = useState('');
  const [aboutImage, setAboutImage] = useState('');
  const [values, setValues] = useState([]);

  useEffect(() => {
    if (content) {
      setAboutText(content.about_text || '');
      setAboutImage(content.about_image || '');
      const vals = Array.isArray(content.about_values) ? content.about_values : [];
      setValues(vals);
    }
  }, [content]);

  const handleValueChange = (index, field, value) => {
    setValues(prev => {
      const updatedValues = [...prev];
      if (updatedValues[index]) {
        updatedValues[index] = {
          ...updatedValues[index],
          [field]: value
        };
      }
      return updatedValues;
    });
  };

  const addValue = () => {
    setValues(prev => [...prev, { title: '', description: '' }]);
    toast({
      title: "Ny verdi lagt til",
      description: "Et nytt punkt er opprettet nederst.",
      className: "bg-blue-50 border-blue-200"
    });
  };

  const removeValue = (index) => {
    setValues(prev => prev.filter((_, i) => i !== index));
    toast({
      title: "Verdi slettet",
      description: "Punktet er fjernet fra listen.",
      variant: "destructive"
    });
  };

  const handleImageUpload = async (e) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;
      const { publicUrl } = await uploadImageToPublicBucket({
        file,
        bucket: 'images',
        folder: 'about',
        prefix: 'about',
        maxBytes: 8 * 1024 * 1024,
      });
      setAboutImage(publicUrl);

      toast({
        title: "Bilde lastet opp",
        description: "Husk å lagre endringene.",
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
        description: "Kan ikke lagre fordi innholds-ID mangler. Prøv å laste siden på nytt.",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);

    try {
      const { error } = await supabase.rpc('update_about_content', {
        p_id: content.id,
        p_text: aboutText,
        p_image: aboutImage,
        p_values: values
      });

      if (error) throw error;

      toast({
        title: "Om oss oppdatert",
        description: "Informasjonen er lagret.",
        className: "bg-green-50 border-green-200"
      });

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("About save error:", error);
      toast({
        title: "Feil ved lagring",
        description: error.message || "Kunne ikke lagre om oss-innhold.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      <AdminHeader
        icon={Info}
        title="Om oss"
        description="Rediger teksten, hovedbildet og kjerneverdiene som presenteres på 'Om oss'-siden."
      >
        <Button
          onClick={handleSave}
          disabled={loading}
          className="bg-[#1B4965] hover:bg-[#0F3347] text-white flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Lagre endringer
        </Button>
      </AdminHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2 font-bold text-gray-800">
              Hovedtekst
            </div>
            <RichTextEditor
              value={aboutText}
              onChange={setAboutText}
              placeholder="Fortell kundene dine litt om Mandal Regnskapskontor..."
              minHeight={300}
            />
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-400" />
                Kjerneverdier & Nøkkelpunkter
              </h3>
              <Button onClick={addValue} variant="outline" size="sm" className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg">
                <Plus className="w-4 h-4 mr-1" />
                Ny verdi
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {values.map((val, index) => (
                <div key={index} className="bg-gray-50/50 p-5 rounded-xl border border-gray-100 relative group transition-all hover:bg-white hover:shadow-md hover:ring-1 hover:ring-primary/5">
                  <button
                    onClick={() => removeValue(index)}
                    className="absolute top-3 right-3 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Tittel</label>
                      <input
                        type="text"
                        value={val.title || ''}
                        onChange={(e) => handleValueChange(index, 'title', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white text-sm font-bold shadow-sm"
                        placeholder="f.eks. Erfaring"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Beskrivelse</label>
                      <textarea
                        value={val.description || ''}
                        onChange={(e) => handleValueChange(index, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white text-sm resize-none shadow-sm"
                        placeholder="Kort forklaring..."
                      />
                    </div>
                  </div>
                </div>
              ))}
              {values.length === 0 && (
                <div className="col-span-2 py-12 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                  <p className="text-gray-400 text-sm">Ingen kjerneverdier lagt til ennå.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h4 className="font-bold text-gray-800">Hovedbilde</h4>
            <div className="aspect-[4/3] bg-gray-50 rounded-xl overflow-hidden relative border border-gray-100 group">
              <img
                src={aboutImage || "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=500&auto=format&fit=crop&q=60"}
                alt="Feature"
                className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700"
              />

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <label htmlFor="image-replace" className="cursor-pointer bg-white/20 backdrop-blur-md text-white px-6 py-2 rounded-xl border border-white/30 hover:bg-white/30 transition-all font-bold text-xs flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Bytt bilde
                </label>
                <input
                  type="file"
                  accept="image/*"
                  id="image-replace"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </div>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed italic px-1 text-center">
              Anbefalt bildestørrelse: 1200x800px. Standardbilde vises hvis ingen fil er valgt.
            </p>
          </div>

          <div className="bg-[#1B4965]/5 p-5 rounded-2xl border border-[#1B4965]/10 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-[#1B4965] text-[10px] uppercase tracking-widest">
              <Heart className="w-4 h-4" />
              Tips for godt innhold
            </div>
            <p className="text-xs text-[#1B4965]/80 leading-relaxed italic">
              Bruk personlige bilder av kontoret eller teamet for å bygge tillit hos potensielle kunder. En god "Om oss"-side er ofte den mest besøkte siden etter forsiden.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutEditor;
