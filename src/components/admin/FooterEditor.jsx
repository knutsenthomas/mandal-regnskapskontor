import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Save, Loader2, Layout, Info } from 'lucide-react';
import { useContent, ContentContext } from '@/contexts/ContentContext';
import RichTextEditor from '@/components/admin/RichTextEditor';
import AdminHeader from './layout/AdminHeader';
import { useContext } from 'react';

const fields = [
  { slug: 'footer.companyName', label: 'Firmanavn' },
  { slug: 'footer.companyDesc', label: 'Beskrivelse', rich: true },
  { slug: 'footer.quicklinksLabel', label: 'Hurtiglenker label' },
  { slug: 'footer.contactLabel', label: 'Kontakt label' },
  { slug: 'footer.phone', label: 'Telefon' },
  { slug: 'footer.email', label: 'E-post' },
  { slug: 'footer.address', label: 'Adresse', rich: true },
  { slug: 'footer.hoursLabel', label: 'Åpningstider label' },
  { slug: 'footer.hoursWeek', label: 'Åpningstider ukedager', rich: true },
  { slug: 'footer.hoursWeekend', label: 'Åpningstider helg', rich: true },
  { slug: 'footer.link.home', label: 'Lenke: Hjem' },
  { slug: 'footer.link.services', label: 'Lenke: Tjenester' },
  { slug: 'footer.link.about', label: 'Lenke: Om oss' },
  { slug: 'footer.link.contact', label: 'Lenke: Kontakt' },
  { slug: 'footer.adminlink', label: 'Adminlenke' },
  { slug: 'footer.hours.weeklabel', label: 'Label ukedager' },
  { slug: 'footer.hours.weekendlabel', label: 'Label helg' },
  { slug: 'footer.copyright', label: 'Copyright', rich: true },
];

const FooterEditor = () => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const { blocks, loading: contentLoading, updateBlock } = useContext(ContentContext);

  const [values, setValues] = useState({});
  const [hydrated, setHydrated] = useState(false);

  const isLoading = contentLoading;

  useEffect(() => {
    if (hydrated || isLoading || !blocks) {
      return;
    }

    setValues((prev) => {
      const next = { ...prev };
      let changed = false;

      fields.forEach(field => {
        const blockContent = blocks[field.slug]?.content || '';
        if (blockContent && !prev[field.slug]) {
          next[field.slug] = blockContent;
          changed = true;
        }
      });

      return changed ? next : prev;
    });

    setHydrated(true);
  }, [hydrated, isLoading, blocks]);

  const handleChange = (slug, value) => {
    setValues(v => ({ ...v, [slug]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    let errorOccurred = false;

    try {
      for (const field of fields) {
        const result = await updateBlock(field.slug, values[field.slug] || '');
        if (result) errorOccurred = true;
      }
    } catch (err) {
      errorOccurred = true;
    }

    setSaving(false);
    toast({
      title: errorOccurred ? 'Feil ved lagring' : 'Lagret!',
      description: errorOccurred ? 'Noe gikk galt ved lagring av enkelte felt.' : 'Footer-innholdet er oppdatert.',
      variant: errorOccurred ? 'destructive' : undefined,
      className: errorOccurred ? "" : "bg-green-50 border-green-200"
    });
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        icon={Layout}
        title="Footer & Sidebunn"
        description="Rediger alt innhold som vises i bunnen av nettsiden din."
      >
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#1B4965] hover:bg-[#0F3347] text-white flex items-center gap-2"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Lagre endringer
        </Button>
      </AdminHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
            {fields.map((f) => (
              <div key={f.slug} className="p-6 transition-colors hover:bg-gray-50/30">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">{f.label}</label>
                {f.rich ? (
                  <RichTextEditor
                    value={values[f.slug] || ''}
                    onChange={(value) => handleChange(f.slug, value)}
                    placeholder={f.label}
                    minHeight={140}
                  />
                ) : (
                  <input
                    type="text"
                    value={values[f.slug] || ''}
                    onChange={e => handleChange(f.slug, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-gray-50/50 font-medium"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-blue-800 text-xs uppercase tracking-widest">
              <Info className="w-4 h-4" />
              Informasjon
            </div>
            <p className="text-xs text-blue-800/80 leading-relaxed italic">
              Footer-innholdet er felles for alle sider. Her kan du endre alt fra firmanavn og kontaktinfo til åpningstider og lenker som vises nederst.
            </p>
            <div className="pt-2">
              <p className="text-[10px] font-bold text-blue-800/60 uppercase mb-1">Tips</p>
              <p className="text-xs text-blue-800/80 leading-relaxed italic">
                Bruk "Rich Text" for å legge til formatering eller linjeskift i beskrivelser og adresser.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterEditor;
