import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Save, Plus, Trash2, Loader2 } from 'lucide-react';

const ServicesEditor = ({ content, onUpdate }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);

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

  const handleSave = async () => {
    if (!content?.id) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('content')
        .update({ services_data: services })
        .eq('id', content.id);

      if (error) throw error;

      toast({
        title: "Tjenester oppdatert",
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
          <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative group">
            <button
              onClick={() => removeService(index)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Slett tjeneste"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            <div className="space-y-4 pr-8">
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
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#1B4965] focus:border-[#1B4965] bg-white resize-none"
                  placeholder="Kort beskrivelse..."
                />
              </div>
            </div>
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