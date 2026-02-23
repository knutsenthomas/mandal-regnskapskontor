import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { applyThemeColor } from '@/lib/themeUtils';

const SiteContext = createContext();

export const useSite = () => {
    return useContext(SiteContext);
};

export const SiteProvider = ({ children }) => {
    const [siteData, setSiteData] = useState({
        logoUrl: null,
        logoText: null,
        faviconUrl: null,
        gaId: null,
        theme: {},
        font_family: null,
    });
    const [loading, setLoading] = useState(true);

    const fetchSiteData = async () => {
        try {
            // Fetch Settings from 'site_settings'
            const { data: settingsData, error: settingsError } = await supabase
                .from('site_settings')
                .select('key, value');

            if (settingsError) throw settingsError;

            const settingsMap = {};
            if (settingsData) {
                settingsData.forEach(item => {
                    settingsMap[item.key] = item.value;
                });
            }

            const themeKeys = [
                'theme_primary', 'theme_secondary', 'theme_background',
                'theme_foreground', 'theme_muted', 'theme_accent'
            ];

            const themeSettings = {};
            themeKeys.forEach(key => {
                if (settingsMap[key]) {
                    themeSettings[key] = settingsMap[key];
                    applyThemeColor(key, settingsMap[key]);
                }
            });

            const newSiteData = {
                logoUrl: settingsMap['logo_url'] || null,
                logoText: settingsMap['logo_text'] || null,
                faviconUrl: settingsMap['favicon_url'] || null,
                gaId: settingsMap['google_analytics_id'] || null,
                theme: themeSettings,
                font_family: settingsMap['font_family'] || null,
            };

            setSiteData(newSiteData);

            // Update Favicon dynamically
            if (newSiteData.faviconUrl) {
                const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
                link.type = 'image/x-icon';
                link.rel = 'shortcut icon';
                link.href = newSiteData.faviconUrl;
                if (!link.parentNode) {
                    document.getElementsByTagName('head')[0].appendChild(link);
                }
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

    useEffect(() => {
        try {
            if (siteData && siteData.font_family) {
                document.body.style.setProperty('--site-font-family', siteData.font_family + ', sans-serif');
                // Dynamisk Google Fonts import
                const googleFonts = [
                    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Nunito', 'Oswald', 'Poppins', 'Source Sans Pro'
                ];
                if (googleFonts.includes(siteData.font_family)) {
                    const fontName = siteData.font_family.replace(/ /g, '+');
                    const linkId = 'dynamic-google-font';
                    let link = document.getElementById(linkId);
                    if (!link) {
                        link = document.createElement('link');
                        link.id = linkId;
                        link.rel = 'stylesheet';
                        document.head.appendChild(link);
                    }
                    link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400;700&display=swap`;
                }
            } else {
                document.body.style.setProperty('--site-font-family', 'DM Sans, sans-serif');
            }
        } catch (e) {
            // Fallback til fabrikkinnstillinger
            document.body.style.setProperty('--site-font-family', 'DM Sans, sans-serif');
            // Du kan også resette typografi her hvis ønskelig
        }
    }, [siteData?.font_family]);

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
