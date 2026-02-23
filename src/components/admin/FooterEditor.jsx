import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Save, Loader2 } from 'lucide-react';
import { useContent } from '@/contexts/ContentContext';
import RichTextEditor from '@/components/admin/RichTextEditor';

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
  // Lokal state for alle felter
  const [values, setValues] = useState(() => Object.fromEntries(fields.map(f => [f.slug, ''])));

  // Hent eksisterende verdier fra content_blocks
  fields.forEach(f => {
    const { content } = useContent(f.slug);
    if (content && values[f.slug] === '') {
      values[f.slug] = content;
    }
  });

  const handleChange = (slug, value) => {
    setValues(v => ({ ...v, [slug]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    let error = null;
    for (const f of fields) {
      const { update } = useContent(f.slug);
      const res = await update(values[f.slug]);
      if (res) error = res;
    }
    setSaving(false);
    toast({
      title: error ? 'Feil ved lagring' : 'Lagret!',
      description: error ? error.message : 'Footer-innholdet er oppdatert.',
      variant: error ? 'destructive' : undefined
    });
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-100 w-full">
      <h2 className="text-xl font-bold mb-4">Rediger footer-innhold</h2>
      {fields.map(f => (
        <div key={f.slug} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
          {f.rich ? (
            <RichTextEditor
              value={values[f.slug]}
              onChange={(value) => handleChange(f.slug, value)}
              placeholder={f.label}
              minHeight={120}
            />
          ) : (
            <input
              type="text"
              value={values[f.slug]}
              onChange={e => handleChange(f.slug, e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
          )}
        </div>
      ))}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary hover:opacity-90 text-white w-full md:w-auto"
        >
          {saving ? (
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

export default FooterEditor;
