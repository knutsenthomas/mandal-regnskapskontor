import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSite } from '@/contexts/SiteContext';
import { Link } from 'react-router-dom';

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
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white rounded-[24px] shadow-2xl max-w-[600px] w-full p-8 md:p-10 pointer-events-auto"
                >
                    <div className="text-center">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                            Vi bryr oss om ditt personvern
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            Vi bruker informasjonskapsler (cookies) for at nettsiden skal fungere, for å analysere trafikken vår og for å tilby deg en bedre brukeropplevelse. Du kan velge hvilke kategorier du vil tillate.
                        </p>
                        <Link
                            to="/personvern"
                            className="text-primary font-medium hover:underline mb-8 inline-block"
                            onClick={() => setIsVisible(false)}
                        >
                            Les vår personvernerklæring
                        </Link>

                        {/* Preferences area */}
                        <div className="bg-muted/50 rounded-[16px] p-6 mb-8 mt-2 border border-border/50">
                            <div className="flex flex-wrap justify-center gap-x-8 gap-y-6">
                                {/* Necessary */}
                                <div className="flex items-center gap-3">
                                    <label className="relative inline-flex items-center cursor-not-allowed">
                                        <div className="w-12 h-6 bg-primary/30 rounded-full p-1 transition-colors">
                                            <div className="w-4 h-4 bg-white rounded-full translate-x-6"></div>
                                        </div>
                                    </label>
                                    <span className="text-sm font-semibold text-foreground/80">Nødvendige (Alltid på)</span>
                                </div>

                                {/* Statistics */}
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setPrefs(prev => ({ ...prev, statistics: !prev.statistics }))}
                                        className="relative inline-flex items-center"
                                    >
                                        <div className={`w-12 h-6 rounded-full p-1 transition-colors ${prefs.statistics ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${prefs.statistics ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                        </div>
                                    </button>
                                    <span className="text-sm font-semibold text-foreground/80">Statistikk</span>
                                </div>

                                {/* Marketing */}
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setPrefs(prev => ({ ...prev, marketing: !prev.marketing }))}
                                        className="relative inline-flex items-center"
                                    >
                                        <div className={`w-12 h-6 rounded-full p-1 transition-colors ${prefs.marketing ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${prefs.marketing ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                        </div>
                                    </button>
                                    <span className="text-sm font-semibold text-foreground/80">Markedsføring</span>
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                                onClick={handleAcceptAll}
                                className="bg-primary hover:opacity-90 text-primary-foreground font-bold py-4 px-6 rounded-[12px] transition-all shadow-md active:scale-[0.98]"
                            >
                                Tillat alle
                            </button>
                            <button
                                onClick={handleAcceptSelected}
                                className="border-2 border-primary text-primary hover:bg-primary/5 font-bold py-4 px-6 rounded-[12px] transition-all active:scale-[0.98]"
                            >
                                Tillat utvalgte
                            </button>
                            <button
                                onClick={handleDeclineAll}
                                className="bg-muted hover:bg-muted/80 text-muted-foreground font-bold py-4 px-6 rounded-[12px] transition-all active:scale-[0.98]"
                            >
                                Avvis alle
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CookieConsent;
