
import React from 'react';
import { Helmet } from 'react-helmet';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import About from '@/components/About';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';

const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>Mandal regnskapskontor AS - Profesjonell Regnskap og Finansiell Rådgivning</title>
        <meta 
          name="description" 
          content="Din pålitelige partner for profesjonell regnskap, fakturering, lønn, revisjon og skatteplanlegging i Mandal. Over 15 års erfaring med små og mellomstore bedrifter." 
        />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50">
        <div id="hjem">
          <Hero />
        </div>
        <div id="tjenester">
          <Services />
        </div>
        <div id="om-oss">
          <About />
        </div>
        <div id="kontakt">
          <ContactForm />
        </div>
        <Footer />
      </div>
    </>
  );
};

export default HomePage;
