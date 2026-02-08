import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Menu, X, Phone, Mail, MapPin } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '@/components/Logo';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/' || location.pathname === '';
  const isTransparent = isHome && !scrolled;

  // HIDE NAVIGATION ON ADMIN PAGES
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  // Håndter scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Håndter scrolling når menyen er åpen
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  const handleLogoClick = () => {
    setIsOpen(false);
    if (isHome) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
      window.scrollTo(0, 0);
    }
  };

  const handleLinkClick = (id) => {
    setIsOpen(false);
    if (!isHome) {
      navigate('/');
      setTimeout(() => scrollToSection(id), 100);
    } else {
      scrollToSection(id);
    }
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 65;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  return (
    <>
      {/* --- GLOBAL CSS FIX ---
         Dette hindrer nettsiden i å skli sideveis på mobil.
         Vi legger det direkte her for å være sikre på at det kjører.
      */}
      <style>{`
        html, body {
          overflow-x: hidden;
          width: 100%;
          position: relative;
        }
      `}</style>

      {/* --- HEADER --- */}
      <header className="fixed top-0 left-0 w-full h-20 z-50">

        {/* Bakgrunns-lag (Fade effekt) */}
        <div
          className={`absolute inset-0 bg-white transition-opacity duration-300 ease-in-out ${isTransparent ? 'opacity-0' : 'opacity-100 shadow-sm'
            }`}
        />

        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-full">

            {/* LOGO CONTAINER 
               VIKTIG: Vi setter en fast bredde (w-[180px]) for å hindre at headeren
               "hopper" hvis den mørke/lyse logoen har ulik størrelse.
            */}
            <div
              onClick={handleLogoClick}
              className={`cursor-pointer flex items-center h-full w-[180px] transition-opacity duration-200 ${isOpen ? 'opacity-0' : 'opacity-100'}`}
            >
              <Logo color={isTransparent ? 'light' : 'dark'} />
            </div>

            {/* Desktop Menu */}
            <nav className={`hidden lg:flex items-center gap-8 ml-auto ${isOpen ? 'opacity-0' : 'opacity-100'}`}>
              {['hjem', 'tjenester', 'om-oss', 'kalender'].map((item) => (
                <button
                  key={item}
                  onClick={() => item === 'hjem' ? handleLogoClick() : handleLinkClick(item)}
                  className={`font-bold text-sm tracking-widest uppercase whitespace-nowrap transition-colors duration-300 ${isTransparent
                    ? 'text-white hover:text-gray-200'
                    : 'text-[#1B4965] hover:text-[#0F3347]'
                    }`}
                >
                  {item.replace('-', ' ')}
                </button>
              ))}
              <Button
                onClick={() => handleLinkClick('kontakt')}
                className={`font-bold rounded-full whitespace-nowrap transition-all duration-300 ${isTransparent
                  ? 'bg-white text-[#1B4965] hover:bg-gray-100'
                  : 'bg-[#1B4965] text-white hover:bg-[#0F3347]'
                  }`}
              >
                KONTAKT OSS
              </Button>
            </nav>

            {/* Hamburger (Mobil) */}
            <div className={`lg:hidden ${isOpen ? 'hidden' : 'block'}`}>
              <button
                onClick={() => setIsOpen(true)}
                className={`flex items-center justify-center p-2 transition-colors duration-300 focus:outline-none ${isTransparent ? 'text-white' : 'text-[#1B4965]'
                  }`}
              >
                <Menu size={32} />
              </button>
            </div>
          </div>
        </div>
      </header>


      {/* --- MENY OVERLAY --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            // 'fixed inset-0' + 'w-full' sikrer at menyen dekker alt og ikke flyter
            className="fixed inset-0 z-[100] bg-[#1B4965] flex flex-col w-full h-[100dvh]"
          >
            {/* Topp-bar meny */}
            <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-20 flex-shrink-0 w-full">
              <div onClick={handleLogoClick} className="cursor-pointer w-[180px]">
                <Logo color="light" />
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center p-2 text-white hover:text-blue-200 transition-colors focus:outline-none"
              >
                <X size={32} />
              </button>
            </div>

            {/* Lenker */}
            <div className="flex-1 flex flex-col items-center justify-center space-y-8 p-4 w-full overflow-y-auto">
              {['hjem', 'tjenester', 'om-oss', 'kalender', 'kontakt'].map((link, index) => (
                <motion.button
                  key={link}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + (index * 0.1), duration: 0.4 }}
                  onClick={() => link === 'hjem' ? handleLogoClick() : handleLinkClick(link)}
                  className="text-4xl md:text-5xl font-bold capitalize text-white hover:text-blue-200 transition-colors tracking-tight text-center"
                >
                  {link.replace('-', ' ')}
                </motion.button>
              ))}
            </div>

            {/* Kontaktinfo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="pb-12 pt-6 px-6 border-t border-white/10 flex-shrink-0 w-full"
            >
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 text-white/80">
                <a href="mailto:post@mandalregnskap.no" className="flex items-center gap-3 hover:text-white transition-colors group">
                  <Mail size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="text-sm md:text-base font-medium">post@mandalregnskap.no</span>
                </a>

                <a href="tel:+4712345678" className="flex items-center gap-3 hover:text-white transition-colors group">
                  <Phone size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="text-sm md:text-base font-medium">+47 12 34 56 78</span>
                </a>

                <div className="flex items-center gap-3">
                  <MapPin size={20} />
                  <span className="text-sm md:text-base font-medium">Mandal Sentrum</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;