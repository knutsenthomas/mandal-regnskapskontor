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
            const settingsToUpdate = Object.keys(colors).map(key => ({
                key,
                value: colors[key]
            }));

            for (const setting of settingsToUpdate) {
                const { error } = await supabase.rpc('upsert_site_setting', {
                    p_key: setting.key,
                    p_value: setting.value
                });
                if (error) throw error;
            }

            // Trigger global refresh to apply styles via SiteContext
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
