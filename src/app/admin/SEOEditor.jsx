
import React, { useState } from "react";
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
  const [form, setForm] = useState(seo);
  const [preview, setPreview] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) onSave(form);
  };

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
      <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded shadow">
        <h2 className="text-lg font-bold">Avansert SEO-verktøy</h2>
        <label>
          Tittel
          <input name="title" value={form.title} onChange={handleChange} className="w-full border p-2 rounded" maxLength={70} />
          {errors.title && <span className="text-red-600 text-xs">{errors.title}</span>}
        </label>
        <label>
          Beskrivelse
          <input name="description" value={form.description} onChange={handleChange} className="w-full border p-2 rounded" maxLength={170} />
          {errors.description && <span className="text-red-600 text-xs">{errors.description}</span>}
        </label>
        <label>
          Nøkkelord
          <input name="keywords" value={form.keywords} onChange={handleChange} className="w-full border p-2 rounded" />
        </label>
        <label>
          Robots
          <input name="robots" value={form.robots} onChange={handleChange} className="w-full border p-2 rounded" />
        </label>
        <label>
          Canonical URL
          <input name="canonical" value={form.canonical} onChange={handleChange} className="w-full border p-2 rounded" />
          {errors.canonical && <span className="text-red-600 text-xs">{errors.canonical}</span>}
        </label>
        <label>
          Open Graph Tittel
          <input name="ogTitle" value={form.ogTitle} onChange={handleChange} className="w-full border p-2 rounded" />
        </label>
        <label>
          Open Graph Beskrivelse
          <input name="ogDescription" value={form.ogDescription} onChange={handleChange} className="w-full border p-2 rounded" />
        </label>
        <label>
          Open Graph Bilde
          <input name="ogImage" value={form.ogImage} onChange={handleChange} className="w-full border p-2 rounded" />
        </label>
        <label>
          Open Graph Type
          <input name="ogType" value={form.ogType} onChange={handleChange} className="w-full border p-2 rounded" />
        </label>
        <label>
          Twitter Tittel
          <input name="twitterTitle" value={form.twitterTitle} onChange={handleChange} className="w-full border p-2 rounded" />
        </label>
        <label>
          Twitter Beskrivelse
          <input name="twitterDescription" value={form.twitterDescription} onChange={handleChange} className="w-full border p-2 rounded" />
        </label>
        <label>
          Twitter Bilde
          <input name="twitterImage" value={form.twitterImage} onChange={handleChange} className="w-full border p-2 rounded" />
        </label>
        <label>
          Structured Data (JSON-LD)
          <textarea name="jsonLd" value={form.jsonLd} onChange={handleChange} className="w-full border p-2 rounded font-mono" rows={6} />
        </label>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Lagre</button>
        <button type="button" className="ml-2 bg-gray-200 px-4 py-2 rounded" onClick={() => setPreview(!preview)}>
          {preview ? "Skjul forhåndsvisning" : "Forhåndsvis SEO"}
        </button>
      </form>
      {preview && (
        <div className="bg-gray-50 p-4 rounded shadow">
          <h3 className="font-semibold mb-2">SEO Forhåndsvisning</h3>
          <div className="mb-4">
            <strong>Google:</strong>
            <div className="border-l-4 border-blue-400 pl-4 mt-2">
              <div className="text-blue-700 text-lg font-bold">{form.title}</div>
              <div className="text-gray-700">{form.canonical}</div>
              <div className="text-gray-600">{form.description}</div>
            </div>
          </div>
          <div className="mb-4">
            <strong>Open Graph:</strong>
            <div className="border-l-4 border-green-400 pl-4 mt-2">
              <div className="text-green-700 font-bold">{form.ogTitle}</div>
              <div className="text-gray-700">{form.ogDescription}</div>
              <img src={form.ogImage} alt="OG Image" className="h-16 mt-2" />
            </div>
          </div>
          <div className="mb-4">
            <strong>Twitter Card:</strong>
            <div className="border-l-4 border-blue-300 pl-4 mt-2">
              <div className="text-blue-700 font-bold">{form.twitterTitle}</div>
              <div className="text-gray-700">{form.twitterDescription}</div>
              <img src={form.twitterImage} alt="Twitter Image" className="h-16 mt-2" />
            </div>
          </div>
          <div>
            <strong>Structured Data:</strong>
            <pre className="bg-white p-2 rounded text-xs font-mono overflow-x-auto">{form.jsonLd}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
