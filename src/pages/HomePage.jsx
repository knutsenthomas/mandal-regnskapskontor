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

const HomePage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
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
