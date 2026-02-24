import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useContent } from '@/contexts/ContentContext';
import { Shield, Lock, Eye, FileText, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet';

const containsHtml = (value) => {
    if (!value) return false;
    return /<[a-z][\s\S]*>/i.test(value) || value.includes('</');
};

const PrivacyPage = () => {
    const navigate = useNavigate();
    const { content: privacyTitle } = useContent('privacy.title');
    const { content: privacyText } = useContent('privacy.text');
    const { content: lastUpdated } = useContent('privacy.last_updated');

    const primaryColor = 'hsl(var(--primary))';
    const primaryForeground = 'hsl(var(--primary-foreground))';

    const defaultTitle = "Personvernerklæring";
    const defaultText = `
        <h3>1. Innledning</h3>
        <p>Mandal Regnskapskontor tar ditt personvern på alvor. Vi behandler dine personopplysninger i tråd med den til enhver tid gjeldende personvernlovgivning, herunder personopplysningsloven og personvernforordningen (GDPR).</p>

        <h3>2. Hvilke opplysninger vi samler inn</h3>
        <p>Vi kan samle inn opplysninger som du selv gir oss når du kontakter oss via kontaktskjema, e-post eller telefon. Dette inkluderer navn, e-postadresse, bedriftsnavn og telefonnummer.</p>

        <h3>3. Bruk av informasjonskapsler (cookies)</h3>
        <p>Vi bruker informasjonskapsler for å forbedre brukeropplevelsen på nettsiden, analysere trafikkmønstre og sikre at nettsiden fungerer optimalt. Du kan selv styre hvilke informasjonskapsler du tillater via vårt cookie-banner.</p>

        <h3>4. Formålet med behandlingen</h3>
        <p>Vi behandler dine personopplysninger for å kunne besvare henvendelser, levere våre tjenester og forbedre våre digitale løsninger.</p>

        <h3>5. Deling av opplysninger</h3>
        <p>Vi deler ikke dine personopplysninger med tredjeparter med mindre det er nødvendig for å levere våre tjenester eller vi er lovpålagt å gjøre det.</p>

        <h3>6. Dine rettigheter</h3>
        <p>Du har rett til innsyn i egne personopplysninger, samt rett til å kreve retting eller sletting av mangelfulle eller uriktige opplysninger.</p>
    `;

    const rights = [
        "Rett til innsyn i egne data",
        "Rett til å korrigere feil",
        "Rett til å bli glemt (sletting)",
        "Rett til å begrense behandling",
        "Rett til dataportabilitet"
    ];

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Helmet>
                <title>{privacyTitle || defaultTitle} - Mandal Regnskapskontor</title>
            </Helmet>

            <Navigation />

            {/* HERO SECTION */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-muted/40 z-0"></div>
                <div className="absolute top-0 right-0 w-1/3 h-full blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" style={{ backgroundColor: 'hsl(var(--primary) / 0.12)' }}></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-10"
                    >
                        <Button
                            onClick={() => navigate(-1)}
                            variant="ghost"
                            className="text-muted-foreground pl-0 group font-medium"
                            onMouseEnter={(e) => { e.currentTarget.style.color = primaryColor; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = ''; }}
                        >
                            <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                            Tilbake
                        </Button>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="lg:col-span-7"
                        >
                            <div className="w-16 h-16 bg-card rounded-2xl flex items-center justify-center mb-8 shadow-sm border border-border">
                                <Shield className="w-8 h-8" style={{ color: primaryColor }} />
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-4 tracking-tight leading-tight">
                                {privacyTitle || defaultTitle}
                            </h1>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-12">
                                <FileText className="w-4 h-4" />
                                Sist oppdatert: {lastUpdated || '24. februar 2026'}
                            </div>

                            <div className="prose prose-lg text-muted-foreground max-w-none mb-12 leading-relaxed">
                                {containsHtml(privacyText || defaultText) ? (
                                    <div
                                        className="font-light [&_h3]:text-foreground [&_h3]:font-bold [&_h3]:mt-8 [&_h3]:mb-4 [&_p]:mb-4"
                                        dangerouslySetInnerHTML={{ __html: privacyText || defaultText }}
                                    />
                                ) : (
                                    (privacyText || defaultText).split('\n').filter(Boolean).map((p, i) => (
                                        <p key={i} className="mb-6">{p}</p>
                                    ))
                                )}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="lg:col-span-5 lg:sticky lg:top-32 self-start"
                        >
                            <div className="bg-card text-card-foreground rounded-3xl p-8 md:p-10 shadow-xl border border-border">
                                <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-2">
                                    <span className="w-1.5 h-6 rounded-full inline-block" style={{ backgroundColor: primaryColor }}></span>
                                    Dine rettigheter
                                </h2>

                                <ul className="space-y-4 mb-10">
                                    {rights.map((right, idx) => (
                                        <li key={idx} className="flex items-center gap-3 text-muted-foreground">
                                            <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: primaryColor }} />
                                            <span>{right}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="grid grid-cols-2 gap-4 mt-8">
                                    <div className="p-4 bg-muted/50 rounded-2xl text-center">
                                        <Lock className="w-6 h-6 mx-auto mb-2" style={{ color: primaryColor }} />
                                        <p className="text-xs font-bold text-foreground">Sikkert</p>
                                    </div>
                                    <div className="p-4 bg-muted/50 rounded-2xl text-center">
                                        <Eye className="w-6 h-6 mx-auto mb-2" style={{ color: primaryColor }} />
                                        <p className="text-xs font-bold text-foreground">Transparent</p>
                                    </div>
                                </div>

                                <div className="mt-8 rounded-2xl p-8 text-white relative overflow-hidden group" style={{ backgroundColor: primaryColor }}>
                                    <h3 className="text-xl font-bold mb-3 relative z-10">Har du spørsmål?</h3>
                                    <p className="text-white/80 text-sm mb-6 relative z-10 opacity-90 leading-relaxed font-light">
                                        Kontakt oss om du lurer på hvordan vi behandler dine data.
                                    </p>
                                    <Button
                                        className="w-full bg-white text-primary hover:bg-gray-100 font-bold py-4 rounded-xl relative z-10"
                                        onClick={() => navigate('/#kontakt')}
                                    >
                                        Kontakt oss
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default PrivacyPage;
