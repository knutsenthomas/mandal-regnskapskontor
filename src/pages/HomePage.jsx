
import React, { useState, useEffect } from 'react';
import { Loader } from '@/components/ui/loader';
import { Helmet } from 'react-helmet';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import About from '@/components/About';
import FinancialCalendar from '@/components/FinancialCalendar';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';

const HomePage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulerer lasting, evt. vent på nødvendige data
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Loader text="Laster forsiden..." />;
  }

  return (
    <>
      <Helmet>
        <title>Mandal regnskapskontor AS - Profesjonell Regnskap og Finansiell Rådgivning</title>
        <meta
          name="description"
          content="Din pålitelige partner for profesjonell regnskap, fakturering, lønn, revisjon og skatteplanlegging i Mandal. Over 15 års erfaring med små og mellomstore bedrifter."
        />
      </Helmet>

      <div className="min-h-screen">
        {!loading && (
          <div id="hjem">
            <Hero />
          </div>
        )}
        {!loading && (
          <div id="tjenester" className="scroll-mt-16">
            <Services />
          </div>
        )}
        {!loading && (
          <div id="om-oss" className="scroll-mt-16">
            <About />
          </div>
        )}
        {!loading && (
          <div id="kalender" className="scroll-mt-16">
            <FinancialCalendar />
          </div>
        )}
        {!loading && (
          <div id="kontakt" className="scroll-mt-16">
            <ContactForm />
          </div>
        )}
        {!loading && <Footer />}
      </div>
    </>
  );
};

export default HomePage;
