import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

const SiteContext = createContext();

export const useSite = () => {
    return useContext(SiteContext);
};

export const SiteProvider = ({ children }) => {
    const [siteData, setSiteData] = useState({
        logoUrl: null, // From 'content' table
        logoText: null, // From 'site_settings'
        faviconUrl: null, // From 'site_settings'
        gaId: null, // From 'site_settings'
        theme: {}, // From 'site_settings' (theme_*)
    });
    const [loading, setLoading] = useState(true);

    // Helper: Convert Hex to HSL (Tailwind format: "H S% L%")
    const hexToHSL = (hex) => {
        if (!hex) return null;
        let r = 0, g = 0, b = 0;
        if (hex.length === 4) {
            r = "0x" + hex[1] + hex[1];
            g = "0x" + hex[2] + hex[2];
            b = "0x" + hex[3] + hex[3];
        } else if (hex.length === 7) {
            r = "0x" + hex[1] + hex[2];
            g = "0x" + hex[3] + hex[4];
            b = "0x" + hex[5] + hex[6];
        }
        r /= 255;
        g /= 255;
        b /= 255;
        let cmin = Math.min(r, g, b), cmax = Math.max(r, g, b), delta = cmax - cmin;
        let h = 0, s = 0, l = 0;

        if (delta === 0) h = 0;
        else if (cmax === r) h = ((g - b) / delta) % 6;
        else if (cmax === g) h = (b - r) / delta + 2;
        else h = (r - g) / delta + 4;

        h = Math.round(h * 60);
        if (h < 0) h += 360;

        l = (cmax + cmin) / 2;
        s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
        s = +(s * 100).toFixed(1);
        l = +(l * 100).toFixed(1);

        return `${h} ${s}% ${l}%`;
    };

    const fetchSiteData = async () => {
        try {
            // 1. Fetch Logo URL from 'content'
            const { data: contentData } = await supabase
                .from('content')
                .select('logo_url')
                .single();

            // 2. Fetch Settings from 'site_settings'
            const { data: settingsData } = await supabase
                .from('site_settings')
                .select('key, value');

            const settingsMap = {};
            if (settingsData) {
                settingsData.forEach(item => {
                    settingsMap[item.key] = item.value;
                });
            }

            const themeSettings = {};
            const themeKeys = [
                'theme_primary', 'theme_secondary', 'theme_background',
                'theme_foreground', 'theme_muted', 'theme_accent'
            ];

            // Map keys to CSS variables
            const cssVarMap = {
                'theme_primary': '--primary',
                'theme_secondary': '--secondary',
                'theme_background': '--background',
                'theme_foreground': '--foreground',
                'theme_muted': '--muted',
                'theme_accent': '--accent'
            };

            themeKeys.forEach(key => {
                if (settingsMap[key]) {
                    themeSettings[key] = settingsMap[key];
                    const hsl = hexToHSL(settingsMap[key]);
                    if (hsl) {
                        document.documentElement.style.setProperty(cssVarMap[key], hsl);
                    }
                }
            });


            const newSiteData = {
                logoUrl: settingsMap['logo_url'] || contentData?.logo_url || null,
                logoText: settingsMap['logo_text'] || null,
                faviconUrl: settingsMap['favicon_url'] || null,
                gaId: settingsMap['google_analytics_id'] || null,
                theme: themeSettings,
            };

            setSiteData(newSiteData);

            // Update Favicon dynamically
            if (newSiteData.faviconUrl) {
                const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
                link.type = 'image/x-icon';
                link.rel = 'shortcut icon';
                link.href = newSiteData.faviconUrl;
                document.getElementsByTagName('head')[0].appendChild(link);
            }

        } catch (error) {
            console.error('Error fetching site data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSiteData();

        // Listen for changes (optional, but good for real-time updates)
        const channel = supabase
            .channel('public:site_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, () => fetchSiteData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'content' }, () => fetchSiteData())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const value = {
        ...siteData,
        refreshSiteData: fetchSiteData,
        loading
    };

    return (
        <SiteContext.Provider value={value}>
            {children}
        </SiteContext.Provider>
    );
};
