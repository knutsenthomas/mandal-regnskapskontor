import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Save, Loader2, Upload, Image as ImageIcon, BarChart3, Settings, Type } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { uploadImageToPublicBucket, getUploadErrorMessage } from '@/lib/storageUpload';
import AdminHeader from './layout/AdminHeader';

const LOGO_ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif'];
const FAVICON_ALLOWED_TYPES = ['image/x-icon', 'image/vnd.microsoft.icon', 'image/png', 'image/svg+xml', 'image/webp'];

const clearFileInput = (event) => {
    if (event?.target) {
        event.target.value = '';
    }
};

const GeneralEditor = ({ content, onUpdate }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [logoUrl, setLogoUrl] = useState('');
    const [logoText, setLogoText] = useState('');
        const [faviconUrl, setFaviconUrl] = useState('');
        const [gaId, setGaId] = useState('');
        const [subtitleText, setSubtitleText] = useState('');
        const [navHome, setNavHome] = useState('');
        const [navServices, setNavServices] = useState('');
        const [navAbout, setNavAbout] = useState('');
        const [navCalendar, setNavCalendar] = useState('');
        const [navContact, setNavContact] = useState('');

    useEffect(() => {
        if (content) {
            setLogoUrl(content.logo_url || '');
                setSubtitleText(content.subtitle_text || '');
            setNavHome(content.nav_home || '');
            setNavServices(content.nav_services || '');
            setNavAbout(content.nav_about || '');
            setNavCalendar(content.nav_calendar || '');
            setNavContact(content.nav_contact || '');
        }
        fetchSettings();
    }, [content]);

    const fetchSettings = async () => {
        const { data } = await supabase
            .from('site_settings')
            .select('key, value');

        if (data) {
            const settingsMap = {};
            data.forEach(item => {
                settingsMap[item.key] = item.value;
            });

            setGaId(settingsMap['google_analytics_id'] || '');
            setLogoText(settingsMap['logo_text'] || '');
            setSubtitleText(settingsMap['subtitle_text'] || '');
            setNavHome(settingsMap['nav_home'] || '');
            setNavServices(settingsMap['nav_services'] || '');
            setNavAbout(settingsMap['nav_about'] || '');
            setNavCalendar(settingsMap['nav_calendar'] || '');
            setNavContact(settingsMap['nav_contact'] || '');
            setFaviconUrl(settingsMap['favicon_url'] || '');
            if (settingsMap['logo_url']) {
                setLogoUrl(settingsMap['logo_url']);
            }
        }
    };

    const handleImageUpload = async (e) => {
        try {
            setUploading(true);
            const file = e.target.files[0];
            if (!file) return;
            const { publicUrl } = await uploadImageToPublicBucket({
                file,
                bucket: 'images',
                folder: 'branding',
                prefix: 'logo',
                allowedTypes: LOGO_ALLOWED_TYPES,
                maxBytes: 5 * 1024 * 1024,
            });
            setLogoUrl(publicUrl);

            toast({
                title: "Bilde lastet opp",
                description: "Husk å lagre endringene.",
                className: "bg-green-50 border-green-200"
            });

        } catch (error) {
            console.error('Logo upload error:', error);
            toast({
                title: "Feil ved opplasting",
                description: getUploadErrorMessage(error, "Kunne ikke laste opp bilde."),
                variant: "destructive"
            });
        } finally {
            setUploading(false);
            clearFileInput(e);
        }
    };

    const handleFaviconUpload = async (e) => {
        try {
            setUploading(true);
            const file = e.target.files[0];
            if (!file) return;
            const { publicUrl } = await uploadImageToPublicBucket({
                file,
                bucket: 'images',
                folder: 'branding',
                prefix: 'favicon',
                allowedTypes: FAVICON_ALLOWED_TYPES,
                maxBytes: 2 * 1024 * 1024,
            });
            setFaviconUrl(publicUrl);

            toast({
                title: "Favicon lastet opp",
                description: "Husk å lagre endringene.",
                className: "bg-green-50 border-green-200"
            });

        } catch (error) {
            console.error('Favicon upload error:', error);
            toast({
                title: "Feil ved opplasting",
                description: getUploadErrorMessage(error, "Kunne ikke laste opp favicon."),
                variant: "destructive"
            });
        } finally {
            setUploading(false);
            clearFileInput(e);
        }
    };

    const handleSave = async () => {
        setLoading(true);

        try {
            if (content?.id) {
                const { error: contentError } = await supabase.rpc('update_general_content', {
                    p_id: content.id,
                    p_logo_url: logoUrl
                });

                if (contentError) throw contentError;
            }

            const settingsToUpdate = [
                { key: 'google_analytics_id', value: gaId },
                { key: 'logo_text', value: logoText },
                { key: 'subtitle_text', value: subtitleText },
                { key: 'nav_home', value: navHome },
                { key: 'nav_services', value: navServices },
                { key: 'nav_about', value: navAbout },
                { key: 'nav_calendar', value: navCalendar },
                { key: 'nav_contact', value: navContact },
                { key: 'favicon_url', value: faviconUrl },
                { key: 'logo_url', value: logoUrl }
            ];

            for (const setting of settingsToUpdate) {
                const { error: settingsError } = await supabase.rpc('upsert_site_setting', {
                    p_key: setting.key,
                    p_value: setting.value
                });
                if (settingsError) throw settingsError;
            }

            toast({
                title: "Lagret!",
                description: "Alle innstillinger er oppdatert.",
                className: "bg-green-50 border-green-200"
            });

            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Save error:', error);
            toast({
                title: "Feil ved lagring",
                description: "Kunne ikke lagre endringene.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
                                {/* NAVIGATION TEXT SECTION */}
                                <Card className="border-none shadow-sm ring-1 ring-gray-100 rounded-xl overflow-hidden">
                                    <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                                            Navigasjonstekster
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Hjem</label>
                                            <input
                                                type="text"
                                                placeholder="Hjem"
                                                value={navHome}
                                                onChange={e => setNavHome(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-gray-50/50 font-bold"
                                            />
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Tjenester</label>
                                            <input
                                                type="text"
                                                placeholder="Tjenester"
                                                value={navServices}
                                                onChange={e => setNavServices(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-gray-50/50 font-bold"
                                            />
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Om oss</label>
                                            <input
                                                type="text"
                                                placeholder="Om oss"
                                                value={navAbout}
                                                onChange={e => setNavAbout(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-gray-50/50 font-bold"
                                            />
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Kalender</label>
                                            <input
                                                type="text"
                                                placeholder="Kalender"
                                                value={navCalendar}
                                                onChange={e => setNavCalendar(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-gray-50/50 font-bold"
                                            />
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Kontakt oss</label>
                                            <input
                                                type="text"
                                                placeholder="Kontakt oss"
                                                value={navContact}
                                                onChange={e => setNavContact(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-gray-50/50 font-bold"
                                            />
                                            <p className="text-[10px] text-gray-400 italic">Disse tekstene vises i hovedmenyen. Du kan bruke små og store bokstaver.</p>
                                        </div>
                                    </CardContent>
                                </Card>
            <AdminHeader
                icon={Settings}
                title="Generelle innstillinger"
                description="Administrer nettsidens logo, merkevare og analyseverktøy."
            >
                <Button
                    onClick={handleSave}
                    disabled={loading || uploading}
                    className="bg-[#1B4965] hover:bg-[#0F3347] text-white flex items-center gap-2"
                >
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Lagre endringer
                </Button>
            </AdminHeader>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* LOGO SECTION */}
                <Card className="border-none shadow-sm ring-1 ring-gray-100 rounded-xl overflow-hidden">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-primary" />
                            Nettside Logo
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="p-8 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center bg-gray-50/50 group transition-colors hover:bg-white hover:border-primary/20">
                            {logoUrl ? (
                                <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 min-h-[100px] flex items-center justify-center">
                                    <img src={logoUrl} alt="Logo Preview" className="max-h-16 object-contain" />
                                </div>
                            ) : (
                                <div className="text-gray-300 flex flex-col items-center mb-6">
                                    <ImageIcon className="w-16 h-16 mb-2 opacity-20" />
                                    <span className="text-xs font-medium uppercase tracking-widest">Ingen logo valgt</span>
                                </div>
                            )}

                            <div className="flex flex-col items-center gap-3">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    id="logo-upload"
                                    disabled={uploading}
                                />
                                <label
                                    htmlFor="logo-upload"
                                    className={`cursor-pointer inline-flex items-center px-6 py-2 bg-white border border-gray-200 shadow-sm text-sm font-bold rounded-xl text-gray-700 hover:bg-gray-50 transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                                    {uploading ? 'Laster opp...' : 'Bytt logo'}
                                </label>
                                <p className="text-[10px] text-gray-400 italic">Anbefalt: Gjennomsiktig PNG</p>
                            </div>
                        </div>

                        <div className="mt-6 space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Logo URL eller Base64</label>
                            <input
                                type="text"
                                value={logoUrl}
                                onChange={(e) => setLogoUrl(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                placeholder="https://..."
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    {/* LOGO TEXT SECTION */}
                    <Card className="border-none shadow-sm ring-1 ring-gray-100 rounded-xl overflow-hidden">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Type className="w-4 h-4 text-primary" />
                                Logo Tekst
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Tekst i navbar</label>
                                <input
                                    type="text"
                                    placeholder="MANDAL REGNSKAPSKONTOR"
                                    value={logoText}
                                    onChange={(e) => setLogoText(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-gray-50/50 font-bold"
                                />
                                <p className="text-[10px] text-gray-400 italic">Dette er teksten som vises ved siden av bilde-logoen.</p>
                            </div>
                            <div className="space-y-2 mt-4">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Undertittel (f.eks. AUTORISERT REGNSKAPSFØRER)</label>
                                <input
                                    type="text"
                                    placeholder="AUTORISERT REGNSKAPSFØRER"
                                    value={subtitleText}
                                    onChange={e => setSubtitleText(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-gray-50/50 font-bold"
                                />
                                <p className="text-[10px] text-gray-400 italic">Dette er undertittelen som vises under logoen på forsiden.</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* FAVICON SECTION */}
                    <Card className="border-none shadow-sm ring-1 ring-gray-100 rounded-xl overflow-hidden">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-primary" />
                                Favicon
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 flex items-center gap-6">
                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 shrink-0 shadow-inner">
                                {faviconUrl ? (
                                    <img src={faviconUrl} alt="Favicon" className="w-8 h-8 object-contain" />
                                ) : (
                                    <ImageIcon className="w-6 h-6 text-gray-200" />
                                )}
                            </div>
                            <div className="flex-1 space-y-3">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFaviconUpload}
                                    className="hidden"
                                    id="favicon-upload"
                                    disabled={uploading}
                                />
                                <label
                                    htmlFor="favicon-upload"
                                    className="cursor-pointer inline-flex items-center px-4 py-2 bg-white border border-gray-200 shadow-sm text-xs font-bold rounded-xl text-gray-700 hover:bg-gray-50 transition-all w-full justify-center"
                                >
                                    {uploading ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Upload className="w-3 h-3 mr-2" />}
                                    Bytt favicon
                                </label>
                                <input
                                    type="text"
                                    value={faviconUrl}
                                    onChange={(e) => setFaviconUrl(e.target.value)}
                                    className="w-full px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs focus:ring-1 focus:ring-primary/20 outline-none"
                                    placeholder="URL..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* ANALYTICS SECTION */}
                    <Card className="border-none shadow-sm ring-1 ring-gray-100 rounded-xl overflow-hidden">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-primary" />
                                Google Analytics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Measurement ID (G-XXXXXXXXXX)</label>
                                <input
                                    type="text"
                                    placeholder="G-12345678"
                                    value={gaId}
                                    onChange={(e) => setGaId(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-gray-50/50 font-mono text-sm"
                                />
                                <p className="text-[10px] text-gray-400">Tracker besøk og aktivitet automatisk på hele siden.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default GeneralEditor;
