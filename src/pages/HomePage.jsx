import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { motion } from 'framer-motion';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import About from '@/components/About';
import FinancialCalendar from '@/components/FinancialCalendar';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';

import { useSite } from '@/contexts/SiteContext';
import { useContent } from '@/contexts/ContentContext';
import { Loader2 } from 'lucide-react';

const HomePage = () => {
  const location = useLocation();
  const { loading: siteLoading } = useSite();
  const { loading: contentLoading } = useContent();

  // Her har vi fjernet 'forceShow'-timeren. 
  // Nå venter den ALLTID trygt på at databasen din skal levere det ekte innholdet.
  const isLoading = siteLoading || contentLoading;

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const scrollTimer = setTimeout(() => {
      const rawHash = location.hash?.replace(/^#/, '');
      
      if (!rawHash) {
        window.scrollTo({ top: 0, behavior: 'instant' });
        return;
      }

      const element = document.getElementById(rawHash);
      if (element) {
        const headerOffset = 90;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    }, 100);

    return () => clearTimeout(scrollTimer);
  }, [isLoading, location.hash]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-[9999]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-primary font-medium tracking-widest uppercase text-xs">Henter innhold...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Navigation />
      
      <Helmet>
        <title>Mandal regnskapskontor - Profesjonell Regnskap og Finansiell Rådgivning</title>
        <meta
          name="description"
          content="Din pålitelige partner for profesjonell regnskap, fakturering, lønn, revisjon og skatteplanlegging i Mandal. Over 15 års erfaring med små og mellomstore bedrifter."
        />
      </Helmet>

      <main className="min-h-screen">
        <div id="hjem">
          <Hero />
        </div>
        <div id="tjenester" className="scroll-mt-24">
          <Services />
        </div>
        <div id="om-oss" className="scroll-mt-24">
          <About />
        </div>
        <div id="kalender" className="scroll-mt-24">
          <FinancialCalendar />
        </div>
        <div id="kontakt" className="scroll-mt-24">
          <ContactForm />
        </div>
        <Footer />
      </main>
    </motion.div>
  );
};

export default HomePage;