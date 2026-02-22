import React, { useState } from 'react';
import { useContent } from '@/contexts/ContentContext';
import { Button } from '@/components/ui/button';
import { Save, Loader2 } from 'lucide-react';

const CustomPlanCTAEditor = () => {
  const cta = useContent('custom_plan_cta');
  const [ctaValue, setCtaValue] = useState(cta.content);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await cta.update(ctaValue, 'text');
    setSaving(false);
  };

  return (
    <div className="space-y-4 bg-white p-6 rounded-xl shadow-md mt-4">
      <div>
        <label className="block font-semibold mb-1">CTA-knapp tekst</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={ctaValue}
          onChange={e => setCtaValue(e.target.value)}
        />
      </div>
      <Button onClick={handleSave} disabled={saving} className="mt-2">
        {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />} Lagre
      </Button>
    </div>
  );
};

export default CustomPlanCTAEditor;
