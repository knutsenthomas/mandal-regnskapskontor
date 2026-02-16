import React, { useState } from "react";

const defaultSEO = {
  title: "Mandal Regnskapskontor | Regnskapstjenester for bedrifter og privatpersoner",
  description: "Mandal Regnskapskontor tilbyr profesjonelle regnskapstjenester, rådgivning og økonomisk støtte for bedrifter og privatpersoner. Kontakt oss for en trygg økonomisk fremtid.",
  keywords: "regnskap, Mandal, økonomi, bokføring, rådgivning, skatt, bedrift, privatperson",
  ogTitle: "Mandal Regnskapskontor | Regnskapstjenester",
  ogDescription: "Profesjonelle regnskapstjenester for bedrifter og privatpersoner i Mandal.",
  ogImage: "/public/logo.png",
  twitterTitle: "Mandal Regnskapskontor",
  twitterDescription: "Regnskapstjenester for bedrifter og privatpersoner.",
  twitterImage: "/public/logo.png"
};

export default function SEOEditor({ seo = defaultSEO, onSave }) {
  const [form, setForm] = useState(seo);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded shadow">
      <h2 className="text-lg font-bold">SEO-innstillinger</h2>
      <label>
        Tittel
        <input name="title" value={form.title} onChange={handleChange} className="w-full border p-2 rounded" />
      </label>
      <label>
        Beskrivelse
        <input name="description" value={form.description} onChange={handleChange} className="w-full border p-2 rounded" />
      </label>
      <label>
        Nøkkelord
        <input name="keywords" value={form.keywords} onChange={handleChange} className="w-full border p-2 rounded" />
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
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Lagre</button>
    </form>
  );
}
