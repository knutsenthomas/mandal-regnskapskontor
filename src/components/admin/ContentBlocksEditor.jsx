import React, { useState } from 'react';
import { useContent } from '../../contexts/ContentContext';

const blockSlugs = [
  // Hero
  { slug: 'hero.title', label: 'Hero-tittel' },
  { slug: 'hero.lines', label: 'Hero: undertekster (JSON array)' },
  { slug: 'hero.button', label: 'Hero: knappetekst' },
  // About
  { slug: 'about.sectionlabel', label: 'Om oss: seksjonslabel' },
  { slug: 'about.title', label: 'Om oss: tittel' },
  { slug: 'about.subtitle', label: 'Om oss: undertittel' },
  { slug: 'about.text', label: 'Om oss: hovedtekst' },
  { slug: 'about.values', label: 'Om oss: verdier (JSON array)' },
  // Contact
  { slug: 'contact.sectionlabel', label: 'Kontakt: seksjonslabel' },
  { slug: 'contact.title', label: 'Kontakt: tittel' },
  { slug: 'contact.subtitle', label: 'Kontakt: undertittel' },
  { slug: 'contact.phone', label: 'Kontakt: telefon' },
  { slug: 'contact.email', label: 'Kontakt: e-post' },
  { slug: 'contact.address', label: 'Kontakt: adresse' },
  { slug: 'contact.phoneLabel', label: 'Kontakt: label telefon' },
  { slug: 'contact.emailLabel', label: 'Kontakt: label e-post' },
  { slug: 'contact.addressLabel', label: 'Kontakt: label adresse' },
  { slug: 'contact.form.name', label: 'Kontakt: skjema navn' },
  { slug: 'contact.form.phone', label: 'Kontakt: skjema telefon' },
  { slug: 'contact.form.email', label: 'Kontakt: skjema e-post' },
  { slug: 'contact.form.company', label: 'Kontakt: skjema bedriftsnavn' },
  { slug: 'contact.form.message', label: 'Kontakt: skjema melding' },
  { slug: 'contact.form.button', label: 'Kontakt: skjema knapp' },
  // Footer
  { slug: 'footer.companyName', label: 'Footer: firmanavn' },
  { slug: 'footer.companyDesc', label: 'Footer: beskrivelse' },
  { slug: 'footer.quicklinksLabel', label: 'Footer: hurtiglenker label' },
  { slug: 'footer.contactLabel', label: 'Footer: kontakt label' },
  { slug: 'footer.phone', label: 'Footer: telefon' },
  { slug: 'footer.email', label: 'Footer: e-post' },
  { slug: 'footer.address', label: 'Footer: adresse' },
  { slug: 'footer.hoursLabel', label: 'Footer: åpningstider label' },
  { slug: 'footer.hoursWeek', label: 'Footer: åpningstider ukedager' },
  { slug: 'footer.hoursWeekend', label: 'Footer: åpningstider helg' },
  { slug: 'footer.link.home', label: 'Footer: lenke hjem' },
  { slug: 'footer.link.services', label: 'Footer: lenke tjenester' },
  { slug: 'footer.link.about', label: 'Footer: lenke om oss' },
  { slug: 'footer.link.contact', label: 'Footer: lenke kontakt' },
  { slug: 'footer.adminlink', label: 'Footer: adminlenke' },
  { slug: 'footer.hours.weeklabel', label: 'Footer: label ukedager' },
  { slug: 'footer.hours.weekendlabel', label: 'Footer: label helg' },
  { slug: 'footer.copyright', label: 'Footer: copyright' },
  // ServiceCard
  { slug: 'servicecard.title', label: 'Tjenestekort: fallback tittel' },
  { slug: 'servicecard.description', label: 'Tjenestekort: fallback beskrivelse' },
  { slug: 'servicecard.button', label: 'Tjenestekort: knappetekst' },
];

export default function ContentBlocksEditor() {
  const [selected, setSelected] = useState(blockSlugs[0].slug);
  const { content, update, loading } = useContent(selected);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Oppdater editValue når content endres
  React.useEffect(() => {
    setEditValue(content);
  }, [content, selected]);

  const handleSave = async () => {
    setSaving(true);
    const error = await update(editValue);
    setSaving(false);
    setMessage(error ? 'Feil ved lagring' : 'Lagret!');
    setTimeout(() => setMessage(''), 2000);
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Rediger tekstinnhold</h2>
      <select
        className="mb-4 p-2 border rounded w-full"
        value={selected}
        onChange={e => setSelected(e.target.value)}
      >
        {blockSlugs.map(b => (
          <option key={b.slug} value={b.slug}>{b.label}</option>
        ))}
      </select>
      <textarea
        className="w-full h-32 p-2 border rounded mb-2"
        value={editValue}
        onChange={e => setEditValue(e.target.value)}
        disabled={loading}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={handleSave}
        disabled={loading || saving}
      >
        {saving ? 'Lagrer...' : 'Lagre'}
      </button>
      {message && <div className="mt-2 text-green-600">{message}</div>}
    </div>
  );
}
