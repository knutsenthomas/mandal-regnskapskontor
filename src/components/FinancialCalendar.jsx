import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle, ChevronLeft, ChevronRight, Loader2, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import ICAL from 'ical.js';
import { supabase } from '@/lib/customSupabaseClient';

// --- SYSTEM DEADLINES (Moms, Skatt, etc.) ---
const systemDeadlines = [
    { month: 0, date: "15.01", task: "Betaling av forskuddstrekk og arbeidsgiveravgift (6. termin)", type: "payroll" },
    { month: 0, date: "31.01", task: "Frist for Aksjonærregisteroppgaven", type: "report" },
    { month: 1, date: "01.02", task: "Sammenstillingsoppgave (lønn) til ansatte", type: "payroll" },
    { month: 1, date: "10.02", task: "Mva-melding (6. termin)", type: "vat" },
    { month: 1, date: "15.02", task: "Forskuddsskatt for aksjeselskap (1. termin)", type: "tax" },
    { month: 2, date: "10.03", task: "Mva-melding årstermin (omsetning < 1 mill)", type: "vat" },
    { month: 2, date: "15.03", task: "Betaling av forskuddstrekk og arbeidsgiveravgift (1. termin)", type: "payroll" },
    { month: 2, date: "15.03", task: "Forskuddsskatt ENK og privatpersoner (1. termin)", type: "tax" },
    { month: 3, date: "10.04", task: "Mva-melding (1. termin)", type: "vat" },
    { month: 3, date: "15.04", task: "Forskuddsskatt for aksjeselskap (2. termin)", type: "tax" },
    { month: 4, date: "15.05", task: "Betaling av forskuddstrekk og arbeidsgiveravgift (2. termin)", type: "payroll" },
    { month: 4, date: "31.05", task: "Levering av skattemelding for næringsdrivende", type: "report", highlight: true },
    { month: 5, date: "10.06", task: "Mva-melding (2. termin)", type: "vat" },
    { month: 5, date: "15.06", task: "Forskuddsskatt ENK og privatpersoner (2. termin)", type: "tax" },
    { month: 5, date: "30.06", task: "Frist for godkjenning av årsregnskap", type: "report" },
    { month: 6, date: "15.07", task: "Betaling av forskuddstrekk og arbeidsgiveravgift (3. termin)", type: "payroll" },
    { month: 6, date: "31.07", task: "Innlevering av årsregnskap til Brønnøysundregistrene", type: "report", highlight: true },
    { month: 7, date: "31.08", task: "Mva-melding (3. termin)", type: "vat" },
    { month: 8, date: "15.09", task: "Betaling av forskuddstrekk og arbeidsgiveravgift (4. termin)", type: "payroll" },
    { month: 8, date: "15.09", task: "Forskuddsskatt ENK og privatpersoner (3. termin)", type: "tax" },
    { month: 9, date: "10.10", task: "Mva-melding (4. termin)", type: "vat" },
    { month: 10, date: "15.11", task: "Betaling av forskuddstrekk og arbeidsgiveravgift (5. termin)", type: "payroll" },
    { month: 11, date: "10.12", task: "Mva-melding (5. termin)", type: "vat" },
    { month: 11, date: "15.12", task: "Forskuddsskatt ENK og privatpersoner (4. termin)", type: "tax" }
];

const monthNames = [
    "Januar", "Februar", "Mars", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Desember"
];

const FinancialCalendar = () => {
    // Start with current date
    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    // Initialize to current month
    const [currentIndex, setCurrentIndex] = useState(today.getMonth());
    const [direction, setDirection] = useState(0);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- DYNAMIC DEADLINE GENERATOR ---
    const getSystemDeadlines = (year) => {
        return [
            { month: 0, date: `15.01.${year}`, task: "Betaling av forskuddstrekk og arbeidsgiveravgift (6. termin)", type: "payroll" },
            { month: 0, date: `31.01.${year}`, task: "Frist for Aksjonærregisteroppgaven", type: "report" },
            { month: 1, date: `01.02.${year}`, task: "Sammenstillingsoppgave (lønn) til ansatte", type: "payroll" },
            { month: 1, date: `10.02.${year}`, task: "Mva-melding (6. termin)", type: "vat" },
            { month: 1, date: `15.02.${year}`, task: "Forskuddsskatt for aksjeselskap (1. termin)", type: "tax" },
            { month: 2, date: `10.03.${year}`, task: "Mva-melding årstermin (omsetning < 1 mill)", type: "vat" },
            { month: 2, date: `15.03.${year}`, task: "Betaling av forskuddstrekk og arbeidsgiveravgift (1. termin)", type: "payroll" },
            { month: 2, date: `15.03.${year}`, task: "Forskuddsskatt ENK og privatpersoner (1. termin)", type: "tax" },
            { month: 3, date: `10.04.${year}`, task: "Mva-melding (1. termin)", type: "vat" },
            { month: 3, date: `15.04.${year}`, task: "Forskuddsskatt for aksjeselskap (2. termin)", type: "tax" },
            { month: 4, date: `15.05.${year}`, task: "Betaling av forskuddstrekk og arbeidsgiveravgift (2. termin)", type: "payroll" },
            { month: 4, date: `31.05.${year}`, task: "Levering av skattemelding for næringsdrivende", type: "report", highlight: true },
            { month: 5, date: `10.06.${year}`, task: "Mva-melding (2. termin)", type: "vat" },
            { month: 5, date: `15.06.${year}`, task: "Forskuddsskatt ENK og privatpersoner (2. termin)", type: "tax" },
            { month: 5, date: `30.06.${year}`, task: "Frist for godkjenning av årsregnskap", type: "report" },
            { month: 6, date: `15.07.${year}`, task: "Betaling av forskuddstrekk og arbeidsgiveravgift (3. termin)", type: "payroll" },
            { month: 6, date: `31.07.${year}`, task: "Innlevering av årsregnskap til Brønnøysundregistrene", type: "report", highlight: true },
            { month: 7, date: `31.08.${year}`, task: "Mva-melding (3. termin)", type: "vat" },
            { month: 8, date: `15.09.${year}`, task: "Betaling av forskuddstrekk og arbeidsgiveravgift (4. termin)", type: "payroll" },
            { month: 8, date: `15.09.${year}`, task: "Forskuddsskatt ENK og privatpersoner (3. termin)", type: "tax" },
            { month: 9, date: `10.10.${year}`, task: "Mva-melding (4. termin)", type: "vat" },
            { month: 10, date: `15.11.${year}`, task: "Betaling av forskuddstrekk og arbeidsgiveravgift (5. termin)", type: "payroll" },
            { month: 11, date: `10.12.${year}`, task: "Mva-melding (5. termin)", type: "vat" },
            { month: 11, date: `15.12.${year}`, task: "Forskuddsskatt ENK og privatpersoner (4. termin)", type: "tax" }
        ];
    };

    // Fetch all data
    useEffect(() => {
        const loadCalendarData = async () => {
            try {
                setLoading(true);
                // Generate deadlines for current year AND next year to be safe?
                // For simplicity, just current year. If user navigates year, we'd need more logic.
                // Keeping it simple: Show deadlines for the year of the CURRENTLY DISPLAYED month.
                // But efficient react way: Regenerate when currentYear changes.

                let allEvents = getSystemDeadlines(currentYear);

                // 1. Fetch Manual Events
                const { data: manualData } = await supabase
                    .from('calendar_events')
                    .select('*');

                if (manualData) {
                    const formattedManual = manualData.map(ev => {
                        const dateObj = new Date(ev.date);
                        // Only include if matches current year logic? 
                        // Actually, 'calendar_events' has full dates, so we just filter later.
                        return {
                            year: dateObj.getFullYear(),
                            month: dateObj.getMonth(), // 0-11
                            date: dateObj.toLocaleDateString('no-NO', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                            task: ev.title,
                            type: 'manual',
                            highlight: false
                        };
                    });
                    allEvents = [...allEvents, ...formattedManual];
                }

                // 2. Fetch iCal Feed
                const { data: settingsData } = await supabase
                    .from('site_settings')
                    .select('value')
                    .eq('key', 'ical_feed_url')
                    .single();

                if (settingsData && settingsData.value) {
                    try {
                        const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(settingsData.value);
                        const response = await fetch(proxyUrl);
                        const icalData = await response.text();

                        if (icalData) {
                            const jcalData = ICAL.parse(icalData);
                            const comp = new ICAL.Component(jcalData);
                            const vevents = comp.getAllSubcomponents('vevent');

                            const externalEvents = vevents.map(ve => {
                                const event = new ICAL.Event(ve);
                                const dateObj = event.startDate.toJSDate();
                                return {
                                    year: dateObj.getFullYear(),
                                    month: dateObj.getMonth(),
                                    date: dateObj.toLocaleDateString('no-NO', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                                    task: event.summary,
                                    type: 'external'
                                };
                            });
                            allEvents = [...allEvents, ...externalEvents];
                        }
                    } catch (err) {
                        console.warn("Failed to fetch/parse iCal feed:", err);
                    }
                }

                setEvents(allEvents);

            } catch (error) {
                console.error("Calendar sync error:", error);
            } finally {
                setLoading(false);
            }
        };

        loadCalendarData();
    }, [currentYear]); // Refresh if year changes (though we only change Month index mostly)

    const nextMonth = () => {
        setDirection(1);
        setCurrentIndex((prev) => {
            const next = prev + 1;
            if (next > 11) {
                setCurrentYear(y => y + 1);
                return 0;
            }
            return next;
        });
    };

    const prevMonth = () => {
        setDirection(-1);
        setCurrentIndex((prev) => {
            const next = prev - 1;
            if (next < 0) {
                setCurrentYear(y => y - 1);
                return 11;
            }
            return next;
        });
    };

    // Filter events based on month index (and ideally year matches too, but systemDeadlines are currentYear based)
    const currentMonthEvents = events
        .filter(e => {
            // Check month match
            if (e.month !== currentIndex) return false;

            // For system deadlines, they don't have 'year' prop explicitly in my array above, so I parse date or trust generation
            // Actually, I added full date string to system deadlines.
            // Let's rely on simple month match for now, assuming system deadlines are rebuilt for currentYear.
            // But if we have mixed years events, we must check year.

            // Safe parsing:
            const eventYear = e.year || parseInt(e.date.split('.')[2]) || currentYear;
            return eventYear === currentYear;
        })
        .sort((a, b) => {
            // Sort by day DD.MM.YYYY
            const dayA = parseInt(a.date.split('.')[0]);
            const dayB = parseInt(b.date.split('.')[0]);
            return dayA - dayB;
        });

    const variants = {
        enter: (direction) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (direction) => ({ x: direction > 0 ? -50 : 50, opacity: 0 }),
    };

    return (
        <section className="py-20 bg-slate-50">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center justify-center p-2 bg-[#1B4965]/10 rounded-full mb-4">
                        <Calendar className="w-5 h-5 text-[#1B4965] mr-2" />
                        <span className="text-[#1B4965] font-medium">Viktige datoer</span>
                    </div>
                    <h2 className="text-4xl font-bold text-[#1B4965] mb-4">Økonomisk Kalender</h2>
                    <p className="text-xl text-gray-600">
                        Hold oversikt over de viktigste fristene. Vi henter automatisk inn offentlige frister slik at du alltid er oppdatert.
                    </p>
                </div>

                {/* Main Card */}
                <Card className="border-none shadow-2xl bg-white overflow-hidden max-w-5xl mx-auto rounded-3xl">
                    <div className="grid lg:grid-cols-5">

                        {/* Right Side: Image Panel (Visible on Desktop) - MOVED FIRST in DOM for Mobile? No, layout logic. 
                            Let's keep standard reading order: Content Left, Image Right using order-last on desktop.
                        */}
                        <div className="lg:col-span-2 bg-[#1B4965] relative overflow-hidden order-first lg:order-last min-h-[200px] lg:min-h-full">
                            <img
                                src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1000"
                                alt="Financial planning"
                                className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
                            />
                            <div className="absolute inset-0 bg-gradient-to-br from-[#1B4965] to-[#0F3347] opacity-90"></div>

                            <div className="relative z-10 p-8 h-full flex flex-col justify-between text-white">
                                <div>
                                    <h3 className="text-2xl font-bold mb-2">Trenger du hjelp med fristene?</h3>
                                    <p className="text-blue-100 mb-6">Vi passer på at du leverer i tide, hver gang.</p>
                                </div>
                                <Button
                                    className="bg-white text-[#1B4965] hover:bg-blue-50 border-none w-full"
                                    onClick={() => document.getElementById('kontakt')?.scrollIntoView({ behavior: 'smooth' })}
                                >
                                    Få hjelp av oss
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </div>

                        {/* Left Side: Calendar Content */}
                        <div className="lg:col-span-3 p-6 md:p-10 relative">
                            {/* Navigation Buttons floating over content top right? Or standard header. */}
                            <div className="flex items-center justify-between mb-8">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={prevMonth}
                                    className="rounded-full shadow-sm hover:bg-gray-50 h-10 w-10 border-gray-200"
                                >
                                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                                </Button>

                                <div className="text-center">
                                    <h3 className="text-2xl font-bold text-[#1B4965]">
                                        {monthNames[currentIndex]}
                                    </h3>
                                    <span className="text-sm font-medium text-gray-400">
                                        {currentYear}
                                    </span>
                                </div>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={nextMonth}
                                    className="rounded-full shadow-sm hover:bg-gray-50 h-10 w-10 border-gray-200"
                                >
                                    <ChevronRight className="h-5 w-5 text-gray-600" />
                                </Button>
                            </div>

                            <div className="min-h-[300px]">
                                <AnimatePresence initial={false} custom={direction} mode="wait">
                                    <motion.div
                                        key={`${currentYear}-${currentIndex}`}
                                        custom={direction}
                                        variants={variants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{
                                            x: { type: "spring", stiffness: 300, damping: 30 },
                                            opacity: { duration: 0.2 }
                                        }}
                                        className="w-full space-y-4"
                                    >
                                        {loading ? (
                                            <div className="flex justify-center py-10">
                                                <Loader2 className="w-8 h-8 animate-spin text-[#1B4965]" />
                                            </div>
                                        ) : currentMonthEvents.length > 0 ? (
                                            currentMonthEvents.map((item, idx) => (
                                                <div key={idx} className={`relative flex items-center p-4 rounded-xl transition-all border ${item.highlight ? 'bg-amber-50 border-amber-200 shadow-sm' : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'}`}>
                                                    <div className="flex-shrink-0 w-14 text-center mr-4">
                                                        <span className="block text-xl font-bold text-[#62B6CB] leading-none">
                                                            {item.date.split('.')[0]}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mt-1">dag</span>
                                                    </div>

                                                    <div className="flex-grow border-l border-gray-100 pl-4 py-1">
                                                        <div className="flex justify-between items-start gap-2">
                                                            <p className={`text-sm font-medium leading-snug ${item.highlight ? 'text-gray-900' : 'text-gray-600'}`}>
                                                                {item.task}
                                                            </p>
                                                            {item.type === 'external' && <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded whitespace-nowrap">Ext</span>}
                                                        </div>

                                                        {item.highlight && (
                                                            <div className="flex items-center mt-1.5 text-xs text-amber-700 font-bold uppercase tracking-wider">
                                                                <AlertCircle className="w-3 h-3 mr-1.5" />
                                                                Viktig frist
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-12">
                                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 mb-3">
                                                    <Calendar className="w-6 h-6 text-gray-400" />
                                                </div>
                                                <p className="text-gray-500 font-medium">Ingen hendelser denne måneden.</p>
                                                <p className="text-sm text-gray-400 mt-1">Nyt tiden!</p>
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="mt-8 text-center">
                    <p className="text-gray-500 text-sm">
                        * Datoer oppdateres automatisk. Ta forbehold om lokale endringer.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default FinancialCalendar;
