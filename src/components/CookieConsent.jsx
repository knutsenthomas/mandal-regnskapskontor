import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSite } from '@/contexts/SiteContext';
import { Link } from 'react-router-dom';

const PreferenceToggle = ({ active, disabled = false, onClick, label }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        aria-pressed={active}
        aria-disabled={disabled}
        className={`
            relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent transition-colors
            focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2
            ${active ? 'bg-primary' : 'bg-gray-300'}
            ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
        `}
    >
        <span
            className={`
                pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform
                ${active ? 'translate-x-5' : 'translate-x-0.5'}
            `}
        />
    </button>
);

const PreferenceOption = ({ label, active, disabled = false, onClick, muted = false }) => (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white px-4 py-3">
        <span className={`min-w-0 text-xs font-bold uppercase tracking-wider ${muted ? 'text-gray-400' : 'text-gray-700'}`}>
            {label}
        </span>
        <PreferenceToggle
            active={active}
            disabled={disabled}
            onClick={onClick}
            label={`Toggle ${label.toLowerCase()}-cookies`}
        />
    </div>
);

const CookieConsent = () => {
    const { cookieConsent, updateConsent } = useSite();
    const [isVisible, setIsVisible] = useState(false);
    const [prefs, setPrefs] = useState({
        necessary: true,
        statistics: false,
        marketing: false
    });

    useEffect(() => {
        // Show banner after a short delay if no consent is set
        if (cookieConsent === null) {
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [cookieConsent]);

    const handleAcceptAll = () => {
        const allOn = { necessary: true, statistics: true, marketing: true };
        updateConsent(allOn);
        setIsVisible(false);
    };

    const handleAcceptSelected = () => {
        updateConsent(prefs);
        setIsVisible(false);
    };

    const handleDeclineAll = () => {
        const allOff = { necessary: true, statistics: false, marketing: false };
        updateConsent(allOff);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm pointer-events-none">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-[24px] shadow-2xl max-w-[600px] w-full p-6 md:p-10 pointer-events-auto max-h-[90dvh] overflow-y-auto"
                >
                    <div className="flex flex-col text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start mb-2">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                                Cookies & Personvern
                            </h2>
                        </div>

                        <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-4">
                            Vi bruker informasjonskapsler for å sikre at nettsiden fungerer og for å analysere trafikken vår.
                            <Link
                                to="/personvern"
                                className="text-primary font-medium hover:underline ml-1 inline-block"
                                onClick={() => setIsVisible(false)}
                            >
                                Les mer her
                            </Link>
                        </p>

                        {/* Preferences area - more compact */}
                        <div className="bg-gray-50 rounded-[16px] p-4 mb-6 border border-gray-100">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <PreferenceOption
                                    label="Nødvendige"
                                    active
                                    disabled
                                    muted
                                />
                                <PreferenceOption
                                    label="Statistikk"
                                    active={prefs.statistics}
                                    onClick={() => setPrefs(prev => ({ ...prev, statistics: !prev.statistics }))}
                                />
                                <PreferenceOption
                                    label="Markedsføring"
                                    active={prefs.marketing}
                                    onClick={() => setPrefs(prev => ({ ...prev, marketing: !prev.marketing }))}
                                />
                            </div>
                        </div>

                        {/* Buttons - Stack on mobile, grid on desktop */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleAcceptAll}
                                className="flex-1 bg-primary text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-sm active:scale-[0.98] text-sm"
                            >
                                Tillat alle
                            </button>
                            <button
                                onClick={handleAcceptSelected}
                                className="flex-1 border-2 border-primary text-primary font-bold py-3 px-6 rounded-xl transition-all active:scale-[0.98] text-sm"
                            >
                                Lagre utvalg
                            </button>
                            <button
                                onClick={handleDeclineAll}
                                className="sm:flex-none text-gray-400 hover:text-gray-600 font-medium py-3 px-4 text-xs transition-colors"
                            >
                                Kun nødvendige
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CookieConsent;
