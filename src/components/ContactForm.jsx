import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient'; // Sjekk at banen er riktig

const ContactForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    navn: '',
    epost: '',
    telefon: '',
    bedriftsnavn: '',
    melding: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.navn.trim()) newErrors.navn = 'Navn er påkrevd';
    if (!formData.epost.trim()) {
      newErrors.epost = 'E-post er påkrevd';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.epost)) {
      newErrors.epost = 'Ugyldig e-postadresse';
    }
    if (!formData.telefon.trim()) newErrors.telefon = 'Telefon er påkrevd';
    if (!formData.melding.trim()) newErrors.melding = 'Melding er påkrevd';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({ title: 'Feil i skjema', description: 'Sjekk feltene.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. LAGRE I SUPABASE (Databasen din)
      const { error: supabaseError } = await supabase
        .from('contact_messages')
        .insert([
          { 
            navn: formData.navn, 
            epost: formData.epost, 
            telefon: formData.telefon, 
            bedriftsnavn: formData.bedriftsnavn, 
            melding: formData.melding 
          }
        ]);

      if (supabaseError) throw supabaseError;

      // 2. SEND E-POST VARSEL (Valgfritt, bruker Web3Forms)
      // Hvis du kun vil bruke Supabase, kan du fjerne hele denne 'fetch'-blokken
      await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: "66c47691-798c-49ec-88cf-ced0cea68979", // <--- LEGG INN NØKKEL HER
          subject: "Ny henvendelse",
          from_name: "Mandal Regnskapskontor nettside",
          ...formData,
        }),
      });

      // Suksess!
      toast({
        title: 'Melding sendt!',
        description: 'Vi har mottatt henvendelsen din.',
        className: 'bg-green-50 border-green-200'
      });

      setFormData({ navn: '', epost: '', telefon: '', bedriftsnavn: '', melding: '' });

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Noe gikk galt',
        description: 'Kunne ikke sende meldingen. Prøv igjen senere.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Overskrift */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-[#1B4965] font-semibold tracking-wider text-sm uppercase mb-3 block">Ta kontakt</span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Kontakt oss</h2>
          <p className="text-xl text-gray-600 font-light">
            Vi er her for å hjelpe deg med dine behov.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Kontaktinfo-kort (Venstre side) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-[#1B4965] rounded-3xl p-10 text-white h-full shadow-2xl relative overflow-hidden">
               {/* ... Samme innhold som før ... */}
               <h3 className="text-2xl font-bold mb-10 relative z-10">Kontaktinformasjon</h3>
               <div className="space-y-8 relative z-10">
                  <div className="flex items-start space-x-6">
                    <Phone className="w-6 h-6 mt-1" />
                    <div><p className="text-xs font-bold text-blue-200">Telefon</p><p className="text-xl">91 75 98 55</p></div>
                  </div>
                  <div className="flex items-start space-x-6">
                    <Mail className="w-6 h-6 mt-1" />
                    <div><p className="text-xs font-bold text-blue-200">E-post</p><p className="text-xl break-all">jan@mandalregnskapskontor.no</p></div>
                  </div>
                  <div className="flex items-start space-x-6">
                    <MapPin className="w-6 h-6 mt-1" />
                    <div><p className="text-xs font-bold text-blue-200">Adresse</p><p className="text-xl">Bryggegata 1, 4514 Mandal</p></div>
                  </div>
               </div>
            </div>
          </motion.div>

          {/* Skjema (Høyre side) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Navn *</label>
                  <input type="text" name="navn" value={formData.navn} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B4965] outline-none" placeholder="Ditt navn" />
                  {errors.navn && <p className="text-red-500 text-xs mt-1">{errors.navn}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Telefon *</label>
                  <input type="tel" name="telefon" value={formData.telefon} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B4965] outline-none" placeholder="Mobilnummer" />
                  {errors.telefon && <p className="text-red-500 text-xs mt-1">{errors.telefon}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">E-post *</label>
                <input type="email" name="epost" value={formData.epost} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B4965] outline-none" placeholder="din@epost.no" />
                {errors.epost && <p className="text-red-500 text-xs mt-1">{errors.epost}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bedriftsnavn</label>
                <input type="text" name="bedriftsnavn" value={formData.bedriftsnavn} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B4965] outline-none" placeholder="Valgfritt" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Melding *</label>
                <textarea name="melding" rows={5} value={formData.melding} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B4965] outline-none resize-none" placeholder="Hva gjelder det?" />
                {errors.melding && <p className="text-red-500 text-xs mt-1">{errors.melding}</p>}
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full bg-[#1B4965] hover:bg-[#0F3347] text-white py-6 text-lg rounded-lg shadow-lg">
                {isSubmitting ? 'Sender...' : <span className="flex items-center justify-center">Send henvendelse <Send className="ml-2 h-5 w-5" /></span>}
              </Button>

            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;