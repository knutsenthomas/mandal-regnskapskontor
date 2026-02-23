import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Save, Plus, Trash2, Loader2, Upload, Image as ImageIcon } from 'lucide-react';

const ServicesEditor = ({ content, onUpdate }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (content?.services_data) {
      const data = Array.isArray(content.services_data) ? content.services_data : [];
      setServices(data);
    }
  }, [content]);

  const handleServiceChange = (index, field, value) => {
    const updatedServices = [...services];
    updatedServices[index] = {
      ...updatedServices[index],
      [field]: value
    };
    setServices(updatedServices);
  };

  const addService = () => {
    setServices([...services, { title: '', description: '' }]);
    toast({
      title: "Ny tjeneste lagt til",
      description: "Et nytt kort er opprettet nederst i listen.",
      className: "bg-blue-50 border-blue-200"
    });
  };

  const removeService = (index) => {
    const updatedServices = services.filter((_, i) => i !== index);
    setServices(updatedServices);
    toast({
      title: "Tjeneste slettet",
      description: "Tjenesten er fjernet fra listen.",
      variant: "destructive"
    });
  };

  const handleImageUpload = async (index, e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `service-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      handleServiceChange(index, 'image', data.publicUrl);

      toast({
        title: "Bilde lastet opp",
        description: "Husk å lagre endringene.",
        className: "bg-green-50 border-green-200"
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Feil ved opplasting",
        description: "Kunne ikke laste opp bilde.",
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
        description: "Kan ikke lagre fordi innholds-ID mangler. Prøv å laste siden på nytt.",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);

    try {
      // PLAN B: RPC Function (Bypasses RLS)
      // Note: p_services expects JSONB, so we send the array directly
      const { error } = await supabase.rpc('update_services_content', {
        p_id: content.id,
        p_services: services
      });

      if (error) throw error;

      toast({
        title: "Tjenester oppdatert",
        description: "Endringene er lagret.",
        className: "bg-green-50 border-green-200"
      });

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Save error details:", error);
      toast({
        title: "Feil ved lagring",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Default images from Services.jsx to show in preview if no custom image is set
  const defaultImages = [
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800', // Accounting
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800', // Invoicing
    'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=800', // Team
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800', // Audit
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800'  // Growth
  ];

  return (
    <div className="space-y-6">
      {/* SLEGGE-LØSNINGEN: Vi tvinger fargene med CSS !important */}
      <style>{`
        .super-custom-save-btn {
          background-color: #1B4965 !important;
          color: white !important;
          border: none !important;
        }
        .super-custom-save-btn:hover {
          background-color: #0F3347 !important;
          color: white !important;
        }
      `}</style>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Administrer Tjenester</h3>
        <Button onClick={addService} variant="outline" size="sm" className="border-[#1B4965] text-[#1B4965] hover:bg-blue-50">
          <Plus className="w-4 h-4 mr-2" />
          Legg til tjeneste
        </Button>
      </div>

      <div className="space-y-4">
        {services.map((service, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative group flex flex-col md:flex-row gap-4">




            {/* Image Section */}
            <div className="w-full md:w-1/3 shrink-0 flex flex-col gap-2">
              <div className="aspect-video bg-gray-200 rounded-md overflow-hidden relative border border-gray-300 flex items-center justify-center group-hover/image:border-[#1B4965] transition-colors">
                {/* Use modulo to cycle through default images if we have more services than images */}
                {service.image || defaultImages[index % defaultImages.length] ? (
                  <img
                    src={service.image || defaultImages[index % defaultImages.length]}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="text-gray-400 w-8 h-8" />
                )}

                {/* Hover overlay for upload */}
                <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                  <label htmlFor={`service-upload-${index}`} className="cursor-pointer text-white flex flex-col items-center gap-1 text-xs font-medium bg-black/20 p-2 rounded backdrop-blur-sm hover:bg-black/40 transition-colors w-full h-full justify-center">
                    <Upload className="w-5 h-5" />
                    <span>Last opp</span>
                  </label>
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                id={`service-upload-${index}`}
                onChange={(e) => handleImageUpload(index, e)}
                className="hidden"
                disabled={uploading}
              />
            </div>

            {/* Content Section */}
            <div className="space-y-4 flex-1">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Tittel
                </label>
                <input
                  type="text"
                  value={service.title || ''}
                  onChange={(e) => handleServiceChange(index, 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#1B4965] focus:border-[#1B4965] bg-white"
                  placeholder="Navn på tjeneste"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Beskrivelse
                </label>
                <textarea
                  value={service.description || ''}
                  onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#1B4965] focus:border-[#1B4965] bg-white resize-none"
                  placeholder="Kort beskrivelse..."
                />
              </div>
            </div>

            <button
              onClick={() => removeService(index)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Slett tjeneste"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}

        {services.length === 0 && (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            Ingen tjenester lagt til ennå.
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button
          onClick={handleSave}
          disabled={loading}
          className="super-custom-save-btn inline-flex items-center justify-center px-6 py-2 rounded-md font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Lagre endringer
        </button>
      </div>
    </div>
  );
};

export default ServicesEditor;