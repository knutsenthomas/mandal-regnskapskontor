
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Save, Loader2, Plus, Trash2, Upload, Image as ImageIcon } from 'lucide-react';

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
    const updatedValues = [...values];
    updatedValues[index] = {
      ...updatedValues[index],
      [field]: value
    };
    setValues(updatedValues);
  };

  const addValue = () => {
    setValues([...values, { title: '', description: '' }]);
    toast({
      title: "Ny verdi lagt til",
      description: "Et nytt punkt er opprettet nederst.",
      className: "bg-blue-50 border-blue-200"
    });
  };

  const removeValue = (index) => {
    setValues(values.filter((_, i) => i !== index));
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

      const fileExt = file.name.split('.').pop();
      const fileName = `about-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      setAboutImage(data.publicUrl);

      toast({
        title: "Bilde lastet opp",
        description: "Husk å lagre endringene.",
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
        .update({
          about_text: aboutText,
          about_image: aboutImage,
          about_values: values
        })
        .eq('id', content.id);

      if (error) throw error;

      toast({
        title: "Om oss oppdatert",
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
    <div className="space-y-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      {/* Main Text Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Hovedtekst</h3>
        <textarea
          value={aboutText}
          onChange={(e) => setAboutText(e.target.value)}
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-[#1B4965] focus:border-[#1B4965]"
          placeholder="Skriv om bedriften..."
        />
      </div>

      {/* Image Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Bilde</label>
        <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center bg-gray-50 relative overflow-hidden h-64">
          {aboutImage ? (
            <img
              src={aboutImage}
              alt="Preview"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
              <div className="flex flex-col items-center">
                <ImageIcon className="w-12 h-12 mb-2" />
                <span>Ingen bilde valgt</span>
              </div>
            </div>
          )}

          <div className="relative z-10 flex flex-col items-center bg-white/90 p-4 rounded-xl shadow-sm backdrop-blur-sm">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="about-upload"
              disabled={uploading}
            />
            <label
              htmlFor="about-upload"
              className={`cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {uploading ? 'Laster opp...' : 'Last opp nytt bilde'}
            </label>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Kjerneverdier / Nøkkelpunkter</h3>
          <Button onClick={addValue} variant="outline" size="sm" className="border-[#1B4965] text-[#1B4965] hover:bg-blue-50">
            <Plus className="w-4 h-4 mr-2" />
            Legg til verdi
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {values.map((val, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative group">
              <button
                onClick={() => removeValue(index)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="space-y-3">
                <input
                  type="text"
                  value={val.title || ''}
                  onChange={(e) => handleValueChange(index, 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#1B4965] focus:border-[#1B4965] bg-white text-sm font-semibold"
                  placeholder="Tittel (f.eks. Erfaring)"
                />
                <textarea
                  value={val.description || ''}
                  onChange={(e) => handleValueChange(index, 'description', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#1B4965] focus:border-[#1B4965] bg-white text-sm resize-none"
                  placeholder="Beskrivelse..."
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
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

export default AboutEditor;
