import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Save, Loader2, Upload, Image as ImageIcon, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const GeneralEditor = ({ content, onUpdate }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [logoUrl, setLogoUrl] = useState('');
    const [gaId, setGaId] = useState(''); // Google Analytics ID

    // Fetch initial data
    useEffect(() => {
        if (content) {
            setLogoUrl(content.logo_url || '');
        }
        fetchSettings();
    }, [content]);

    const fetchSettings = async () => {
        const { data } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'google_analytics_id')
            .single();

        if (data) {
            setGaId(data.value || '');
        }
    };

    const handleImageUpload = async (e) => {
        try {
            setUploading(true);
            const file = e.target.files[0];
            if (!file) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `logo-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Last opp til Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Hent offentlig URL
            const { data } = supabase.storage.from('images').getPublicUrl(filePath);
            setLogoUrl(data.publicUrl);

            toast({
                title: "Bilde lastet opp",
                description: "Husk å lagre endringene.",
                className: "bg-green-50 border-green-200"
            });

        } catch (error) {
            console.error('Upload error:', error);
            toast({
                title: "Feil ved opplasting",
                description: "Kunne ikke laste opp bilde.",
                variant: "destructive"
            });
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);

        try {
            // 1. Update Content (Logo)
            if (content?.id) {
                const { error: contentError } = await supabase
                    .from('content')
                    .update({ logo_url: logoUrl })
                    .eq('id', content.id);

                if (contentError) throw contentError;
            }

            // 2. Update Settings (GA ID)
            // Upsert logic for GA ID
            const { error: settingsError } = await supabase
                .from('site_settings')
                .upsert({
                    key: 'google_analytics_id',
                    value: gaId
                }, { onConflict: 'key' });

            if (settingsError) throw settingsError;

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
        <div className="space-y-8">
            {/* LOGO SECTION */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Nettside Logo</CardTitle>
                    <CardDescription>Last opp logoen som vises i toppen av nettsiden.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center bg-gray-50">
                        {logoUrl ? (
                            <div className="relative group">
                                <img src={logoUrl} alt="Logo Preview" className="h-20 object-contain mb-4" />
                            </div>
                        ) : (
                            <div className="text-gray-400 flex flex-col items-center mb-4">
                                <ImageIcon className="w-12 h-12 mb-2" />
                                <span className="text-sm">Ingen logo lastet opp</span>
                            </div>
                        )}

                        <div className="relative">
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
                                className={`cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {uploading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Upload className="w-4 h-4 mr-2" />
                                )}
                                {uploading ? 'Laster opp...' : 'Last opp ny logo'}
                            </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Anbefalt: PNG med gjennomsiktig bakgrunn</p>
                    </div>
                </CardContent>
            </Card>

            {/* ANALYTICS SECTION */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-[#1B4965]" />
                        Google Analytics
                    </CardTitle>
                    <CardDescription>Koble nettsiden til Google Analytics 4 for å spore besøkende.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Measurement ID (G-XXXXXXXXXX)</label>
                        <input
                            type="text"
                            placeholder="G-12345678"
                            value={gaId}
                            onChange={(e) => setGaId(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <p className="text-xs text-gray-500">
                            Du finner denne ID-en i Google Analytics under <strong>Admin {'>'} Data Streams</strong>.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end pt-4 border-t border-gray-100">
                <Button
                    onClick={handleSave}
                    disabled={loading || uploading}
                    className="bg-[#1B4965] hover:bg-[#0F3347] text-white w-full md:w-auto"
                >
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Lagre endringer
                </Button>
            </div>
        </div>
    );
};

export default GeneralEditor;