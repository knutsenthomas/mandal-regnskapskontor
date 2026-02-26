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
  const { content: heroButtonUrl } = useContent('hero.buttonUrl');
  const { content: loc1Name } = useContent('hero.loc1Name');
  const { content: loc1Addr } = useContent('hero.loc1Addr');
  const { content: loc2Name } = useContent('hero.loc2Name');
  const { content: loc2Addr } = useContent('hero.loc2Addr');
  const { content: showLocations } = useContent('hero.showLocations');
  const { content: color } = useContent('hero.primaryColor');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const locationRef = React.useRef(null);

  // Close location info when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setSelectedLocation(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const resolvedHeroTitle = heroTitle || 'Regnskap på dine premisser';
  const resolvedHeroImage = heroImage || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=2000';
  const resolvedHeroLinesRaw = heroLinesRaw || '["Erfaring og kompetanse som sikrer din økonomi", "Personlig oppfølging og skreddersydde løsninger", "Fokus på digitalisering og effektivisering"]';

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

  const handleButtonClick = () => {
    const url = heroButtonUrl || '#kontakt';
    if (url.startsWith('#')) {
      document.getElementById(url.replace('#', ''))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.location.href = url;
    }
  };
  const heroOverlayMid = toOverlayColor(color, 0.88, 'hsl(var(--primary) / 0.88)');
  const heroOverlayEnd = toOverlayColor(color, 0.78, 'hsl(var(--primary) / 0.78)');

  const resolvedHeroButton = heroButton || 'Kontakt oss i dag';
  const hasHeroContent = Boolean(resolvedHeroTitle || resolvedHeroImage || heroLines.length > 0 || resolvedHeroButton);

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
          pb-20 landscape:pb-12
          pt-24 landscape:pt-32
          lg:pb-0 lg:pt-20
        `}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6 landscape:space-y-2"
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
              className="text-base sm:text-2xl md:text-3xl lg:text-5xl landscape:text-base sm:landscape:text-xl text-white/85 max-w-3xl mx-auto font-light"
              style={{ marginTop: idx === 0 ? '0.5em' : 0 }}
            >
              {line}
            </p>
          ))}

          <div className="pt-10 landscape:pt-4 flex flex-col items-center gap-6 landscape:gap-2">
            {resolvedHeroButton && (
              <Button
                onClick={handleButtonClick}
                size="lg"
                className="text-white px-10 py-7 text-lg rounded-full shadow-xl hover:scale-105 transition-transform hover:brightness-90 border-2 border-white/30 bg-primary hover:bg-primary/90 mb-8"
              >
                {resolvedHeroButton}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}

            {/* Location Section */}
            {showLocations === 'true' && (
              <div ref={locationRef} className="flex flex-col items-center">
                <div className="flex gap-4 mb-4">
                  {[
                    { id: 'loc1', name: loc1Name || 'Mandal', address: loc1Addr || 'Bryggegata 1, 4514 Mandal' },
                    { id: 'loc2', name: loc2Name || 'Grimstad', address: loc2Addr || 'Storgata 1, 4876 Grimstad' }
                  ].map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => setSelectedLocation(selectedLocation === loc.id ? null : loc.id)}
                      className={`
                        flex items-center gap-2 px-6 py-2 rounded-full border-2 transition-all font-medium
                        ${selectedLocation === loc.id
                          ? 'bg-white text-primary border-white'
                          : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}
                      `}
                    >
                      <span className={`w-2 h-2 rounded-full ${selectedLocation === loc.id ? 'bg-primary' : 'bg-green-400'}`}></span>
                      {loc.name}
                    </button>
                  ))}
                </div>

                <motion.div
                  initial={false}
                  animate={{ height: selectedLocation ? 'auto' : 0, opacity: selectedLocation ? 1 : 0 }}
                  className="overflow-hidden"
                >
                  {selectedLocation && (
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-white flex items-center gap-3 shadow-lg">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-white rotate-90" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold uppercase tracking-wider text-white/60">Adresse {selectedLocation === 'loc1' ? (loc1Name || 'Mandal') : (loc2Name || 'Grimstad')}</p>
                        <p className="font-medium">
                          {selectedLocation === 'loc1' ? (loc1Addr || 'Bryggegata 1, 4514 Mandal') : (loc2Addr || 'Storgata 1, 4876 Grimstad')}
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
