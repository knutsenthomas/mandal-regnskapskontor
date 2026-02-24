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
    const [cookieConsent, setCookieConsent] = useState(null); // null = not set, 'all', 'partial', 'none'
    const [cookiePreferences, setCookiePreferences] = useState({
        necessary: true,
        statistics: false,
        marketing: false
    });

    const updateConsent = (prefs) => {
        setCookiePreferences(prefs);
        const consentType = prefs.statistics && prefs.marketing ? 'all' : (prefs.statistics || prefs.marketing ? 'partial' : 'none');
        setCookieConsent(consentType);
        localStorage.setItem('cookie-consent', JSON.stringify({ type: consentType, prefs }));
    };

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
                'theme_foreground', 'theme_muted', 'theme_accent', 'theme_card'
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
                h1_size: settingsMap['h1_size'] || null,
                h2_size: settingsMap['h2_size'] || null,
                h3_size: settingsMap['h3_size'] || null,
                body_size: settingsMap['body_size'] || null,
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
        const savedConsent = localStorage.getItem('cookie-consent');
        if (savedConsent) {
            try {
                const parsed = JSON.parse(savedConsent);
                setCookieConsent(parsed.type);
                setCookiePreferences(parsed.prefs);
            } catch (e) {
                console.error("Failed to parse saved cookie consent");
            }
        }
    }, []);


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
            if (siteData) {
                // Font Family
                if (siteData.font_family) {
                    const fontFamily = siteData.font_family.includes(' ')
                        ? `'${siteData.font_family}'`
                        : siteData.font_family;
                    document.documentElement.style.setProperty('--site-font-family', `${fontFamily}, sans-serif`);

                    // Dynamisk Google Fonts import for alle fonter i listen
                    const googleFonts = [
                        'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Nunito',
                        'Oswald', 'Poppins', 'Source Sans Pro'
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
                        link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400;500;600;700&display=swap`;
                    }
                }

                // Typography Sizes
                if (siteData.h1_size) document.documentElement.style.setProperty('--h1-size', siteData.h1_size);
                if (siteData.h2_size) document.documentElement.style.setProperty('--h2-size', siteData.h2_size);
                if (siteData.h3_size) document.documentElement.style.setProperty('--h3-size', siteData.h3_size);
                if (siteData.body_size) document.documentElement.style.setProperty('--body-size', siteData.body_size);
            }
        } catch (e) {
            console.error('Error applying theme/typography:', e);
        }
    }, [siteData]);

    const value = {
        ...siteData,
        refreshSiteData: fetchSiteData,
        loading,
        cookieConsent,
        cookiePreferences,
        updateConsent
    };

    return (
        <SiteContext.Provider value={value}>
            {children}
        </SiteContext.Provider>
    );
};
