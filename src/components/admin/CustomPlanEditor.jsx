import React, { useState } from 'react';
import { useContent } from '@/contexts/ContentContext';
import { Button } from '@/components/ui/button';
import { Save, Loader2 } from 'lucide-react';

const CustomPlanEditor = () => {
  const title = useContent('custom_plan_title');
  const subtitle = useContent('custom_plan_subtitle');
  const [titleValue, setTitleValue] = useState(title.content);
  const [subtitleValue, setSubtitleValue] = useState(subtitle.content);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await title.update(titleValue, 'text');
    await subtitle.update(subtitleValue, 'text');
    setSaving(false);
  };

  return (
    <div className="space-y-4 bg-white p-6 rounded-xl shadow-md">
      <div>
        <label className="block font-semibold mb-1">Tittel</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={titleValue}
          onChange={e => setTitleValue(e.target.value)}
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Undertekst</label>
        <textarea
          className="w-full border rounded px-3 py-2"
          value={subtitleValue}
          onChange={e => setSubtitleValue(e.target.value)}
        />
      </div>
      <Button onClick={handleSave} disabled={saving} className="mt-2">
        {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />} Lagre
      </Button>
    </div>
  );
};

export default CustomPlanEditor;
