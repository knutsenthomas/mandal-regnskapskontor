import React, { useState } from 'react';
import { useContent } from '../../contexts/ContentContext';

const blockSlugs = [
  { slug: 'hero.title', label: 'Hero-tittel' },
  { slug: 'about.text', label: 'Om oss-tekst' },
  { slug: 'contact.cta', label: 'Kontakt CTA' },
  // Legg til flere slugs etter behov
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
