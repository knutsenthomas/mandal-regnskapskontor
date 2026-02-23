import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useContent } from '@/contexts/ContentContext';

const Hero = () => {
  const { content: heroTitle, loading: contentLoading } = useContent('hero.title');
  const { content: heroLinesRaw } = useContent('hero.lines');
  const { content: heroImage } = useContent('hero.image');
  const { content: heroButton } = useContent('hero.button');
  const { content: color } = useContent('hero.primaryColor');
  const [imageLoaded, setImageLoaded] = useState(false);
  const resolvedHeroTitle = heroTitle || '';
  const resolvedHeroImage = heroImage || '';
  const resolvedHeroLinesRaw = heroLinesRaw || '';

  let heroLines = [];
  if (Array.isArray(resolvedHeroLinesRaw)) {
    heroLines = resolvedHeroLinesRaw;
  } else if (typeof resolvedHeroLinesRaw === 'string') {
    const raw = resolvedHeroLinesRaw.trim();
    if (raw.startsWith('[') && raw.endsWith(']')) {
      try {
        const parsed = JSON.parse(raw);
        heroLines = Array.isArray(parsed) ? parsed.filter(Boolean) : [];
      } catch {
        heroLines = raw.split('\n').map((line) => line.trim()).filter(Boolean);
      }
    } else {
      heroLines = raw.split('\n').map((line) => line.trim()).filter(Boolean);
    }
  }

  const scrollToContact = () => {
    document.getElementById('kontakt')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const hasHeroContent = Boolean(resolvedHeroTitle || resolvedHeroImage || heroLines.length > 0 || heroButton);

  if (contentLoading) {
    return null;
  }

  if (!hasHeroContent) {
    return null;
  }

  return (
    <section
      className="relative w-full flex items-center justify-center overflow-hidden bg-primary"
      style={{ minHeight: '100vh', height: '100dvh' }}
    >
      <div className="absolute inset-0 z-0">
        {resolvedHeroImage && (
          <img
            src={resolvedHeroImage}
            alt="Regnskapskontor"
            className="w-full h-full object-cover object-center transition-opacity duration-700"
            onLoad={() => setImageLoaded(true)}
            style={{ opacity: imageLoaded ? 1 : 0 }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/90 to-primary/80" />
      </div>

      <div
        className={`
          relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
          flex flex-col items-center justify-center h-full text-center
          pb-20
          pt-20
          landscape:pt-32
          lg:pb-0 lg:pt-20
        `}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          {resolvedHeroTitle && (
            <h1
              className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight mx-auto max-w-4xl lg:max-w-none"
              style={{ textWrap: 'balance' }}
            >
              {resolvedHeroTitle}
            </h1>
          )}

          {heroLines.map((line, idx) => (
            <p
              key={idx}
              className="text-xl sm:text-2xl text-slate-100 max-w-3xl mx-auto font-light"
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
                style={{ backgroundColor: color || 'hsl(var(--primary))' }}
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
  );
};

export default Hero;
