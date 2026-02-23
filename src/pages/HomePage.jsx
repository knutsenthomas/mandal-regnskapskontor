import React from 'react';
import { Helmet } from 'react-helmet';
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
  const { loading: siteLoading } = useSite();
  const { loading: contentLoading } = useContent();
  const isLoading = siteLoading || contentLoading;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[9999]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-10 h-10 animate-spin text-[#1B4965]" />
          <p className="text-[#1B4965] font-medium tracking-widest uppercase text-xs">Laster innhold...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <Navigation />
      <Helmet>
        <title>Mandal regnskapskontor AS - Profesjonell Regnskap og Finansiell Rådgivning</title>
        <meta
          name="description"
          content="Din pålitelige partner for profesjonell regnskap, fakturering, lønn, revisjon og skatteplanlegging i Mandal. Over 15 års erfaring med små og mellomstore bedrifter."
        />
      </Helmet>

      <div className="min-h-screen">
        <div id="hjem">
          <Hero />
        </div>
        <div id="tjenester" className="scroll-mt-16">
          <Services />
        </div>
        <div id="om-oss" className="scroll-mt-16">
          <About />
        </div>
        <div id="kalender" className="scroll-mt-16">
          <FinancialCalendar />
        </div>
        <div id="kontakt" className="scroll-mt-16">
          <ContactForm />
        </div>
        <Footer />
      </div>
    </motion.div>
  );
};


export default HomePage;
