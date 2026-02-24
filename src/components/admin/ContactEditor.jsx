import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Save, Loader2, Phone, Mail, MapPin, Clock } from 'lucide-react';
import RichTextEditor from '@/components/admin/RichTextEditor';
import AdminHeader from './layout/AdminHeader';

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
    if (!content?.id) {
      toast({
        title: "Feil",
        description: "Mangler ID for innhold. Prøv å laste siden på nytt.",
        variant: "destructive"
      });
      return;
    }
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
      console.error("Contact save error:", error);
      toast({
        title: "Feil ved lagring",
        description: error.message || "Kunne ikke lagre kontaktinformasjon.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      <AdminHeader
        icon={Phone}
        title="Kontaktinformasjon"
        description="Oppdater bedriftens kontaktinformasjon, adresse og åpningstider her."
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
            <Phone className="w-3.5 h-3.5 text-primary" />
            Telefonnummer
          </label>
          <input
            type="text"
            name="contact_phone"
            value={formData.contact_phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-gray-50/50 font-bold text-lg"
            placeholder="f.eks. 91 75 98 55"
          />
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
            <Mail className="w-3.5 h-3.5 text-primary" />
            E-postadresse
          </label>
          <input
            type="email"
            name="contact_email"
            value={formData.contact_email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-gray-50/50 font-bold text-lg"
            placeholder="post@mandalregnskap.no"
          />
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4 md:col-span-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            Besøksadresser
          </label>
          <RichTextEditor
            value={formData.contact_address}
            onChange={(value) => setFormData(prev => ({ ...prev, contact_address: value }))}
            placeholder="Gateadresse, Postnummer Sted"
            minHeight={180}
          />
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4 md:col-span-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
            <Clock className="w-3.5 h-3.5 text-primary" />
            Åpningstider
          </label>
          <RichTextEditor
            value={formData.opening_hours}
            onChange={(value) => setFormData(prev => ({ ...prev, opening_hours: value }))}
            placeholder="Mandag - Fredag: 08:00 - 16:00"
            minHeight={180}
          />
        </div>
      </div>
    </div>
  );
};

export default ContactEditor;
