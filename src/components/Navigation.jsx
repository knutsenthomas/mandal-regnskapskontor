import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Menu, X, Phone, Mail, MapPin } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '@/components/Logo';
import { cn } from '@/lib/utils';
import { useContent } from '@/contexts/ContentContext';

const stripHtml = (value) => String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const toTelHref = (value) => {
  const cleaned = stripHtml(value).replace(/[^\d+]/g, '');
  return cleaned ? `tel:${cleaned}` : 'tel:+4791759855';
};

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [viewportFrame, setViewportFrame] = useState({
    top: 0,
    left: 0,
    width: null,
    height: null,
  });
  const navigate = useNavigate();
  const location = useLocation();
  const safeAreaTop = 'env(safe-area-inset-top, 0px)';
  const { content: footerPhone } = useContent('footer.phone');
  const { content: footerEmail } = useContent('footer.email');
  const { content: footerAddress } = useContent('footer.address');

  const isHome = location.pathname === '/' || location.pathname === '';
  const isTransparent = isHome && !scrolled;
  const mobilePhone = stripHtml(footerPhone) || '91 75 98 55';
  const mobileEmail = stripHtml(footerEmail) || 'jan@mandalregnskapskontor.no';
  const mobileAddress = stripHtml(footerAddress) || 'Bryggegata 1, 4514 Mandal';

  // Håndter scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    handleScroll(); // Check immediately on mount
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

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) {
      return undefined;
    }

    const viewport = window.visualViewport;
    let rafId = null;

    const applyViewportFrame = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
        const nextFrame = {
          top: Math.max(0, Math.round(viewport.offsetTop || 0)),
          left: Math.max(0, Math.round(viewport.offsetLeft || 0)),
          width: Math.round(viewport.width || window.innerWidth),
          height: Math.round(viewport.height || window.innerHeight),
        };

        setViewportFrame((prev) => (
          prev.top === nextFrame.top &&
            prev.left === nextFrame.left &&
            prev.width === nextFrame.width &&
            prev.height === nextFrame.height
            ? prev
            : nextFrame
        ));
      });
    };

    applyViewportFrame();
    viewport.addEventListener('resize', applyViewportFrame);
    viewport.addEventListener('scroll', applyViewportFrame);
    window.addEventListener('orientationchange', applyViewportFrame);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      viewport.removeEventListener('resize', applyViewportFrame);
      viewport.removeEventListener('scroll', applyViewportFrame);
      window.removeEventListener('orientationchange', applyViewportFrame);
    };
  }, []);

  // Hide navigation on admin pages only
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const handleLogoClick = () => {
    setIsOpen(false);
    if (isHome) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const handleLinkClick = (id) => {
    setIsOpen(false);
    if (!isHome) {
      navigate(`/#${id}`);
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

  const primaryColor = 'hsl(var(--primary))';
  const primaryForeground = 'hsl(var(--primary-foreground))';
  const fixedViewportStyle = {
    top: `${viewportFrame.top}px`,
    left: `${viewportFrame.left}px`,
    width: viewportFrame.width ? `${viewportFrame.width}px` : '100%',
  };

  return (
    <>
      {/* --- HEADER --- */}
      <header
        className={cn(
          "fixed z-50 overflow-x-hidden transition-colors duration-300",
          isTransparent ? "bg-transparent" : "bg-background shadow-sm"
        )}
        style={{ ...fixedViewportStyle, paddingTop: safeAreaTop }}
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* LOGO CONTAINER 
               VIKTIG: Vi setter en fast bredde (w-[180px]) for å hindre at headeren
               "hopper" hvis den mørke/lyse logoen har ulik størrelse.
            */}
            <div
              onClick={handleLogoClick}
              className={cn(
                "cursor-pointer flex items-center h-full min-w-0 flex-1 max-w-[calc(100%-3.5rem)] transition-opacity duration-200",
                "sm:max-w-[320px] lg:max-w-none lg:flex-none lg:w-[430px] xl:w-[500px]",
                isOpen ? 'opacity-0' : 'opacity-100'
              )}
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
                    : 'hover:opacity-80'
                    }`}
                  style={!isTransparent ? { color: primaryColor } : undefined}
                >
                  {item.replace('-', ' ')}
                </button>
              ))}
              <Button
                onClick={() => handleLinkClick('kontakt')}
                className={`font-bold rounded-full whitespace-nowrap transition-all duration-300 ${isTransparent
                  ? 'bg-white hover:bg-gray-100'
                  : 'text-white hover:brightness-90'
                  }`}
                style={isTransparent ? { color: primaryColor } : { backgroundColor: primaryColor, color: primaryForeground }}
              >
                KONTAKT OSS
              </Button>
            </nav>

            {/* Hamburger (Mobil) */}
            <div className={`lg:hidden shrink-0 ml-2 ${isOpen ? 'hidden' : 'block'}`}>
              <button
                onClick={() => setIsOpen(true)}
                className={`flex items-center justify-center p-2 transition-colors duration-300 focus:outline-none ${isTransparent ? 'text-white' : ''
                  }`}
                style={!isTransparent ? { color: primaryColor } : undefined}
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
            className="fixed z-[100] flex flex-col w-full"
            style={{
              ...fixedViewportStyle,
              height: viewportFrame.height ? `${viewportFrame.height}px` : '100dvh',
              backgroundColor: primaryColor,
              paddingTop: safeAreaTop,
            }}
          >
            {/* Topp-bar meny */}
            <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-20 flex-shrink-0 w-full">
              <div
                onClick={handleLogoClick}
                className="cursor-pointer min-w-0 flex-1 max-w-[calc(100%-3.5rem)] sm:max-w-[320px] lg:max-w-none lg:w-[430px] xl:w-[500px]"
              >
                <Logo color="light" isMobileMenu={true} />
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center p-2 text-white hover:text-white/75 transition-colors focus:outline-none shrink-0 ml-2"
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
                  className="text-4xl md:text-5xl font-bold capitalize text-white hover:text-white/75 transition-colors tracking-tight text-center"
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
                <a href={`mailto:${mobileEmail}`} className="flex items-center gap-3 hover:text-white transition-colors group">
                  <Mail size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="text-sm md:text-base font-medium">{mobileEmail}</span>
                </a>

                <a href={toTelHref(mobilePhone)} className="flex items-center gap-3 hover:text-white transition-colors group">
                  <Phone size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="text-sm md:text-base font-medium">{mobilePhone}</span>
                </a>

                <div className="flex items-center gap-3">
                  <MapPin size={20} />
                  <span className="text-sm md:text-base font-medium">{mobileAddress}</span>
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
