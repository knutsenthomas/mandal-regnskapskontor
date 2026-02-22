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

  // Vis kun Hero hvis alle nødvendige data finnes
  if (!(heroTitle && heroImage && heroLines.length > 0)) {
    return null;
  }

  return (
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
  );

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