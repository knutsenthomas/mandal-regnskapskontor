import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Save, Loader2, RotateCcw, Palette } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useSite } from '@/contexts/SiteContext';
import { hexToHSL, hslToHex, applyThemeColor } from '@/lib/themeUtils';

const THEME_DEFAULTS = {
    theme_primary: '202 50.8% 23.1%',
    theme_secondary: '204 38.3% 34.3%',
    theme_background: '220 12% 95.1%',
    theme_card: '#FFFFFF',
    theme_foreground: '222 47.4% 11.2%',
    theme_muted: '210 40% 96.1%',
    theme_accent: '220 14.3% 95.9%',
};

const FONT_FAMILIES = [
    'Inter', 'Arial', 'Helvetica', 'Georgia', 'Times New Roman', 'Courier New', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Nunito', 'Oswald', 'Poppins', 'Source Sans Pro', 'system-ui'
];

const DEFAULT_TYPOGRAPHY = {
    font_family: 'Roboto',
    h1_size: '2.5rem',
    h2_size: '2rem',
    h3_size: '1.5rem',
    body_size: '1rem',
};

const isHSL = (val) => val && typeof val === 'string' && val.includes(' ') && !val.startsWith('#');

const ThemeColorInput = React.memo(function ThemeColorInput({
    label,
    description,
    stateKey,
    value,
    onColorChange,
}) {
    const displayHex = isHSL(value) ? hslToHex(value) : value;

    const handleColorInput = (nextValue) => {
        onColorChange(stateKey, nextValue);
    };

    return (
        <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
            <div>
                <h4 className="font-medium text-sm text-gray-900">{label}</h4>
                <p className="text-xs text-gray-500">{description}</p>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-gray-500 uppercase">{typeof value === 'string' ? value.replace(/%/g, '') : value}</span>
                <input
                    type="color"
                    value={displayHex || '#000000'}
                    onInput={(e) => handleColorInput(e.currentTarget.value)}
                    onChange={(e) => handleColorInput(e.currentTarget.value)}
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="h-10 w-10 cursor-pointer rounded-md border-0 p-0"
                />
            </div>
        </div>
    );
});

const ThemeEditor = () => {
    const { toast } = useToast();
    const { theme, font_family, h1_size, h2_size, h3_size, body_size, refreshSiteData } = useSite();
    const [loading, setLoading] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [colors, setColors] = useState(THEME_DEFAULTS);

    useEffect(() => {
        if (theme && Object.keys(theme).length > 0) {
            setColors(prev => ({ ...prev, ...theme }));
        }
    }, [theme]);

    useEffect(() => {
        const loadedTypography = {
            font_family: font_family || DEFAULT_TYPOGRAPHY.font_family,
            h1_size: h1_size || DEFAULT_TYPOGRAPHY.h1_size,
            h2_size: h2_size || DEFAULT_TYPOGRAPHY.h2_size,
            h3_size: h3_size || DEFAULT_TYPOGRAPHY.h3_size,
            body_size: body_size || DEFAULT_TYPOGRAPHY.body_size,
        };
        setTypography(loadedTypography);
    }, [font_family, h1_size, h2_size, h3_size, body_size]);

    const handleColorChange = (key, value) => {
        setColors(prev => ({ ...prev, [key]: value }));
        // Live preview in dashboard + site (CSS variables)
        applyThemeColor(key, value);
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
        setLoading(true);
        try {
            const settingsToUpdate = Object.keys(THEME_DEFAULTS).map(key => ({
                key,
                value: THEME_DEFAULTS[key]
            }));

            // Apply immediately in the UI before/while saving.
            setColors(THEME_DEFAULTS);
            settingsToUpdate.forEach((setting) => applyThemeColor(setting.key, setting.value));

            for (const setting of settingsToUpdate) {
                const { error } = await supabase.rpc('upsert_site_setting', {
                    p_key: setting.key,
                    p_value: setting.value
                });
                if (error) throw error;
            }

            await refreshSiteData();
            setShowResetConfirm(false);

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

    // Legg til typografi-innstillinger
    const [typography, setTypography] = useState(DEFAULT_TYPOGRAPHY);

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
                    <ThemeColorInput
                        label="Hovedfarge (Primary)"
                        description="Knapper, lenker, aktive elementer og ikoner."
                        stateKey="theme_primary"
                        value={colors.theme_primary}
                        onColorChange={handleColorChange}
                    />
                    <ThemeColorInput
                        label="Sekundærfarge (Secondary)"
                        description="Bakgrunn på kort, seksjoner og mindre viktige elementer."
                        stateKey="theme_secondary"
                        value={colors.theme_secondary}
                        onColorChange={handleColorChange}
                    />
                    <ThemeColorInput
                        label="Bakgrunnsfarge"
                        description="Hovedbakgrunnen på hele nettsiden."
                        stateKey="theme_background"
                        value={colors.theme_background}
                        onColorChange={handleColorChange}
                    />
                    <ThemeColorInput
                        label="Kort-bakgrunn (Card)"
                        description="Bakgrunnsfarge for bokser, kort og kalender."
                        stateKey="theme_card"
                        value={colors.theme_card}
                        onColorChange={handleColorChange}
                    />
                    <ThemeColorInput
                        label="Tekstfarge"
                        description="Fargen på hovedteksten."
                        stateKey="theme_foreground"
                        value={colors.theme_foreground}
                        onColorChange={handleColorChange}
                    />
                    <ThemeColorInput
                        label="Aksentfarge"
                        description="Farge for hover-effekter og uthevinger."
                        stateKey="theme_accent"
                        value={colors.theme_accent}
                        onColorChange={handleColorChange}
                    />
                    <ThemeColorInput
                        label="Dempede elementer (Muted)"
                        description="Bakgrunner for inaktive eller dempede elementer."
                        stateKey="theme_muted"
                        value={colors.theme_muted}
                        onColorChange={handleColorChange}
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
                                {FONT_FAMILIES.map(f => <option key={f} value={f}>{f}</option>)}
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
                    <div className="bg-gray-100 rounded p-4 mt-6 border overflow-hidden w-full">
                        <div style={{
                            fontFamily: typography.font_family,
                            fontSize: typography.h1_size,
                            fontWeight: 700,
                            lineHeight: 1.2,
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word'
                        }}>
                            Live H1: Mandal Regnskapskontor
                        </div>
                        <div style={{
                            fontFamily: typography.font_family,
                            fontSize: typography.h2_size,
                            fontWeight: 600,
                            marginTop: '1rem',
                            lineHeight: 1.2,
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word'
                        }}>
                            Live H2: Regnskapstjenester for alle
                        </div>
                        <div style={{
                            fontFamily: typography.font_family,
                            fontSize: typography.h3_size,
                            fontWeight: 500,
                            marginTop: '1rem',
                            lineHeight: 1.2,
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word'
                        }}>
                            Live H3: Personlig rådgivning
                        </div>
                        <div style={{
                            fontFamily: typography.font_family,
                            fontSize: typography.body_size,
                            marginTop: '1rem',
                            lineHeight: 1.5,
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word'
                        }}>
                            Live brødtekst: Her ser du hvordan font og størrelse vil se ut på nettsiden din.
                        </div>
                    </div>
                    <Button type="button" onClick={handleSaveTypography} disabled={loading} className="bg-[#1B4965] hover:bg-[#0F3347] text-white mt-4">
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Lagre typografi
                    </Button>
                </CardContent>
            </Card>

            <div className="flex justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                    {!showResetConfirm ? (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowResetConfirm(true)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Tilbakestill standard
                        </Button>
                    ) : (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowResetConfirm(false)}
                                disabled={loading}
                            >
                                Avbryt
                            </Button>
                            <Button
                                type="button"
                                onClick={handleReset}
                                disabled={loading}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                Bekreft tilbakestilling
                            </Button>
                        </>
                    )}
                </div>

                <Button
                    type="button"
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
