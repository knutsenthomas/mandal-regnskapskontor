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
            <div className="fixed inset-x-0 bottom-0 z-[9999] flex items-end justify-center p-0 sm:p-4 pointer-events-none">
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    className="bg-white rounded-t-[24px] sm:rounded-[24px] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] max-w-[650px] w-full p-6 md:p-10 pointer-events-auto max-h-[95dvh] overflow-y-auto"
                >
                    <div className="flex flex-col">
                        <div className="flex items-start justify-between mb-2">
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
                                {/* Necessary */}
                                <div className="flex items-center justify-between sm:justify-start gap-3 px-2 py-1">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nødvendige</span>
                                    <div className="w-8 h-4 bg-primary/20 rounded-full p-0.5 ml-auto sm:ml-0">
                                        <div className="w-3 h-3 bg-white rounded-full translate-x-4"></div>
                                    </div>
                                </div>

                                {/* Statistics */}
                                <div className="flex items-center justify-between sm:justify-start gap-3 px-2 py-1">
                                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Statistikk</span>
                                    <button
                                        onClick={() => setPrefs(prev => ({ ...prev, statistics: !prev.statistics }))}
                                        className={`w-8 h-4 rounded-full p-0.5 transition-colors ml-auto sm:ml-0 ${prefs.statistics ? 'bg-primary' : 'bg-gray-300'}`}
                                    >
                                        <div className={`w-3 h-3 bg-white rounded-full transition-transform ${prefs.statistics ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                    </button>
                                </div>

                                {/* Marketing */}
                                <div className="flex items-center justify-between sm:justify-start gap-3 px-2 py-1">
                                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Markedsføring</span>
                                    <button
                                        onClick={() => setPrefs(prev => ({ ...prev, marketing: !prev.marketing }))}
                                        className={`w-8 h-4 rounded-full p-0.5 transition-colors ml-auto sm:ml-0 ${prefs.marketing ? 'bg-primary' : 'bg-gray-300'}`}
                                    >
                                        <div className={`w-3 h-3 bg-white rounded-full transition-transform ${prefs.marketing ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                    </button>
                                </div>
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
