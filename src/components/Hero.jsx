import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';

const Hero = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [bgImage, setBgImage] = useState('/hero-bg.jpg'); // Standard bilde (lokalt)
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const fetchHeroContent = async () => {
      const { data } = await supabase
        .from('content')
        .select('hero_title, hero_subtitle, hero_image')
        .single();

      if (data) {
        setContent(data);
        // Hvis admin har lastet opp et bilde, bruk det. Ellers bruk standard.
        if (data.hero_image) {
          setBgImage(data.hero_image);
        }
      }
    };
    fetchHeroContent();
  }, []);

  return (
    <section id="hjem" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden min-h-screen flex items-center">

      {/* BAKGRUNNSBILDE - Nå dynamisk */}
      <div className="absolute inset-0 z-0">
        <img
          src={bgImage}
          alt="Office background"
          className={`w-full h-full object-cover transition-opacity duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
        />
        {/* Mørkt filter over bildet for å gjøre tekst lesbar */}
        <div className={`absolute inset-0 bg-[#1B4965]/95 mix-blend-multiply transition-opacity duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`} />
      </div>

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center transition-opacity duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}>

        <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
          {content?.hero_title || "Mandal Regnskapskontor AS"}
        </h1>

        <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
          {content?.hero_subtitle || "Din partner for profesjonell regnskap og finansiell rådgivning."}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={() => {
              const element = document.getElementById('kontakt');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }}
            size="lg"
            className="bg-white text-[#1B4965] hover:bg-gray-100 border-2 border-white px-8 py-6 text-lg rounded-full font-bold shadow-lg transition-transform hover:scale-105"
          >
            Kontakt oss <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;