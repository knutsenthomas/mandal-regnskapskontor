import React, { useEffect, useState } from 'react';
import { Loader } from '@/components/ui/loader';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';

const Hero = () => {
  const [settings, setSettings] = useState({
    hero_image: 'https://images.unsplash.com/photo-1697638164340-6c5fc558bdf2',
    primary_color: '#1B4965',
    hero_title: 'Mandal Regnskapskontor AS',
    hero_lines: [
      'Regnskap, Fakturering, Lønn, Revisjon, Skatt',
      'Samt operativ lederstøtte'
    ]
  });
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Hvis bildet allerede er cached, sørg for at imageLoaded blir true
  useEffect(() => {
    if (settings.hero_image) {
      const img = new window.Image();
      img.src = settings.hero_image;
      if (img.complete) setImageLoaded(true);
    }
  }, [settings.hero_image]);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('content')
        .select('hero_image, primary_color, hero_title, hero_lines')
        .single();

      if (data) {
        setSettings(prev => ({
          ...prev,
          hero_image: data.hero_image || prev.hero_image,
          primary_color: data.primary_color || prev.primary_color,
          hero_title: data.hero_title || prev.hero_title,
          hero_lines: Array.isArray(data.hero_lines) && data.hero_lines.length > 0 ? data.hero_lines : prev.hero_lines
        }));
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  // Vis loader kun til data er lastet, ikke til bilde er ferdig
  const showLoader = loading;

  const scrollToContact = () => {
    const contactSection = document.getElementById('kontakt');
    if (contactSection) {
      const headerOffset = window.innerWidth < 1024 ? 20 : 100;
      const elementPosition = contactSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  if (showLoader) {
    return (
      <section
        className="relative w-full flex items-center justify-center overflow-hidden bg-[#0F3347]"
        style={{ minHeight: '100vh', height: '100dvh' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F3347]/95 via-[#1B4965]/90 to-[#2A6F97]/85"></div>
        <Loader text="Laster forsiden..." />
      </section>
    );
  }

  return (
    <section
      className="relative w-full flex items-center justify-center overflow-hidden bg-[#0F3347]"
      style={{ minHeight: '100vh', height: '100dvh' }}
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={settings.hero_image}
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
            {settings.hero_title}
          </h1>

          {settings.hero_lines && settings.hero_lines.map((line, idx) => (
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
              onClick={scrollToContact}
              size="lg"
              style={{ backgroundColor: settings.primary_color }}
              className="text-white px-10 py-7 text-lg rounded-full shadow-xl hover:scale-105 transition-transform hover:brightness-90 border-2 border-white/30"
            >
              Kontakt oss
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;