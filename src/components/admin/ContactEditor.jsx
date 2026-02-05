
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Save, Loader2, Phone, Mail, MapPin, Clock } from 'lucide-react';

const ContactEditor = ({ content, onUpdate }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    contact_phone: '',
    contact_email: '',
    contact_address: '',
    opening_hours: ''
  });

  useEffect(() => {
    if (content) {
      setFormData({
        contact_phone: content.contact_phone || '',
        contact_email: content.contact_email || '',
        contact_address: content.contact_address || '',
        opening_hours: content.opening_hours || ''
      });
    }
  }, [content]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
        title: "Kontaktinfo lagret",
        description: "Informasjonen er oppdatert.",
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <Phone className="w-4 h-4 mr-2 text-gray-400" />
            Telefon
          </label>
          <input
            type="text"
            name="contact_phone"
            value={formData.contact_phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#1B4965] focus:border-[#1B4965]"
            placeholder="F.eks. 91 75 98 55"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <Mail className="w-4 h-4 mr-2 text-gray-400" />
            E-post
          </label>
          <input
            type="email"
            name="contact_email"
            value={formData.contact_email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#1B4965] focus:border-[#1B4965]"
            placeholder="post@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
            Adresse
          </label>
          <textarea
            name="contact_address"
            value={formData.contact_address}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#1B4965] focus:border-[#1B4965] resize-none"
            placeholder="Gateadresse, Postnummer Sted"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <Clock className="w-4 h-4 mr-2 text-gray-400" />
            Åpningstider
          </label>
          <textarea
            name="opening_hours"
            value={formData.opening_hours}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#1B4965] focus:border-[#1B4965] resize-none"
            placeholder="Mandag - Fredag: 08:00 - 16:00"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <Button 
          onClick={handleSave} 
          disabled={loading}
          className="bg-[#1B4965] hover:bg-[#0F3347] text-white"
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

export default ContactEditor;
