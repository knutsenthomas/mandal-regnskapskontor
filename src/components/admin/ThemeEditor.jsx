import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Save, Loader2, RotateCcw, Palette, Type, Info, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useSite } from '@/contexts/SiteContext';
import { hexToHSL, hslToHex, applyThemeColor } from '@/lib/themeUtils';
import AdminHeader from './layout/AdminHeader';

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
        <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-white hover:shadow-md transition-all group">
            <div className="flex-1">
                <h4 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: displayHex }}></div>
                    {label}
                </h4>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">{description}</p>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">
                    {typeof value === 'string' ? value.replace(/%/g, '') : value}
                </span>
                <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-200 shadow-sm ring-offset-2 ring-primary/20 group-hover:ring-2 transition-all">
                    <input
                        type="color"
                        value={displayHex || '#000000'}
                        onInput={(e) => handleColorInput(e.currentTarget.value)}
                        onChange={(e) => handleColorInput(e.currentTarget.value)}
                        onPointerDown={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="absolute inset-[-5px] w-[200%] h-[200%] cursor-pointer border-0 p-0"
                    />
                </div>
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
    const [typography, setTypography] = useState(DEFAULT_TYPOGRAPHY);

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
        applyThemeColor(key, value);
    };

    const handleSaveAll = async () => {
        setLoading(true);
        try {
            const colorSettings = Object.keys(colors).map(key => {
                let value = colors[key];
                if (value && value.startsWith('#')) {
                    value = hexToHSL(value);
                }
                return { key, value };
            });

            const typoSettings = Object.keys(typography).map(key => ({
                key,
                value: typography[key]
            }));

            const allSettings = [...colorSettings, ...typoSettings];

            for (const setting of allSettings) {
                const { error } = await supabase.rpc('upsert_site_setting', {
                    p_key: setting.key,
                    p_value: setting.value
                });
                if (error) throw error;
            }

            await refreshSiteData();

            toast({
                title: "Innstillingene er lagret!",
                description: "Nettsidens utseende er nå oppdatert.",
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

    const handleTypographyChange = (key, value) => {
        setTypography(prev => ({ ...prev, [key]: value }));
    };

    const handleReset = async () => {
        setLoading(true);
        try {
            setColors(THEME_DEFAULTS);
            setTypography(DEFAULT_TYPOGRAPHY);

            const allDefaults = { ...THEME_DEFAULTS, ...DEFAULT_TYPOGRAPHY };

            const settingsToUpdate = Object.keys(allDefaults).map(key => ({
                key,
                value: allDefaults[key]
            }));

            // Apply immediately in UI
            Object.keys(THEME_DEFAULTS).forEach((key) => applyThemeColor(key, THEME_DEFAULTS[key]));

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
                description: "Standardverdier er gjenopprettet.",
                className: "bg-blue-50 border-blue-200"
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

    return (
        <div className="space-y-6">
            <AdminHeader
                icon={Palette}
                title="Tema & Utseende"
                description="Tilpass farger, fonter og typografi for hele nettsiden din."
            >
                <div className="flex gap-2">
                    {!showResetConfirm ? (
                        <Button
                            variant="outline"
                            onClick={() => setShowResetConfirm(true)}
                            className="bg-white border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Tilbakestill
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button variant="ghost" onClick={() => setShowResetConfirm(false)} className="text-gray-500">Avbryt</Button>
                            <Button onClick={handleReset} className="bg-red-500 hover:bg-red-600 text-white">Bekreft reset</Button>
                        </div>
                    )}
                    <Button
                        onClick={handleSaveAll}
                        disabled={loading}
                        className="bg-[#1B4965] hover:bg-[#0F3347] text-white flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Lagre endringer
                    </Button>
                </div>
            </AdminHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* COLOR SETTINGS */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-4 bg-gray-50/50 border-b border-gray-50 flex items-center gap-2">
                            <Palette className="w-4 h-4 text-primary" />
                            <h3 className="font-bold text-gray-700">Fargepalett</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ThemeColorInput
                                label="Hovedfarge"
                                description="Knapper og aktive elementer"
                                stateKey="theme_primary"
                                value={colors.theme_primary}
                                onColorChange={handleColorChange}
                            />
                            <ThemeColorInput
                                label="Sekundærfarge"
                                description="Seksjonsbakgrunner og kort"
                                stateKey="theme_secondary"
                                value={colors.theme_secondary}
                                onColorChange={handleColorChange}
                            />
                            <ThemeColorInput
                                label="Bakgrunn"
                                description="Hovedfarge på hele siden"
                                stateKey="theme_background"
                                value={colors.theme_background}
                                onColorChange={handleColorChange}
                            />
                            <ThemeColorInput
                                label="Kort & Elementer"
                                description="Bokser, kalender og menyer"
                                stateKey="theme_card"
                                value={colors.theme_card}
                                onColorChange={handleColorChange}
                            />
                            <ThemeColorInput
                                label="Hovedtekst"
                                description="Lesevennlighet for brødtekst"
                                stateKey="theme_foreground"
                                value={colors.theme_foreground}
                                onColorChange={handleColorChange}
                            />
                            <ThemeColorInput
                                label="Aksent"
                                description="Hover-effekter og detaljer"
                                stateKey="theme_accent"
                                value={colors.theme_accent}
                                onColorChange={handleColorChange}
                            />
                        </div>
                    </div>

                    {/* TYPOGRAPHY SETTINGS */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-4 bg-gray-50/50 border-b border-gray-50 flex items-center gap-2">
                            <Type className="w-4 h-4 text-primary" />
                            <h3 className="font-bold text-gray-700">Typografi & Tekststørrelser</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Fontfamilie</label>
                                    <select
                                        value={typography.font_family}
                                        onChange={e => handleTypographyChange('font_family', e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                                    >
                                        {FONT_FAMILIES.map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">H1 Overskrift</label>
                                        <input
                                            type="text"
                                            value={typography.h1_size}
                                            onChange={e => handleTypographyChange('h1_size', e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">H2 Overskrift</label>
                                        <input
                                            type="text"
                                            value={typography.h2_size}
                                            onChange={e => handleTypographyChange('h2_size', e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">H3 Overskrift</label>
                                        <input
                                            type="text"
                                            value={typography.h3_size}
                                            onChange={e => handleTypographyChange('h3_size', e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Brødtekst</label>
                                        <input
                                            type="text"
                                            value={typography.body_size}
                                            onChange={e => handleTypographyChange('body_size', e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 flex flex-col justify-center space-y-4">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mb-2">Live Forhåndsvisning</span>
                                <div style={{
                                    fontFamily: typography.font_family,
                                    fontSize: typography.h1_size,
                                    fontWeight: 700,
                                    lineHeight: 1.1,
                                    color: isHSL(colors.theme_primary) ? hslToHex(colors.theme_primary) : colors.theme_primary
                                }}>
                                    H1 Overskrift
                                </div>
                                <div style={{
                                    fontFamily: typography.font_family,
                                    fontSize: typography.h2_size,
                                    fontWeight: 600,
                                    lineHeight: 1.2,
                                    color: '#333'
                                }}>
                                    H2 Underoverskrift
                                </div>
                                <div style={{
                                    fontFamily: typography.font_family,
                                    fontSize: typography.body_size,
                                    lineHeight: 1.5,
                                    color: '#666'
                                }}>
                                    Dette er en forhåndsvisning av hvordan teksten vil se ut med valgt font og størrelser på nettsiden din.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="border-none shadow-sm ring-1 ring-gray-100 rounded-2xl overflow-hidden bg-white">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Info className="w-4 h-4 text-primary" />
                                Hva gjør disse valgene?
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                                    <Check className="w-3 h-3 text-green-600" />
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed"><strong>Farger:</strong> Påvirker knapper, menyer, bakgrunner og ikoner i sanntid.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                                    <Check className="w-3 h-3 text-green-600" />
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed"><strong>Typografi:</strong> Lager et konsistent uttrykk gjennom hele nettsiden med Google Fonts.</p>
                            </div>
                            <div className="pt-2">
                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 px-1">Merk!</p>
                                <div className="bg-primary/5 p-4 rounded-xl text-xs text-primary leading-relaxed italic">
                                    Vi anbefaler å bruke standardfargene for best mulig kontrast og universell utforming.
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="bg-[#1B4965] rounded-2xl p-6 text-white shadow-lg space-y-3 relative overflow-hidden group">
                        <h4 className="font-bold text-lg relative z-10">Grafisk profil</h4>
                        <p className="text-xs text-blue-100 leading-relaxed relative z-10 italic">
                            Din bedrift har en definert fargepalett som sikrer at nettstedet ser profesjonelt og troverdig ut.
                        </p>
                        <Palette className="absolute -right-8 -bottom-8 w-32 h-32 text-white/5 group-hover:rotate-12 transition-transform duration-700" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThemeEditor;
