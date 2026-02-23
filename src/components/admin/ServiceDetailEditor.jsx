import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Save, Loader2, Plus, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RichTextEditor from '@/components/admin/RichTextEditor';

const AVAILABLE_ICONS = [
  "BookOpen", "FileSpreadsheet", "FileCheck", "UploadCloud",
  "Send", "Bell", "ListChecks", "AlertTriangle",
  "Banknote", "Plane", "HeartPulse",
  "Scale", "Stamp", "Search", "ShieldCheck",
  "GitMerge", "Users", "Handshake", "FileWarning",
  "CheckCircle2", "Star", "Zap", "Layout"
];

const ServiceDetailEditor = ({ selectedServiceId, serviceTitle }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    extended_description: '',
    target_audience: '',
    offerings: [],
    process_steps: [],
    pricing_packages: [],
    faqs: []
  });

  useEffect(() => {
    if (selectedServiceId) {
      fetchDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedServiceId]);

  const normalizeTitle = (title) => (title || '').toLowerCase();

  const getIconSequenceForService = (title) => {
    const t = normalizeTitle(title);

    if (t.includes('regnskap') || t.includes('okonomi') || t.includes('økonomi')) {
      return ['FileSpreadsheet', 'BookOpen', 'Banknote', 'FileCheck'];
    }

    if (t.includes('faktur') || t.includes('betaling')) {
      return ['FileCheck', 'Send', 'Bell', 'Banknote'];
    }

    if (t.includes('lonn') || t.includes('lønn') || t.includes('personal')) {
      return ['Users', 'Banknote', 'FileSpreadsheet', 'Bell'];
    }

    if (t.includes('revisjon') || t.includes('kontroll')) {
      return ['Search', 'ShieldCheck', 'FileWarning', 'CheckCircle2'];
    }

    if (t.includes('radgiv') || t.includes('rådgiv') || t.includes('strategi')) {
      return ['Users', 'Handshake', 'Zap', 'Star'];
    }

    if (t.includes('skatt') || t.includes('avgift')) {
      return ['Stamp', 'Scale', 'FileSpreadsheet', 'CheckCircle2'];
    }

    if (t.includes('eiendom')) {
      return ['Layout', 'Scale', 'Search', 'ShieldCheck'];
    }

    if (t.includes('operativ') || t.includes('leder')) {
      return ['ListChecks', 'Bell', 'Send', 'CheckCircle2'];
    }

    return ['CheckCircle2', 'Star', 'Zap', 'ListChecks'];
  };

  const getDefaultOfferingIcon = (title, index) => {
    const sequence = getIconSequenceForService(title);
    return sequence[index % sequence.length] || 'CheckCircle2';
  };

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const { data: details, error } = await supabase
        .from('service_details')
        .select('*')
        .eq('service_id', selectedServiceId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (details) {
        setData({
          id: details.id,
          extended_description: details.extended_description || '',
          target_audience: details.target_audience || '',
          offerings: (details.offerings || []).map((item, index) => ({
            ...item,
            icon: item?.icon || getDefaultOfferingIcon(serviceTitle, index)
          })),
          process_steps: details.process_steps || [],
          pricing_packages: details.pricing_packages || [],
          faqs: details.faqs || []
        });
      } else {
        setData({
          extended_description: '',
          target_audience: '',
          offerings: [],
          process_steps: [],
          pricing_packages: [],
          faqs: []
        });
      }
    } catch (error) {
      toast({
        title: "Feil ved henting",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedServiceId) {
      toast({
        title: "Feil",
        description: "Velg en tjeneste for å lagre innhold.",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      const offeringsWithIcons = (data.offerings || []).map((item, index) => ({
        ...item,
        icon: item?.icon || getDefaultOfferingIcon(serviceTitle, index)
      }));

      const { error } = await supabase.rpc('upsert_service_details', {
        p_service_id: selectedServiceId,
        p_extended_description: data.extended_description,
        p_target_audience: data.target_audience,
        p_offerings: offeringsWithIcons,
        p_process_steps: data.process_steps,
        p_pricing_packages: data.pricing_packages,
        p_faqs: data.faqs
      });

      if (error) throw error;

      toast({
        title: "Lagret!",
        description: "Tjenestedetaljene er oppdatert.",
        className: "bg-green-50 border-green-200"
      });
      fetchDetails();

    } catch (error) {
      toast({
        title: "Kunne ikke lagre",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addItem = (field, emptyItem) => {
    setData(prev => {
      const nextItem = { ...emptyItem };
      if (field === 'offerings' && !nextItem.icon) {
        // Fallback icon generation
        const sequence = getIconSequenceForService(serviceTitle);
        nextItem.icon = sequence[prev[field].length % sequence.length] || 'CheckCircle2';
      }
      return { ...prev, [field]: [...prev[field], nextItem] };
    });

    let title = "Nytt element lagt til";
    let description = "Et nytt felt er lagt til i listen.";

    switch (field) {
      case 'offerings':
        title = "Nytt tilbudspunkt lagt til";
        description = "Fyll inn ikon og tittel for det nye punktet.";
        break;
      case 'process_steps':
        title = "Nytt prosessteg lagt til";
        description = "Beskriv det nye steget i prosessen.";
        break;
      case 'pricing_packages':
        title = "Ny prispakke lagt til";
        description = "En ny, tom prispakke er opprettet.";
        break;
      case 'faqs':
        title = "Nytt spørsmål lagt til";
        description = "Skriv inn spørsmål og svar.";
        break;
      default:
        break;
    }

    toast({
      title: title,
      description: description,
      className: "bg-blue-50 border-blue-200"
    });
  };

  const updateItem = (field, index, subField, value) => {
    setData(prev => {
      const newList = [...(prev[field] || [])];
      if (newList[index]) {
        newList[index] = { ...newList[index], [subField]: value };
      }
      return { ...prev, [field]: newList };
    });
  };

  const updateItemFeature = (packageIndex, featureIndex, value) => {
    setData(prev => {
      const newPackages = [...(prev.pricing_packages || [])];
      if (newPackages[packageIndex] && newPackages[packageIndex].features) {
        const newFeatures = [...newPackages[packageIndex].features];
        newFeatures[featureIndex] = value;
        newPackages[packageIndex] = { ...newPackages[packageIndex], features: newFeatures };
      }
      return { ...prev, pricing_packages: newPackages };
    });
  };

  const addFeature = (packageIndex) => {
    setData(prev => {
      const newPackages = [...(prev.pricing_packages || [])];
      if (newPackages[packageIndex]) {
        const newFeatures = [...(newPackages[packageIndex].features || []), ""];
        newPackages[packageIndex] = { ...newPackages[packageIndex], features: newFeatures };
      }
      return { ...prev, pricing_packages: newPackages };
    });

    toast({
      title: "Ny funksjon lagt til",
      description: "En ny linje for funksjon er lagt til i pakken.",
      className: "bg-blue-50 border-blue-200"
    });
  };

  const removeFeature = (packageIndex, featureIndex) => {
    setData(prev => {
      const newPackages = [...(prev.pricing_packages || [])];
      if (newPackages[packageIndex] && newPackages[packageIndex].features) {
        const newFeatures = [...newPackages[packageIndex].features];
        newFeatures.splice(featureIndex, 1);
        newPackages[packageIndex] = { ...newPackages[packageIndex], features: newFeatures };
      }
      return { ...prev, pricing_packages: newPackages };
    });

    toast({
      title: "Funksjon slettet",
      description: "Funksjonen er fjernet fra pakken.",
      variant: "destructive"
    });
  };

  const removeItem = (field, index) => {
    setData(prev => {
      const newList = [...(prev[field] || [])];
      newList.splice(index, 1);
      return { ...prev, [field]: newList };
    });

    let title = "Element slettet";

    switch (field) {
      case 'offerings':
        title = "Tilbudspunkt slettet";
        break;
      case 'process_steps':
        title = "Prosessteg slettet";
        break;
      case 'pricing_packages':
        title = "Prispakke slettet";
        break;
      case 'faqs':
        title = "Spørsmål slettet";
        break;
      default:
        break;
    }

    toast({
      title: title,
      description: "Elementet er fjernet fra listen.",
      variant: "destructive"
    });
  };


  if (!selectedServiceId) return <div className="p-8 text-center text-gray-500">Velg en tjeneste for å redigere detaljer.</div>;

  return (
    <div className="space-y-12 pb-12">
      <style>{`
        .super-custom-save-btn {
          background-color: #1B4965 !important;
          color: white !important;
          border: none !important;
        }
      `}</style>

      <div className="flex justify-between items-center mb-8 pt-2">
        <h2 className="text-lg font-semibold text-gray-700">Innhold</h2>
      </div>

      {/* Innledning og Målgruppe */}
      <div className="space-y-6">
        <div className="space-y-2">
          <RichTextEditor
            label="Utvidet beskrivelse (Innledning)"
            value={data.extended_description}
            onChange={(value) => setData({ ...data, extended_description: value })}
            placeholder="Skriv innledningen til tjenestesiden her..."
            minHeight={220}
          />
        </div>

        <div className="space-y-2">
          <RichTextEditor
            label="Målgruppe (Hvem er dette for?)"
            value={data.target_audience}
            onChange={(value) => setData({ ...data, target_audience: value })}
            placeholder="Beskriv hvem tjenesten passer for..."
            minHeight={180}
          />
        </div>
      </div>

      {/* Offerings */}
      <div className="space-y-4 bg-gray-50 p-6 rounded-xl">
        <div className="flex justify-between items-center">
          <label className="block text-lg font-bold text-gray-800">Hva vi tilbyr (Liste med ikoner)</label>
          <Button size="sm" variant="outline" onClick={() => addItem('offerings', { title: '' })}>
            <Plus className="w-4 h-4 mr-2" /> Legg til punkt
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.offerings.map((item, index) => (
            <div key={index} className="flex gap-2 items-center bg-white p-3 rounded shadow-sm relative">
              <Select
                value={item.icon}
                onValueChange={(val) => updateItem('offerings', index, 'icon', val)}
              >
                <SelectTrigger className="w-[180px] bg-white z-10">
                  <SelectValue placeholder="Ikon" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-xl z-50 max-h-[300px] overflow-y-auto">
                  {AVAILABLE_ICONS.map(icon => <SelectItem key={icon} value={icon} className="cursor-pointer hover:bg-gray-100">{icon}</SelectItem>)}
                </SelectContent>
              </Select>
              <input
                type="text"
                value={item.title}
                onChange={(e) => updateItem('offerings', index, 'title', e.target.value)}
                className="flex-1 p-2 border rounded"
                placeholder="Tittel..."
              />
              <Button size="icon" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => removeItem('offerings', index)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Prosess seksjon */}
      <div className="space-y-4 bg-gray-50 p-6 rounded-xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <label className="block text-lg font-bold text-gray-800">Prosess (Steg for steg)</label>
          </div>
          <Button size="sm" variant="outline" onClick={() => addItem('process_steps', { title: '', description: '' })}>
            <Plus className="w-4 h-4 mr-2" /> Legg til steg
          </Button>
        </div>
        <div className="space-y-3">
          {data.process_steps.map((step, index) => (
            <div key={index} className="flex gap-4 items-start bg-white p-4 rounded shadow-sm">
              <span className="font-bold text-gray-400 mt-2">#{index + 1}</span>
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={step.title}
                  onChange={(e) => updateItem('process_steps', index, 'title', e.target.value)}
                  className="w-full p-2 border rounded font-medium"
                  placeholder="Steg tittel"
                />
                <RichTextEditor
                  label={null}
                  value={step.description}
                  onChange={(value) => updateItem('process_steps', index, 'description', value)}
                  placeholder="Beskrivelse av steget..."
                  minHeight={120}
                />
              </div>
              <Button size="icon" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => removeItem('process_steps', index)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Packages */}
      <div className="space-y-4 bg-gray-50 p-6 rounded-xl">
        <div className="flex justify-between items-center">
          <label className="block text-lg font-bold text-gray-800">Prispakker</label>
          <Button size="sm" variant="outline" onClick={() => addItem('pricing_packages', { name: '', price: '', description: '', features: [''] })}>
            <Plus className="w-4 h-4 mr-2" /> Legg til pakke
          </Button>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {data.pricing_packages.map((pkg, index) => (
            <div key={index} className="bg-white p-4 rounded shadow border border-gray-200 flex flex-col gap-3">
              <div className="flex justify-between">
                <span className="font-bold text-sm text-gray-500">Pakke {index + 1}</span>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500" onClick={() => removeItem('pricing_packages', index)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              <input type="text" value={pkg.name} onChange={(e) => updateItem('pricing_packages', index, 'name', e.target.value)} className="p-2 border rounded" placeholder="Pakkenavn (f.eks Basis)" />
              <input type="text" value={pkg.price} onChange={(e) => updateItem('pricing_packages', index, 'price', e.target.value)} className="p-2 border rounded" placeholder="Pris (f.eks 2500,-/mnd)" />
              <RichTextEditor
                label={null}
                value={pkg.description}
                onChange={(value) => updateItem('pricing_packages', index, 'description', value)}
                placeholder="Kort beskrivelse..."
                minHeight={120}
              />

              <div className="mt-2 space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Inkludert</label>
                {pkg.features && pkg.features.map((feat, fIdx) => (
                  <div key={fIdx} className="flex gap-2">
                    <input
                      type="text"
                      value={feat}
                      onChange={(e) => updateItemFeature(index, fIdx, e.target.value)}
                      className="flex-1 p-1 px-2 border rounded text-sm bg-gray-50"
                    />
                    <button onClick={() => removeFeature(index, fIdx)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
                <Button size="sm" variant="ghost" className="w-full text-xs" onClick={() => addFeature(index)}><Plus className="w-3 h-3 mr-1" /> Legg til funksjon</Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ seksjon */}
      <div className="space-y-4 bg-gray-50 p-6 rounded-xl">
        <div className="flex justify-between items-center">
          <label className="block text-lg font-bold text-gray-800">FAQ (Ofte stilte spørsmål)</label>
          <Button size="sm" variant="outline" onClick={() => addItem('faqs', { question: '', answer: '' })}>
            <Plus className="w-4 h-4 mr-2" /> Legg til spørsmål
          </Button>
        </div>
        <div className="space-y-3">
          {data.faqs.map((faq, index) => (
            <div key={index} className="flex gap-4 items-start bg-white p-4 rounded shadow-sm">
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) => updateItem('faqs', index, 'question', e.target.value)}
                  className="w-full p-2 border rounded font-medium"
                  placeholder="Spørsmål..."
                />
                <RichTextEditor
                  label={null}
                  value={faq.answer}
                  onChange={(value) => updateItem('faqs', index, 'answer', value)}
                  placeholder="Svar..."
                  minHeight={120}
                />
              </div>
              <Button size="icon" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => removeItem('faqs', index)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
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

export default ServiceDetailEditor;
