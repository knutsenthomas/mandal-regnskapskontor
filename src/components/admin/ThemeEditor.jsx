import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Save, Loader2, RotateCcw, Palette } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useSite } from '@/contexts/SiteContext';

const ThemeEditor = () => {
    const { toast } = useToast();
    const { theme, refreshSiteData } = useSite();
    const [loading, setLoading] = useState(false);

    // Default colors matching index.css (approximate Hex for inputs)
    const defaults = {
        theme_primary: '#1B4965', // Brand Blue
        theme_secondary: '#f1f5f9', // Slate 100
        theme_background: '#ffffff',
        theme_foreground: '#0f172a', // Slate 900
        theme_muted: '#f1f5f9',
        theme_accent: '#f1f5f9',
    };

    const [colors, setColors] = useState(defaults);

    useEffect(() => {
        if (theme && Object.keys(theme).length > 0) {
            setColors(prev => ({ ...prev, ...theme }));
        }
    }, [theme]);

    const handleColorChange = (key, value) => {
        setColors(prev => ({ ...prev, [key]: value }));

        // Live preview (optional, but nice)
        // We can rely on save for full effect, or try to inject styles here.
        // For now, reliance on save is safer to ensure persistence.
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Konverter HEX til HSL før lagring i CSS-variabler
            const settingsToUpdate = Object.keys(colors).map(key => {
                let value = colors[key];
                // Konverter til HSL hvis HEX
                if (value && value.startsWith('#')) {
                    value = hexToHSL(value);
                }
                return { key, value };
            });

            for (const setting of settingsToUpdate) {
                const { error } = await supabase.rpc('upsert_site_setting', {
                    p_key: setting.key,
                    p_value: setting.value
                });
                if (error) throw error;
            }

            await refreshSiteData();

            toast({
                title: "Tema oppdatert!",
                description: "Fargeendringene er lagret.",
                className: "bg-green-50 border-green-200"
            });
        } catch (error) {
            console.error('Save error:', error);
            toast({
                title: "Feil ved lagring",
                description: "Kunne ikke lagre tema.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async () => {
        if (!window.confirm("Er du sikker på at du vil tilbakestille alle farger til standard?")) return;

        setLoading(true);
        try {
            // We can either delete the keys or set them to defaults.
            // Deleting is cleaner as it falls back to CSS defaults if we implemented fallback logic in SiteContext (which we didn't explicitly, we just don't set the prop).
            // However, SiteContext doesn't remove the property if the key is missing from DB (it just doesn't set it).
            // So we should probably set them to the defaults or implement a reliable "unset" mechanism.
            // For now, let's explicitly set to defaults to be sure.

            const settingsToUpdate = Object.keys(defaults).map(key => ({
                key,
                value: defaults[key]
            }));

            for (const setting of settingsToUpdate) {
                const { error } = await supabase.rpc('upsert_site_setting', {
                    p_key: setting.key,
                    p_value: setting.value
                });
                if (error) throw error;
            }

            await refreshSiteData();
            setColors(defaults); // Update local state

            toast({
                title: "Tema tilbakestilt",
                description: "Standardfarger er gjenopprettet.",
            });
        } catch (error) {
            console.error('Reset error:', error);
            toast({
                title: "Feil ved tilbakestilling",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const ColorInput = ({ label, description, stateKey }) => (
        <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
            <div>
                <h4 className="font-medium text-sm text-gray-900">{label}</h4>
                <p className="text-xs text-gray-500">{description}</p>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-gray-500 uppercase">{colors[stateKey]}</span>
                <input
                    type="color"
                    value={colors[stateKey]}
                    onChange={(e) => handleColorChange(stateKey, e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded-md border-0 p-0"
                />
            </div>
        </div>
    );

    // Legg til typografi-innstillinger
    const fontFamilies = [
        'Inter', 'Arial', 'Helvetica', 'Georgia', 'Times New Roman', 'Courier New', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Nunito', 'Oswald', 'Poppins', 'Source Sans Pro', 'system-ui'
    ];
    const defaultTypography = {
        font_family: 'Roboto',
        h1_size: '2.5rem',
        h2_size: '2rem',
        h3_size: '1.5rem',
        body_size: '1rem',
    };
    const [typography, setTypography] = useState(defaultTypography);

    const handleTypographyChange = (key, value) => {
        setTypography(prev => ({ ...prev, [key]: value }));
    };

    const handleSaveTypography = async () => {
        setLoading(true);
        try {
            const settingsToUpdate = Object.keys(typography).map(key => ({
                key,
                value: typography[key]
            }));
            for (const setting of settingsToUpdate) {
                const { error } = await supabase.rpc('upsert_site_setting', {
                    p_key: setting.key,
                    p_value: setting.value
                });
                if (error) throw error;
            }
            await refreshSiteData();
            toast({
                title: "Typografi oppdatert!",
                description: "Tekstinnstillingene er lagret.",
                className: "bg-green-50 border-green-200"
            });
        } catch (error) {
            toast({
                title: "Feil ved lagring",
                description: "Kunne ikke lagre typografi.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Palette className="w-5 h-5" />
                        Fargetema
                    </CardTitle>
                    <CardDescription>
                        Tilpass nettsidens farger. Endringer påvirker hele siden.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ColorInput
                        label="Hovedfarge (Primary)"
                        description="Knapper, lenker, aktive elementer og ikoner."
                        stateKey="theme_primary"
                    />
                    <ColorInput
                        label="Sekundærfarge (Secondary)"
                        description="Bakgrunn på kort, seksjoner og mindre viktige elementer."
                        stateKey="theme_secondary"
                    />
                    <ColorInput
                        label="Bakgrunnsfarge"
                        description="Hovedbakgrunnen på hele nettsiden."
                        stateKey="theme_background"
                    />
                    <ColorInput
                        label="Tekstfarge"
                        description="Fargen på hovedteksten."
                        stateKey="theme_foreground"
                    />
                    <ColorInput
                        label="Aksentfarge"
                        description="Farge for hover-effekter og uthevinger."
                        stateKey="theme_accent"
                    />
                    <ColorInput
                        label="Dempede elementer (Muted)"
                        description="Bakgrunner for inaktive eller dempede elementer."
                        stateKey="theme_muted"
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Palette className="w-5 h-5" />
                        Typografi
                    </CardTitle>
                    <CardDescription>
                        Velg font og tekststørrelse for alle teksttyper.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-4">
                        <label className="font-medium text-sm text-gray-900">Fontfamilie
                            <select value={typography.font_family} onChange={e => handleTypographyChange('font_family', e.target.value)} className="border p-2 rounded mt-1">
                                {fontFamilies.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </label>
                        <label className="font-medium text-sm text-gray-900">H1 størrelse
                            <input type="text" value={typography.h1_size} onChange={e => handleTypographyChange('h1_size', e.target.value)} className="border p-2 rounded mt-1" placeholder="2.5rem" />
                        </label>
                        <label className="font-medium text-sm text-gray-900">H2 størrelse
                            <input type="text" value={typography.h2_size} onChange={e => handleTypographyChange('h2_size', e.target.value)} className="border p-2 rounded mt-1" placeholder="2rem" />
                        </label>
                        <label className="font-medium text-sm text-gray-900">H3 størrelse
                            <input type="text" value={typography.h3_size} onChange={e => handleTypographyChange('h3_size', e.target.value)} className="border p-2 rounded mt-1" placeholder="1.5rem" />
                        </label>
                        <label className="font-medium text-sm text-gray-900">Brødtekst størrelse
                            <input type="text" value={typography.body_size} onChange={e => handleTypographyChange('body_size', e.target.value)} className="border p-2 rounded mt-1" placeholder="1rem" />
                        </label>
                    </div>
                    {/* Live preview */}
                    <div className="bg-gray-100 rounded p-4 mt-6 border">
                        <div style={{ fontFamily: typography.font_family, fontSize: typography.h1_size, fontWeight: 700 }}>Live H1: Mandal Regnskapskontor</div>
                        <div style={{ fontFamily: typography.font_family, fontSize: typography.h2_size, fontWeight: 600, marginTop: '1rem' }}>Live H2: Regnskapstjenester for alle</div>
                        <div style={{ fontFamily: typography.font_family, fontSize: typography.h3_size, fontWeight: 500, marginTop: '1rem' }}>Live H3: Personlig rådgivning</div>
                        <div style={{ fontFamily: typography.font_family, fontSize: typography.body_size, marginTop: '1rem' }}>Live brødtekst: Her ser du hvordan font og størrelse vil se ut på nettsiden din.</div>
                    </div>
                    <Button onClick={handleSaveTypography} disabled={loading} className="bg-[#1B4965] hover:bg-[#0F3347] text-white mt-4">
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Lagre typografi
                    </Button>
                </CardContent>
            </Card>

            <div className="flex justify-between pt-4 border-t border-gray-100">
                <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={loading}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Tilbakestill standard
                </Button>

                <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-[#1B4965] hover:bg-[#0F3347] text-white"
                >
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Lagre endringer
                </Button>
            </div>
        </div>
    );
};

export default ThemeEditor;
