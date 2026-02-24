import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Shield, Save, RefreshCw, AlertCircle, FileText, ExternalLink } from 'lucide-react';
import { useSite } from '@/contexts/SiteContext';
import AdminHeader from './layout/AdminHeader';
import RichTextEditor from './RichTextEditor';

const PrivacyEditor = () => {
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [lastUpdated, setLastUpdated] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();
    const { refreshSiteData } = useSite();

    const fetchPrivacyContent = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('content_blocks')
                .select('*')
                .in('slug', ['privacy.title', 'privacy.text', 'privacy.last_updated']);

            if (error) throw error;

            const defaultTitle = "Personvernerklæring";
            const defaultText = `
<h3>1. Innledning</h3>
<p>Mandal Regnskapskontor tar ditt personvern på alvor. Vi behandler dine personopplysninger i tråd med den til enhver tid gjeldende personvernlovgivning, herunder personopplysningsloven og personvernforordningen (GDPR).</p>

<h3>2. Hvilke opplysninger vi samler inn</h3>
<p>Vi kan samle inn opplysninger som du selv gir oss når du kontakter oss via kontaktskjema, e-post eller telefon. Dette inkluderer navn, e-postadresse, bedriftsnavn og telefonnummer.</p>

<h3>3. Bruk av informasjonskapsler (cookies)</h3>
<p>Vi bruker informasjonskapsler for å forbedre brukeropplevelsen på nettsiden, analysere trafikkmønstre og sikre at nettsiden fungerer optimalt. Du kan selv styre hvilke informasjonskapsler du tillater via vårt cookie-banner.</p>

<h3>4. Formålet med behandlingen</h3>
<p>Vi behandler dine personopplysninger for å kunne besvare henvendelser, levere våre tjenester og forbedre våre digitale løsninger.</p>

<h3>5. Deling av opplysninger</h3>
<p>Vi deler ikke dine personopplysninger med tredjeparter med mindre det er nødvendig for å levere våre tjenester eller vi er lovpålagt å gjøre det.</p>

<h3>6. Dine rettigheter</h3>
<p>Du har rett til innsyn i egne personopplysninger, samt rett til å kreve retting eller sletting av mangelfulle eller uriktige opplysninger.</p>
            `.trim();
            const defaultLastUpdated = new Date().toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' });

            if (data && data.length > 0) {
                let dbTitle = '', dbText = '', dbLastUpdated = '';
                data.forEach(item => {
                    if (item.slug === 'privacy.title') dbTitle = item.content;
                    if (item.slug === 'privacy.text') dbText = item.content;
                    if (item.slug === 'privacy.last_updated') dbLastUpdated = item.content;
                });

                setTitle(dbTitle || defaultTitle);
                setText(dbText || defaultText);
                setLastUpdated(dbLastUpdated || defaultLastUpdated);
            } else {
                setTitle(defaultTitle);
                setText(defaultText);
                setLastUpdated(defaultLastUpdated);
            }
        } catch (error) {
            console.error('Error fetching privacy content:', error);
            toast({
                title: 'Feil ved henting',
                description: 'Kunne ikke hente personvern-innhold.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrivacyContent();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const updates = [
                { slug: 'privacy.title', content: title },
                { slug: 'privacy.text', content: text },
                { slug: 'privacy.last_updated', content: lastUpdated || new Date().toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' }) }
            ];

            for (const item of updates) {
                const { error } = await supabase.rpc('update_content_block', {
                    p_slug: item.slug,
                    p_content: item.content
                });
                if (error) throw error;
            }

            toast({
                title: 'Lagret!',
                description: 'Personvernerklæringen er oppdatert.',
                className: 'bg-green-50 border-green-200'
            });
            await refreshSiteData();
        } catch (error) {
            console.error('Error saving privacy content:', error);
            toast({
                title: 'Feil ved lagring',
                description: 'Kunne ikke lagre endringene.',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><RefreshCw className="w-8 h-8 animate-spin text-primary/20" /></div>;

    return (
        <div className="space-y-6">
            <AdminHeader
                icon={Shield}
                title="Personvern & Cookies"
                description="Administrer personvernerklæringen og cookie-banneret."
            >
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[#1B4965] hover:bg-[#0F3347] text-white flex items-center gap-2"
                >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Lagre endringer
                </Button>
            </AdminHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <label className="block text-sm font-bold text-gray-700 mb-2 font-bold">Overskrift</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:outline-none font-medium"
                            placeholder="f.eks. Personvernerklæring"
                        />
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 font-bold">
                        <RichTextEditor
                            label="Innhold i personvernerklæringen"
                            value={text}
                            onChange={setText}
                            placeholder="Skriv inn personvernerklæringen her..."
                            minHeight={500}
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Sist oppdatert</label>
                        <input
                            type="text"
                            value={lastUpdated}
                            onChange={(e) => setLastUpdated(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:outline-none"
                            placeholder="f.eks. 24. februar 2026"
                        />
                    </div>

                    <div className="bg-[#1B4965]/5 p-6 rounded-2xl border border-[#1B4965]/10">
                        <div className="flex items-center gap-2 text-[#1B4965] font-bold mb-3">
                            <AlertCircle className="w-4 h-4" />
                            Tips om cookies
                        </div>
                        <p className="text-xs text-[#1B4965]/70 leading-relaxed font-medium">
                            Cookie-banneret er automatisk koblet til Google Analytics. Når en bruker velger bort "Statistikk", vil ingen data bli sendt til Google. Dette sikrer at du følger GDPR-regelverket.
                        </p>
                    </div>

                    <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                        <div className="flex items-center gap-2 text-primary font-bold mb-3">
                            <FileText className="w-4 h-4" />
                            Forhåndsvisning
                        </div>
                        <Button
                            variant="outline"
                            className="w-full border-blue-200 text-primary hover:bg-blue-100 rounded-xl font-bold flex items-center justify-center gap-2"
                            onClick={() => window.open('/personvern', '_blank')}
                        >
                            <ExternalLink className="w-4 h-4" />
                            Åpne personvernside
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyEditor;
