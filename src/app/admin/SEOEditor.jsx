import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/customSupabaseClient";
import AdminHeader from "../../components/admin/layout/AdminHeader";
import { Globe, Save, Eye, EyeOff } from "lucide-react";

const staticPages = [
  { id: 'home', label: 'Forside' },
  { id: 'about', label: 'Om oss' },
  { id: 'contact', label: 'Kontakt' },
  { id: 'calendar', label: 'Kalender' },
];

const defaultSEO = {
  title: "Mandal Regnskapskontor | Regnskapstjenester for bedrifter og privatpersoner",
  description: "Mandal Regnskapskontor tilbyr profesjonelle regnskapstjenester, rådgivning og økonomisk støtte for bedrifter og privatpersoner. Kontakt oss for en trygg økonomisk fremtid.",
  keywords: "regnskap, Mandal, økonomi, bokføring, rådgivning, skatt, bedrift, privatperson",
  robots: "index, follow",
  canonical: "https://mandalregnskapskontor.no/",
  ogTitle: "Mandal Regnskapskontor | Regnskapstjenester",
  ogDescription: "Profesjonelle regnskapstjenester for bedrifter og privatpersoner i Mandal.",
  ogImage: "/public/logo.png",
  ogType: "website",
  twitterTitle: "Mandal Regnskapskontor",
  twitterDescription: "Regnskapstjenester for bedrifter og privatpersoner.",
  twitterImage: "/public/logo.png",
  jsonLd: `{
    "@context": "https://schema.org",
    "@type": "AccountingService",
    "name": "Mandal Regnskapskontor",
    "url": "https://mandalregnskapskontor.no/",
    "logo": "/public/logo.png",
    "description": "Regnskapstjenester for bedrifter og privatpersoner i Mandal.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Eksempelgata 1",
      "addressLocality": "Mandal",
      "postalCode": "4514",
      "addressCountry": "NO"
    },
    "telephone": "+47 123 45 678",
    "areaServed": "NO",
    "sameAs": [
      "https://www.facebook.com/mandalregnskapskontor",
      "https://www.linkedin.com/company/mandalregnskapskontor"
    ]
  }`
};

export default function SEOEditor({ seo = defaultSEO, onSave }) {
  const [pageOptions, setPageOptions] = useState(staticPages);
  const [selectedPage, setSelectedPage] = useState(staticPages[0].id);
  const [form, setForm] = useState(seo);
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    async function fetchServices() {
      const { data, error } = await supabase.from('content').select('services_data').single();
      if (data?.services_data && Array.isArray(data.services_data)) {
        const servicePages = data.services_data.map((service, idx) => ({
          id: `service-${idx}`,
          label: service.title || `Tjeneste ${idx + 1}`
        }));
        setPageOptions([...staticPages, ...servicePages]);
      }
    }
    fetchServices();
  }, []);

  useEffect(() => {
    async function fetchSEO() {
      setLoading(true);
      const { data, error } = await supabase
        .from('seo_innstillinger')
        .select('*')
        .eq('side', selectedPage)
        .single();
      if (data) {
        setForm({
          title: data.tittel || '',
          description: data.beskrivelse || '',
          keywords: data.nokkelord || '',
          robots: data.robots || '',
          canonical: data.canonical || '',
          ogTitle: data.open_graph_tittel || '',
          ogDescription: data.open_graph_beskrivelse || '',
          ogImage: data.open_graph_bilde || '',
          ogType: data.open_graph_type || '',
          twitterTitle: data.twitter_tittel || '',
          twitterDescription: data.twitter_beskrivelse || '',
          twitterImage: data.twitter_bilde || '',
          jsonLd: data.strukturert_data || '',
        });
      } else {
        setForm(defaultSEO);
      }
      setLoading(false);
    }
    fetchSEO();
  }, [selectedPage]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  function sanitizeInput(str) {
    if (typeof str !== 'string') return str;
    return str
      .replace(/<script.*?>.*?<\/script>/gi, '')
      .replace(/[<>]/g, '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSaveStatus('Lagrer...');
    const seoData = {
      side: selectedPage,
      tittel: sanitizeInput(form.title),
      beskrivelse: sanitizeInput(form.description),
      nokkelord: sanitizeInput(form.keywords),
      robots: sanitizeInput(form.robots),
      canonical: sanitizeInput(form.canonical),
      open_graph_tittel: sanitizeInput(form.ogTitle),
      open_graph_beskrivelse: sanitizeInput(form.ogDescription),
      open_graph_bilde: sanitizeInput(form.ogImage),
      open_graph_type: sanitizeInput(form.ogType),
      strukturert_data: sanitizeInput(form.jsonLd),
    };
    const { data: existing } = await supabase
      .from('seo_innstillinger')
      .select('id')
      .eq('side', selectedPage)
      .single();
    if (existing && existing.id) {
      await supabase
        .from('seo_innstillinger')
        .update(seoData)
        .eq('id', existing.id);
    } else {
      await supabase
        .from('seo_innstillinger')
        .insert([seoData]);
    }
    setSaveStatus('Endringer lagret!');
    setTimeout(() => setSaveStatus(''), 2000);
    if (onSave) onSave(form);
  };

  let lastUploadTime = 0;
  const UPLOAD_RATE_LIMIT_MS = 10000;

  async function handleImageUpload(e) {
    const now = Date.now();
    if (now - lastUploadTime < UPLOAD_RATE_LIMIT_MS) {
      alert('Du må vente litt før du kan laste opp et nytt bilde.');
      return;
    }
    lastUploadTime = now;

    const file = e.target.files[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Kun JPG og PNG er tillatt.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Bildet er for stort (maks 2MB).');
      return;
    }

    setLoading(true);
    const filePath = `${selectedPage}/og-image-${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from('seo-images').upload(filePath, file);
    if (error) {
      alert('Feil ved opplasting: ' + error.message);
      setLoading(false);
      return;
    }
    const { publicUrl } = supabase.storage.from('seo-images').getPublicUrl(filePath).data;
    setForm({ ...form, ogImage: publicUrl });
    setLoading(false);
  }

  const validate = () => {
    const errors = {};
    if (form.title.length > 60) errors.title = "Tittel bør være under 60 tegn.";
    if (form.description.length > 160) errors.description = "Beskrivelse bør være under 160 tegn.";
    if (!form.canonical.startsWith("https://")) errors.canonical = "Canonical må starte med https://";
    return errors;
  };
  const errors = validate();

  return (
    <div className="space-y-6">
      <AdminHeader
        icon={Globe}
        title="SEO & Synlighet"
        description="Optimaliser hvordan nettsiden din vises i søkemotorer som Google."
      >
        <div className="flex gap-2">
          <button
            onClick={() => setPreview(!preview)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            type="button"
          >
            {preview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {preview ? "Skjul forhåndsvisning" : "Forhåndsvis"}
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-4 py-2 bg-[#1B4965] text-white rounded-lg text-sm font-medium hover:bg-[#0F3347] transition-colors"
            type="button"
          >
            <Save className="w-4 h-4" />
            Lagre SEO
          </button>
        </div>
      </AdminHeader>

      <div className="mb-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <label className="font-semibold text-gray-700">Rediger SEO for side eller tjeneste:</label>
        <select
          value={selectedPage}
          onChange={e => setSelectedPage(e.target.value)}
          className="border border-gray-200 p-2 rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-primary/20 outline-none min-w-[280px]"
        >
          {pageOptions.map(page => (
            <option key={page.id} value={page.id}>{page.label}</option>
          ))}
        </select>
      </div>

      {saveStatus && (
        <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200 font-medium">
          {saveStatus}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
          SEOinnstillinger for {pageOptions.find(p => p.id === selectedPage)?.label}
        </h2>

        <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[#1B4965]">
            <span role="img" aria-label="meta">🔍</span> Meta Tags
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label title="Tittel som vises i søkeresultat" className="block text-sm font-medium text-gray-700">
              Tittel
              <input name="title" value={form.title} onChange={handleChange} className="mt-1 w-full border border-gray-200 p-2 rounded-lg bg-white" maxLength={70} placeholder="F.eks. Mandal Regnskapskontor | Regnskap Grimstad" />
              {errors.title && <span className="text-xs text-red-500">{errors.title}</span>}
            </label>
            <label title="Kort beskrivelse for Google" className="block text-sm font-medium text-gray-700">
              Beskrivelse
              <input name="description" value={form.description} onChange={handleChange} className="mt-1 w-full border border-gray-200 p-2 rounded-lg bg-white" maxLength={170} placeholder="F.eks. Vi tilbyr regnskapstjenester for bedrifter i Grimstad og Mandal." />
              {errors.description && <span className="text-xs text-red-500">{errors.description}</span>}
            </label>
            <label title="Nøkkelord separert med komma" className="block text-sm font-medium text-gray-700">
              Nøkkelord
              <input name="keywords" value={form.keywords} onChange={handleChange} className="mt-1 w-full border border-gray-200 p-2 rounded-lg bg-white" placeholder="regnskap, Grimstad, Mandal, regnskapskontor, økonomi" />
              <span className="text-xs text-gray-400">Tips: Legg til relevante steder og tjenester.</span>
            </label>
            <label title="Styrer hvordan søkemotorer indekserer siden" className="block text-sm font-medium text-gray-700">
              Robots
              <input name="robots" value={form.robots} onChange={handleChange} className="mt-1 w-full border border-gray-200 p-2 rounded-lg bg-white" />
            </label>
            <label title="URL som Google skal bruke som original" className="block text-sm font-medium text-gray-700">
              Canonical URL
              <input name="canonical" value={form.canonical} onChange={handleChange} className="mt-1 w-full border border-gray-200 p-2 rounded-lg bg-white" />
              {errors.canonical && <span className="text-xs text-red-500">{errors.canonical}</span>}
            </label>
          </div>
        </div>

        <button type="button"
          className="border px-4 py-2 rounded-lg font-semibold shadow-sm bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200 transition-colors"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? "Skjul avanserte innstillinger" : "Vis avanserte innstillinger"}
        </button>

        {showAdvanced && (
          <div className="space-y-6">
            <div className="bg-green-50/50 rounded-xl p-6 border border-green-100 shadow-sm">
              <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                <span role="img" aria-label="open graph">🌐</span> Open Graph
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="block text-sm font-medium text-gray-700">
                  Open Graph Tittel
                  <input name="ogTitle" value={form.ogTitle} onChange={handleChange} className="mt-1 w-full border border-gray-200 p-2 rounded-lg bg-white" />
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  Open Graph Beskrivelse
                  <input name="ogDescription" value={form.ogDescription} onChange={handleChange} className="mt-1 w-full border border-gray-200 p-2 rounded-lg bg-white" />
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  Open Graph Bilde
                  <input name="ogImage" value={form.ogImage} onChange={handleChange} className="mt-1 w-full border border-gray-200 p-2 rounded-lg bg-white mb-2" />
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="mt-1 w-full text-xs" />
                  <span className="text-xs text-gray-400">Anbefalt størrelse: 1200x630px</span>
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  Open Graph Type
                  <input name="ogType" value={form.ogType} onChange={handleChange} className="mt-1 w-full border border-gray-200 p-2 rounded-lg bg-white" />
                </label>
              </div>
            </div>

            <div className="bg-yellow-50/50 rounded-xl p-6 border border-yellow-100 shadow-sm">
              <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center gap-2">
                <span role="img" aria-label="structured data">🗂️</span> Structured Data (JSON-LD)
              </h3>
              <textarea name="jsonLd" value={form.jsonLd} onChange={handleChange} className="w-full border border-gray-200 p-2 rounded-lg bg-white font-mono text-xs" rows={10} />
            </div>
          </div>
        )}
      </form>

      {preview && (
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm mt-8">
          <h3 className="font-bold text-gray-800 mb-6">Forhåndsvisning</h3>
          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
              <strong className="text-sm text-gray-400 uppercase tracking-wider">Google Søk:</strong>
              <div className="mt-4">
                <div className="text-[#1a0dab] text-xl font-normal hover:underline cursor-pointer">{form.title}</div>
                <div className="text-[#006621] text-sm mt-1">{form.canonical}</div>
                <div className="text-[#4d5156] text-sm mt-1 leading-relaxed">{form.description}</div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
              <strong className="text-sm text-gray-400 uppercase tracking-wider">Sosiale Medier:</strong>
              <div className="mt-4 border border-gray-100 rounded-lg overflow-hidden max-w-md">
                {form.ogImage && <img src={form.ogImage} alt="OG Preview" className="w-full h-48 object-cover" />}
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  <div className="text-xs text-gray-400 uppercase">{new URL(form.canonical || 'https://mandalregnskapskontor.no').hostname}</div>
                  <div className="font-bold text-gray-800 mt-1">{form.ogTitle || form.title}</div>
                  <div className="text-sm text-gray-600 mt-1 line-clamp-2">{form.ogDescription || form.description}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
