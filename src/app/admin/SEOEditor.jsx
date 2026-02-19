import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/customSupabaseClient";

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

  // Hent SEO-data for valgt side/tjeneste
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
    e.preventDefault();
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

  // Hjelpefunksjon for bildeopplasting
  let lastUploadTime = 0;
  const UPLOAD_RATE_LIMIT_MS = 10000; // 10 sekunder mellom opplastinger

  async function handleImageUpload(e) {
    const now = Date.now();
    if (now - lastUploadTime < UPLOAD_RATE_LIMIT_MS) {
      alert('Du må vente litt før du kan laste opp et nytt bilde.');
      return;
    }
    lastUploadTime = now;

    const file = e.target.files[0];
    if (!file) return;
    // Sikkerhetsbegrensning: kun jpg/png og maks 2MB
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Kun JPG og PNG er tillatt.');
      console.warn('Mistenkelig filtype forsøkt opplastet:', file.type);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Bildet er for stort (maks 2MB).');
      console.warn('Mistenkelig filstørrelse forsøkt opplastet:', file.size);
      return;
    }
    // Tilgangskontroll: kun admin kan laste opp
    if (!window.currentUser || window.currentUser.role !== 'admin') {
      alert('Du har ikke tilgang til å laste opp bilder.');
      console.warn('Uautorisert opplastingsforsøk av bruker:', window.currentUser);
      return;
    }
    // CSRF-beskyttelse: sjekk at bruker har gyldig session/token
    if (!window.currentUser || !window.currentUser.csrfToken) {
      alert('CSRF-token mangler. Prøv å logge inn på nytt.');
      return;
    }
    setLoading(true);
    const filePath = `${selectedPage}/og-image-${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from('seo-images').upload(filePath, file, {
      headers: { 'X-CSRF-Token': window.currentUser.csrfToken }
    });
    if (error) {
      alert('Feil ved opplasting: ' + error.message);
      setLoading(false);
      return;
    }
    const { publicUrl } = supabase.storage.from('seo-images').getPublicUrl(filePath).data;
    setForm({ ...form, ogImage: publicUrl });
    setLoading(false);
  }

  // Valideringseksempler
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
      {/* Veiledning */}
      <div className="mb-4" style={{ background: 'var(--card)', borderLeft: '4px solid var(--primary)', borderRadius: '0.5rem', padding: '1rem' }}>
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>SEO-verktøy for nettsiden</h2>
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Her kan du enkelt optimalisere synlighet i Google og sosiale medier. Fyll ut tittel, beskrivelse og nøkkelord for hver side eller tjeneste. Avanserte innstillinger gir deg full kontroll over teknisk SEO.</p>
      </div>
      {/* Sidevelger */}
      <div className="mb-4">
        <label className="font-semibold mb-2 block" style={{ color: 'var(--foreground)' }}>Velg side eller tjeneste:</label>
        <select
          value={selectedPage}
          onChange={e => setSelectedPage(e.target.value)}
          className="border p-2 rounded"
          style={{ background: 'var(--card)', color: 'var(--foreground)' }}
        >
          {pageOptions.map(page => (
            <option key={page.id} value={page.id}>{page.label}</option>
          ))}
        </select>
      </div>
      {/* Lagringsstatus */}
      {saveStatus && <div className="text-green-700 font-semibold mb-2">{saveStatus}</div>}
      <form onSubmit={handleSubmit} className="space-y-8 p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
          <span>SEO for</span>
          <span>{pageOptions.find(p => p.id === selectedPage)?.label}</span>
        </h2>
        <div className="bg-blue-50 rounded-lg p-4 mb-4 shadow-sm" style={{ background: 'var(--card)', borderRadius: '0.5rem', padding: '1rem', boxShadow: 'var(--tw-shadow)' }}>
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--primary)' }}>
            <span role="img" aria-label="meta">🔍</span> Meta Tags
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label title="Tittel som vises i søkeresultat">
              Tittel
              <input name="title" value={form.title} onChange={handleChange} className="w-full border p-2 rounded" maxLength={70} placeholder="F.eks. Mandal Regnskapskontor | Regnskap Grimstad" style={{ color: 'var(--foreground)' }} />
              {errors.title && <span className="text-xs" style={{ color: 'var(--destructive)' }}>{errors.title}</span>}
            </label>
            <label title="Kort beskrivelse for Google">
              Beskrivelse
              <input name="description" value={form.description} onChange={handleChange} className="w-full border p-2 rounded" maxLength={170} placeholder="F.eks. Vi tilbyr regnskapstjenester for bedrifter i Grimstad og Mandal." style={{ color: 'var(--foreground)' }} />
              {errors.description && <span className="text-xs" style={{ color: 'var(--destructive)' }}>{errors.description}</span>}
            </label>
            <label title="Nøkkelord separert med komma">
              Nøkkelord
              <input name="keywords" value={form.keywords} onChange={handleChange} className="w-full border p-2 rounded" placeholder="regnskap, Grimstad, Mandal, regnskapskontor, økonomi" style={{ color: 'var(--foreground)' }} />
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Tips: Legg til relevante steder og tjenester.</span>
            </label>
            <label title="Styrer hvordan søkemotorer indekserer siden">
              Robots
              <input name="robots" value={form.robots} onChange={handleChange} className="w-full border p-2 rounded" style={{ color: 'var(--foreground)' }} />
            </label>
            <label title="URL som Google skal bruke som original">
              Canonical URL
              <input name="canonical" value={form.canonical} onChange={handleChange} className="w-full border p-2 rounded" style={{ color: 'var(--foreground)' }} />
              {errors.canonical && <span className="text-xs" style={{ color: 'var(--destructive)' }}>{errors.canonical}</span>}
            </label>
          </div>
        </div>
        <button type="button"
          className="border px-4 py-2 rounded mb-4 font-semibold shadow-sm"
          style={{ background: 'var(--muted)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? "Skjul avanserte innstillinger" : "Vis avanserte innstillinger"}
        </button>
        {showAdvanced && (
          <>
            <div className="bg-green-50 rounded-lg p-4 mb-4 shadow-sm">
              <h3 className="text-lg font-semibold text-green-800 mb-2 flex items-center gap-2">
                <span role="img" aria-label="open graph">🌐</span> Open Graph
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label title="Tittel for Facebook og LinkedIn">
                  Open Graph Tittel
                  <input name="ogTitle" value={form.ogTitle} onChange={handleChange} className="w-full border p-2 rounded" />
                </label>
                <label title="Beskrivelse for sosiale medier">
                  Open Graph Beskrivelse
                  <input name="ogDescription" value={form.ogDescription} onChange={handleChange} className="w-full border p-2 rounded" />
                </label>
                <label title="Bilde som vises ved deling">
                  Open Graph Bilde
                  <input name="ogImage" value={form.ogImage} onChange={handleChange} className="w-full border p-2 rounded mb-2" />
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full border p-2 rounded mt-1" />
                  <span className="text-xs text-gray-500">Last opp bilde for deling på SoMe</span>
                </label>
                <label title="Type (website, article, etc.)">
                  Open Graph Type
                  <input name="ogType" value={form.ogType} onChange={handleChange} className="w-full border p-2 rounded" />
                </label>
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 mb-4 shadow-sm">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                <span role="img" aria-label="structured data">🗂️</span> Structured Data (JSON-LD)
              </h3>
              <label title="Strukturert data for Google og andre søkemotorer">
                <textarea name="jsonLd" value={form.jsonLd} onChange={handleChange} className="w-full border p-2 rounded font-mono" rows={6} />
              </label>
            </div>
          </>
        )}
        <div className="flex gap-2">
          <button type="submit" className="bg-[#1B4965] hover:bg-[#0F3347] text-white px-4 py-2 rounded font-semibold shadow-sm flex items-center gap-2">Lagre</button>
          <button type="button" className="bg-gray-200 px-4 py-2 rounded font-semibold shadow-sm" onClick={() => setPreview(!preview)}>
            {preview ? "Skjul forhåndsvisning" : "Forhåndsvis SEO"}
          </button>
        </div>
      </form>
      {preview && (
        <div className="bg-gray-50 p-4 rounded shadow">
          <h3 className="font-semibold mb-2">SEO Forhåndsvisning</h3>
          <div className="mb-4 border border-blue-200 rounded p-3">
            <strong>Google:</strong>
            <div className="border-l-4 border-blue-400 pl-4 mt-2">
              <div className="text-blue-700 text-lg font-bold">{form.title}</div>
              <div className="text-gray-700">{form.canonical}</div>
              <div className="text-gray-600">{form.description}</div>
            </div>
          </div>
          <div className="mb-4 border border-green-200 rounded p-3">
            <strong>Open Graph:</strong>
            <div className="border-l-4 border-green-400 pl-4 mt-2">
              <div className="text-green-700 font-bold">{form.ogTitle}</div>
              <div className="text-gray-700">{form.ogDescription}</div>
              <img src={form.ogImage} alt="OG Image" className="h-16 mt-2" />
            </div>
          </div>
          <div className="mb-4 border border-green-200 rounded p-3">
            <strong>Open Graph:</strong>
            <div className="border-l-4 border-green-400 pl-4 mt-2">
              <div className="text-green-700 font-bold">{form.ogTitle}</div>
              <div className="text-gray-700">{form.ogDescription}</div>
              <img src={form.ogImage} alt="OG Image" className="h-16 mt-2" />
            </div>
          </div>
          <div className="border border-yellow-200 rounded p-3">
            <strong>Structured Data:</strong>
            <pre className="bg-white p-2 rounded text-xs font-mono overflow-x-auto">{form.jsonLd}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
