import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Loader2 } from 'lucide-react';

const ServiceDetailContentEditor = ({ service, details, onSave }) => {
  const [title, setTitle] = useState(service?.title || '');
  const [description, setDescription] = useState(service?.description || '');
  const [extendedDescription, setExtendedDescription] = useState(details?.extended_description || '');
  const [offerings, setOfferings] = useState(details?.offerings ? details.offerings.join('\n') : '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      title,
      description,
      extended_description: extendedDescription,
      offerings: offerings.split('\n').map(o => o.trim()).filter(Boolean)
    });
    setSaving(false);
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-xl shadow-md">
      <div>
        <label className="block font-semibold mb-1">Tittel</label>
        <input className="w-full border rounded px-3 py-2" value={title} onChange={e => setTitle(e.target.value)} />
      </div>
      <div>
        <label className="block font-semibold mb-1">Kort beskrivelse</label>
        <textarea className="w-full border rounded px-3 py-2" value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <div>
        <label className="block font-semibold mb-1">Utvidet beskrivelse</label>
        <textarea className="w-full border rounded px-3 py-2" value={extendedDescription} onChange={e => setExtendedDescription(e.target.value)} />
      </div>
      <div>
        <label className="block font-semibold mb-1">Hva vi tilbyr (en per linje)</label>
        <textarea className="w-full border rounded px-3 py-2" value={offerings} onChange={e => setOfferings(e.target.value)} />
      </div>
      <Button onClick={handleSave} disabled={saving} className="mt-2">
        {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />} Lagre
      </Button>
    </div>
  );
};

export default ServiceDetailContentEditor;
