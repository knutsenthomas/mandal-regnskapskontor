import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Save, Plus, Trash2, Loader2, Upload, Layers, Image as ImageIcon } from 'lucide-react';
import { uploadImageToPublicBucket, getUploadErrorMessage } from '@/lib/storageUpload';
import AdminHeader from './layout/AdminHeader';

const ServicesEditor = ({ content, onUpdate, onNavigateToDetails }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialServiceCount, setInitialServiceCount] = useState(0);

  useEffect(() => {
    if (content?.services_data) {
      const data = Array.isArray(content.services_data) ? content.services_data : [];
      setServices(data);
      setInitialServiceCount(data.length);
      setHasUnsavedChanges(false);
    }
  }, [content]);

  const handleServiceChange = (index, field, value) => {
    setHasUnsavedChanges(true);
    setServices(prev => {
      const updatedServices = [...prev];
      if (updatedServices[index]) {
        updatedServices[index] = {
          ...updatedServices[index],
          [field]: value
        };
      }
      return updatedServices;
    });
  };

  const addService = () => {
    setServices(prev => [...prev, { title: '', description: '' }]);
    setHasUnsavedChanges(true);
    toast({
      title: "Ny tjeneste klargjort",
      description: "Fyll inn navn og beskrivelse, og klikk 'Lagre endringer' for å opprette.",
      className: "bg-blue-50 border-blue-200"
    });
  };

  const removeService = (index) => {
    setServices(prev => prev.filter((_, i) => i !== index));
    setHasUnsavedChanges(true);
    toast({
      title: "Tjeneste markert for sletting",
      description: "Husk å lagre for å fullføre slettingen.",
      variant: "destructive"
    });
  };

  const handleImageUpload = async (index, e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      setUploading(true);
      const { publicUrl } = await uploadImageToPublicBucket({
        file,
        bucket: 'images',
        folder: 'services',
        prefix: 'service',
        maxBytes: 8 * 1024 * 1024,
      });
      handleServiceChange(index, 'image', publicUrl);

      toast({
        title: "Bilde lastet opp",
        description: "Husk å lagre endringene.",
        className: "bg-green-50 border-green-200"
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Feil ved opplasting",
        description: getUploadErrorMessage(error, "Kunne ikke laste opp bilde."),
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
      const { error } = await supabase.rpc('update_services_content', {
        p_id: content.id,
        p_services: services
      });

      if (error) throw error;

      const isNewService = services.length > initialServiceCount;

      toast({
        title: isNewService ? "Tjeneste opprettet!" : "Tjenester oppdatert",
        description: isNewService
          ? "Tjenesten er nå opprettet. Du blir nå videresendt for å fylle inn detaljer."
          : "Endringene er lagret.",
        className: "bg-green-50 border-green-200"
      });

      setHasUnsavedChanges(false);
      if (onUpdate) await onUpdate();

      if (isNewService && onNavigateToDetails) {
        setTimeout(() => {
          onNavigateToDetails(services.length - 1);
        }, 1000);
      }
    } catch (error) {
      console.error("Save error details:", error);
      toast({
        title: "Feil ved lagring",
        description: error.message || "Kunne ikke lagre endringer i tjenester.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const defaultImages = [
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800'
  ];

  return (
    <div className="space-y-6">
      <AdminHeader
        icon={Layers}
        title="Tjenester"
        description="Administrer oversikten over tjenester som vises på forsiden."
      >
        <div className="flex gap-2">
          <Button onClick={addService} variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50 bg-white">
            <Plus className="w-4 h-4 mr-2" />
            Ny tjeneste
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-[#1B4965] hover:bg-[#0F3347] text-white"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Lagre endringer
          </Button>
        </div>
      </AdminHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service, index) => (
          <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative group space-y-4">
            <div className="aspect-video bg-gray-50 rounded-xl overflow-hidden relative border border-gray-100 flex items-center justify-center">
              {service.image || defaultImages[index % defaultImages.length] ? (
                <img
                  src={service.image || defaultImages[index % defaultImages.length]}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="text-gray-300 w-8 h-8" />
              )}

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <label htmlFor={`service-upload-${index}`} className="cursor-pointer text-white flex flex-col items-center gap-2 text-xs font-semibold bg-white/20 p-3 rounded-xl backdrop-blur-md hover:bg-white/30 transition-all scale-95 group-hover:scale-100">
                  <Upload className="w-5 h-5" />
                  <span>Bytt bilde</span>
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

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Tjeneste Navn</label>
                <input
                  type="text"
                  value={service.title || ''}
                  onChange={(e) => handleServiceChange(index, 'title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-gray-50/50"
                  placeholder="f.eks. Bokføring"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Beskrivelse</label>
                <textarea
                  value={service.description || ''}
                  onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-gray-50/50 resize-none text-sm"
                  placeholder="Kort forklaring av tjenesten..."
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
              <Button
                variant="ghost"
                size="sm"
                disabled={hasUnsavedChanges}
                onClick={() => onNavigateToDetails && onNavigateToDetails(index)}
                className="text-primary hover:text-primary/80 hover:bg-primary/5 p-0 h-auto font-semibold"
              >
                {hasUnsavedChanges ? 'Lagre først...' : 'Rediger detaljer →'}
              </Button>

              <button
                onClick={() => removeService(index)}
                className="text-gray-300 hover:text-red-500 transition-colors"
                title="Slett tjeneste"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={addService}
          className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-primary/30 hover:text-primary/50 transition-all bg-gray-50/30 group"
        >
          <div className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
            <Plus className="w-6 h-6" />
          </div>
          <span className="font-medium text-sm">Legg til ny tjeneste</span>
        </button>
      </div>
    </div>
  );
};

export default ServicesEditor;
