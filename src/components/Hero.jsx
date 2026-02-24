import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useContent } from '@/contexts/ContentContext';

const HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const HSL_TOKEN_REGEX = /^\d+(?:\.\d+)?\s+\d+(?:\.\d+)?%\s+\d+(?:\.\d+)?%$/;

const hexToRgb = (hex) => {
  if (!HEX_COLOR_REGEX.test(hex)) return null;
  const normalized = hex.length === 4
    ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
    : hex;
  const value = normalized.slice(1);
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return { r, g, b };
};

const toOverlayColor = (value, alpha, fallback) => {
  if (typeof value !== 'string') return fallback;
  const raw = value.trim();
  if (!raw) return fallback;

  if (HEX_COLOR_REGEX.test(raw)) {
    const rgb = hexToRgb(raw);
    if (!rgb) return fallback;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  }

  if (HSL_TOKEN_REGEX.test(raw)) {
    return `hsl(${raw} / ${alpha})`;
  }

  return fallback;
};

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
  const heroOverlayMid = toOverlayColor(color, 0.88, 'hsl(var(--primary) / 0.88)');
  const heroOverlayEnd = toOverlayColor(color, 0.78, 'hsl(var(--primary) / 0.78)');

  const hasHeroContent = Boolean(resolvedHeroTitle || resolvedHeroImage || heroLines.length > 0 || heroButton);

  if (contentLoading) {
    return null;
  }

  if (!hasHeroContent) {
    return null;
  }

  return (
    <section
      id="hero-section"
      className="relative w-full flex items-center justify-center overflow-hidden bg-foreground"
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
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(90deg, hsl(var(--foreground) / 0.92), ${heroOverlayMid}, ${heroOverlayEnd})`,
          }}
        />
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
              className="text-xl sm:text-2xl text-white/85 max-w-3xl mx-auto font-light"
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
                className="text-white px-10 py-7 text-lg rounded-full shadow-xl hover:scale-105 transition-transform hover:brightness-90 border-2 border-white/30 bg-primary hover:bg-primary/90"
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
