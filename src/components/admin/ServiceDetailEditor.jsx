import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Save, Loader2, Plus, Trash2, FileText, Info, CheckCircle2, ListChecks, Banknote, HelpCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RichTextEditor from '@/components/admin/RichTextEditor';
import AdminHeader from './layout/AdminHeader';

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


  if (!selectedServiceId) return (
    <div className="p-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
      <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
      <h3 className="text-lg font-bold text-gray-900">Ingen tjeneste valgt</h3>
      <p className="text-gray-500">Velg en tjeneste fra menyen for å redigere detaljer.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <AdminHeader
        icon={FileText}
        title={`Detaljer: ${serviceTitle}`}
        description="Konfigurer utvidet informasjon, prispakker og FAQ for denne tjenesten."
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
          {/* Innledning og Målgruppe */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <RichTextEditor
              label="Utvidet beskrivelse (Innledning)"
              value={data.extended_description}
              onChange={(value) => setData({ ...data, extended_description: value })}
              placeholder="Skriv innledningen til tjenestesiden her..."
              minHeight={250}
            />

            <RichTextEditor
              label="Målgruppe (Hvem er dette for?)"
              value={data.target_audience}
              onChange={(value) => setData({ ...data, target_audience: value })}
              placeholder="Beskriv hvem tjenesten passer for..."
              minHeight={150}
            />
          </div>

          {/* Offerings */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Hva vi tilbyr
              </h3>
              <Button size="sm" variant="outline" onClick={() => addItem('offerings', { title: '' })} className="rounded-xl border-gray-200 text-gray-600">
                <Plus className="w-4 h-4 mr-1" /> Legg til
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.offerings.map((item, index) => (
                <div key={index} className="flex gap-2 items-center bg-gray-50/50 p-3 rounded-xl border border-gray-100 group transition-all hover:bg-white hover:shadow-md">
                  <Select
                    value={item.icon}
                    onValueChange={(val) => updateItem('offerings', index, 'icon', val)}
                  >
                    <SelectTrigger className="w-[120px] bg-white border-gray-200 rounded-lg">
                      <SelectValue placeholder="Ikon" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-xl z-50 max-h-[300px] overflow-y-auto">
                      {AVAILABLE_ICONS.map(icon => <SelectItem key={icon} value={icon}>{icon}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateItem('offerings', index, 'title', e.target.value)}
                    className="flex-1 p-2 border border-gray-200 rounded-lg outline-none bg-white font-medium text-sm"
                    placeholder="Tittel..."
                  />
                  <Button size="icon" variant="ghost" className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100" onClick={() => removeItem('offerings', index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {data.offerings.length === 0 && (
                <div className="col-span-2 py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-xs">
                  Ingen tilbudspunkter lagt til.
                </div>
              )}
            </div>
          </div>

          {/* Prosess seksjon */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                <ListChecks className="w-5 h-5 text-primary" />
                Prosess – steg for steg
              </h3>
              <Button size="sm" variant="outline" onClick={() => addItem('process_steps', { title: '', description: '' })} className="rounded-xl border-gray-200 text-gray-600">
                <Plus className="w-4 h-4 mr-1" /> Legg til steg
              </Button>
            </div>
            <div className="space-y-4">
              {data.process_steps.map((step, index) => (
                <div key={index} className="flex gap-4 items-start bg-gray-50/50 p-5 rounded-2xl border border-gray-100 group relative">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                    {index + 1}
                  </div>
                  <div className="flex-1 space-y-4">
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => updateItem('process_steps', index, 'title', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none bg-white font-bold text-gray-800"
                      placeholder="Tittel på steg..."
                    />
                    <RichTextEditor
                      label={null}
                      value={step.description}
                      onChange={(value) => updateItem('process_steps', index, 'description', value)}
                      placeholder="Beskrivelse av steget..."
                      minHeight={120}
                    />
                  </div>
                  <Button size="icon" variant="ghost" className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 absolute top-4 right-4" onClick={() => removeItem('process_steps', index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {data.process_steps.length === 0 && (
                <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-xs">
                  Ingen steg i prosessen lagt til.
                </div>
              )}
            </div>
          </div>

          {/* Pricing Packages */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                <Banknote className="w-5 h-5 text-primary" />
                Prispakker
              </h3>
              <Button size="sm" variant="outline" onClick={() => addItem('pricing_packages', { name: '', price: '', description: '', features: [''] })} className="rounded-xl border-gray-200 text-gray-600">
                <Plus className="w-4 h-4 mr-1" /> Ny pakke
              </Button>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {data.pricing_packages.map((pkg, index) => (
                <div key={index} className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 flex flex-col gap-4 relative group">
                  <Button size="icon" variant="ghost" className="absolute top-4 right-4 h-8 w-8 text-gray-300 hover:text-red-500" onClick={() => removeItem('pricing_packages', index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Pakkenavn</label>
                      <input type="text" value={pkg.name} onChange={(e) => updateItem('pricing_packages', index, 'name', e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none bg-white font-bold" placeholder="f.eks. Basis" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Pris</label>
                      <input type="text" value={pkg.price} onChange={(e) => updateItem('pricing_packages', index, 'price', e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none bg-white font-bold text-primary" placeholder="f.eks. 1500,-/mnd" />
                    </div>
                  </div>

                  <RichTextEditor
                    label="Beskrivelse"
                    value={pkg.description}
                    onChange={(value) => updateItem('pricing_packages', index, 'description', value)}
                    placeholder="Kort forklaring av pakken..."
                    minHeight={120}
                  />

                  <div className="space-y-3 pt-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Inkluderte tjenester</label>
                    <div className="space-y-2">
                      {pkg.features && pkg.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex gap-2 group/feat">
                          <input
                            type="text"
                            value={feat}
                            onChange={(e) => updateItemFeature(index, fIdx, e.target.value)}
                            className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white"
                            placeholder="f.eks. Bilagsinnføring"
                          />
                          <button onClick={() => removeFeature(index, fIdx)} className="text-gray-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                      <Button size="sm" variant="ghost" className="w-full text-xs font-bold text-primary hover:bg-primary/5 rounded-lg border border-dashed border-primary/20" onClick={() => addFeature(index)}>
                        <Plus className="w-3 h-3 mr-1" /> Legg til funksjon
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {data.pricing_packages.length === 0 && (
                <div className="col-span-2 py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-xs">
                  Ingen prispakker lagt til.
                </div>
              )}
            </div>
          </div>

          {/* FAQ seksjon */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                <HelpCircle className="w-5 h-5 text-gray-400" />
                Ofte stilte spørsmål (FAQ)
              </h3>
              <Button size="sm" variant="outline" onClick={() => addItem('faqs', { question: '', answer: '' })} className="rounded-xl border-gray-200 text-gray-600">
                <Plus className="w-4 h-4 mr-1" /> Nytt spørsmål
              </Button>
            </div>
            <div className="space-y-4">
              {data.faqs.map((faq, index) => (
                <div key={index} className="flex gap-4 items-start bg-gray-50/50 p-6 rounded-2xl border border-gray-100 group relative">
                  <div className="flex-1 space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Spørsmål</label>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => updateItem('faqs', index, 'question', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none bg-white font-bold"
                        placeholder="Hva koster tjenesten?"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Svar</label>
                      <RichTextEditor
                        label={null}
                        value={faq.answer}
                        onChange={(value) => updateItem('faqs', index, 'answer', value)}
                        placeholder="Svaret på spørsmålet..."
                        minHeight={120}
                      />
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100" onClick={() => removeItem('faqs', index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {data.faqs.length === 0 && (
                <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-xs">
                  Ingen spørsmål lagt til.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-primary rounded-2xl p-6 text-white shadow-lg space-y-4 relative overflow-hidden group">
            <h4 className="font-bold text-lg relative z-10 flex items-center gap-2">
              <Info className="w-5 h-5" />
              Redigeringstips
            </h4>
            <p className="text-xs text-blue-100 leading-relaxed relative z-10">
              Her kan du lage en rik opplevelse for kundene dine. Husk at detaljerte beskrivelser og tydelige priser ofte fører til flere henvendelser.
            </p>
            <div className="pt-4 space-y-3 relative z-10">
              <div className="flex gap-2 items-start">
                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                <p className="text-[11px] text-blue-50">Bruk gjerne FAQ til å svare på vanlige bekymringer kundene har.</p>
              </div>
              <div className="flex gap-2 items-start">
                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                <p className="text-[11px] text-blue-50">Prispakker gjør det enkelt for kunden å velge rett nivå.</p>
              </div>
            </div>
            <FileText className="absolute -right-10 -bottom-10 w-40 h-40 text-white/5 group-hover:rotate-6 transition-transform duration-1000" />
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
            <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sist lagret</h5>
            <p className="text-sm font-medium text-gray-900">Endringene lagres direkte i databasen og blir synlige med en gang.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailEditor;
