import React, { useState } from 'react';
import { Loader } from '@/components/ui/loader';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useContent } from '@/contexts/ContentContext';

const Hero = () => {
  const { content: heroTitle } = useContent('hero.title');
  const { content: heroLinesRaw } = useContent('hero.lines');
  const { content: heroImage } = useContent('hero.image');
  const { content: heroButton } = useContent('hero.button');
  const { content: heroColor } = useContent('hero.primaryColor');
  const [imageLoaded, setImageLoaded] = useState(false);

  // Ingen fallback: vis kun hvis innhold finnes
  let heroLines = [];
  if (heroLinesRaw) {
    try {
      const arr = JSON.parse(heroLinesRaw);
      if (Array.isArray(arr) && arr.length > 0) heroLines = arr;
    } catch {
      heroLines = [heroLinesRaw];
    }
  }
  const color = heroColor || '#1B4965';

  const scrollToContact = () => {
    const contactSection = document.getElementById('kontakt');
    if (contactSection) {
      const headerOffset = window.innerWidth < 1024 ? 20 : 100;
      const elementPosition = contactSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  // Ingen loader, fallback vises alltid

  return (
    <section
      className="relative w-full flex items-center justify-center overflow-hidden bg-[#0F3347]"
      style={{ minHeight: '100vh', height: '100dvh' }}
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage || fallbackImage}
          alt="Regnskapskontor"
          className="w-full h-full object-cover object-center transition-opacity duration-700"
          onLoad={() => setImageLoaded(true)}
          style={{ opacity: imageLoaded ? 1 : 0 }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F3347]/95 via-[#1B4965]/90 to-[#2A6F97]/85"></div>
      </div>
      {/* Content */}
      <div className={`
        relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 
        flex flex-col items-center justify-center h-full text-center
        pb-20 
        pt-20               /* 1. Loddrett mobil: Normal avstand (som i stad) */
        landscape:pt-32     /* 2. Vannrett mobil: Ekstra avstand så den ikke treffer menyen */
        lg:pb-0 lg:pt-20    /* 3. PC: Normal avstand */
      `}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          {/* Tekststørrelse: 3xl på mobil, 5xl på tablet, 7xl på desktop */}

          <h1
            className="text-3xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight tracking-tight mx-auto max-w-4xl lg:max-w-none"
            style={{ textWrap: 'balance' }}
          >
            {heroTitle || fallbackTitle}
          </h1>

          {heroLines.map((line, idx) => (
            <p
              key={idx}
              className="text-xl sm:text-2xl text-blue-50 max-w-3xl mx-auto font-light"
              style={{ marginTop: idx === 0 ? '0.5em' : 0 }}
            >
              {line}
            </p>
          ))}

          <div className="pt-8">
            <Button
              {heroTitle && heroImage && heroLines.length > 0 && (
                <section
                  className="relative w-full flex items-center justify-center overflow-hidden bg-[#0F3347]"
                  style={{ minHeight: '100vh', height: '100dvh' }}
                >
                  {/* Background Image */}
                  <div className="absolute inset-0 z-0">
                    <img
                      src={heroImage}
                      alt="Regnskapskontor"
                      className="w-full h-full object-cover object-center transition-opacity duration-700"
                      onLoad={() => setImageLoaded(true)}
                      style={{ opacity: imageLoaded ? 1 : 0 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0F3347]/95 via-[#1B4965]/90 to-[#2A6F97]/85"></div>
                  </div>

                  {/* Content */}
                  <div className={`
                    relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 
                    flex flex-col items-center justify-center h-full text-center
                    pb-20 
                    pt-20               /* 1. Loddrett mobil: Normal avstand (som i stad) */
                    landscape:pt-32     /* 2. Vannrett mobil: Ekstra avstand så den ikke treffer menyen */
                    lg:pb-0 lg:pt-20    /* 3. PC: Normal avstand */
                  `}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8 }}
                      className="space-y-6"
                    >
                      <h1
                        className="text-3xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight tracking-tight mx-auto max-w-4xl lg:max-w-none"
                        style={{ textWrap: 'balance' }}
                      >
                        {heroTitle}
                      </h1>

                      {heroLines.map((line, idx) => (
                        <p
                          key={idx}
                          className="text-xl sm:text-2xl text-blue-50 max-w-3xl mx-auto font-light"
                          style={{ marginTop: idx === 0 ? '0.5em' : 0 }}
                        >
                          {line}
                        </p>
                      ))}

                      <div className="pt-8">
                        {heroButton && (
                          <Button
                            onClick={scrollToContact}
                            size="lg"
                            style={{ backgroundColor: color }}
                            className="text-white px-10 py-7 text-lg rounded-full shadow-xl hover:scale-105 transition-transform hover:brightness-90 border-2 border-white/30"
                          >
                            {heroButton}
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </section>
              )}
            );