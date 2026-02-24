import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Phone, Mail, MapPin, Lock } from 'lucide-react';
import { useContent } from '@/contexts/ContentContext';

const containsHtml = (value) => /<\/?[a-z][\s\S]*>/i.test(value || '');

const RichText = ({ value, className = '' }) => {
  if (!value) return null;
  if (containsHtml(value)) {
    return <div className={className} dangerouslySetInnerHTML={{ __html: value }} />;
  }
  return <div className={className}>{value}</div>;
};

const Footer = () => {
  const primaryColor = 'hsl(var(--primary))';
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const scrollToSection = (id) => {
    const targetId = id === 'home' ? 'hjem' : id;

    if (!isHome) {
      navigate(`/#${targetId}`);
    } else {
      const element = document.getElementById(targetId);
      if (element) {
        const headerOffset = 65;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }
    }
  };

  // Hent tekstinnhold fra content_blocks
  const { content: companyName } = useContent('footer.companyName');
  const { content: companyDesc } = useContent('footer.companyDesc');
  const { content: quicklinksLabel } = useContent('footer.quicklinksLabel');
  const { content: contactLabel } = useContent('footer.contactLabel');
  const { content: phone } = useContent('footer.phone');
  const { content: email } = useContent('footer.email');
  const { content: address } = useContent('footer.address');
  const { content: hoursLabel } = useContent('footer.hoursLabel');
  const { content: hoursWeek } = useContent('footer.hoursWeek');
  const { content: hoursWeekend } = useContent('footer.hoursWeekend');
  const { content: copyright } = useContent('footer.copyright');
  return (
    <footer className="bg-foreground text-background/75">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <p className="text-2xl font-bold text-background">{companyName || 'Mandal Regnskapskontor'}</p>
            <RichText
              className="text-sm leading-relaxed"
              value={companyDesc || 'Din pålitelige partner for profesjonell regnskap og finansiell rådgivning siden 2009.'}
            />
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-lg font-semibold text-background mb-4">{quicklinksLabel || 'Hurtiglenker'}</p>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollToSection('home')}
                  className="transition-colors duration-200 text-left hover:opacity-80"
                  style={{ '--hover-color': primaryColor }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = primaryColor; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = ''; }}
                >
                  {useContent('footer.link.home').content || 'Hjem'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('tjenester')}
                  className="transition-colors duration-200 text-left hover:opacity-80"
                  onMouseEnter={(e) => { e.currentTarget.style.color = primaryColor; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = ''; }}
                >
                  {useContent('footer.link.services').content || 'Tjenester'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('om-oss')}
                  className="transition-colors duration-200 text-left hover:opacity-80"
                  onMouseEnter={(e) => { e.currentTarget.style.color = primaryColor; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = ''; }}
                >
                  {useContent('footer.link.about').content || 'Om oss'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('kalender')}
                  className="transition-colors duration-200 text-left hover:opacity-80"
                  onMouseEnter={(e) => { e.currentTarget.style.color = primaryColor; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = ''; }}
                >
                  {useContent('footer.link.calendar').content || 'Kalender'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('kontakt')}
                  className="transition-colors duration-200 text-left hover:opacity-80"
                  onMouseEnter={(e) => { e.currentTarget.style.color = primaryColor; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = ''; }}
                >
                  {useContent('footer.link.contact').content || 'Kontakt'}
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <p className="text-lg font-semibold text-background mb-4">{contactLabel || 'Kontakt'}</p>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 flex-shrink-0" style={{ color: primaryColor }} />
                <span className="text-sm">{phone || '91 75 98 55'}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 flex-shrink-0" style={{ color: primaryColor }} />
                <span className="text-sm break-all">{email || 'jan@mandalregnskapskontor.no'}</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: primaryColor }} />
                <RichText className="text-sm" value={address || 'Bryggegata 1, 4514 Mandal'} />
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div>
            <p className="text-lg font-semibold text-background mb-4">{hoursLabel || 'Åpningstider'}</p>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-start items-start gap-4">
                <span className="w-32 shrink-0">{useContent('footer.hours.weeklabel').content || 'Mandag - Fredag'}</span>
                <RichText className="text-background whitespace-nowrap" value={hoursWeek || '08:00 - 16:00'} />
              </li>
              <li className="flex justify-start items-start gap-4">
                <span className="w-32 shrink-0">{useContent('footer.hours.weekendlabel').content || 'Lørdag - Søndag'}</span>
                <RichText className="text-background whitespace-nowrap" value={hoursWeekend || 'Stengt'} />
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/15 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-background/50">
          <RichText value={copyright || `© ${new Date().getFullYear()} Mandal Regnskapskontor. Alle rettigheter reservert.`} />
          <div className="mt-4 md:mt-0 flex items-center gap-6">
            <Link to="/personvern" className="hover:text-background transition-colors">
              Personvernerklæring
            </Link>
            <Link to="/admin/login" className="flex items-center hover:text-background transition-colors">
              <Lock className="w-3 h-3 mr-1" />
              {useContent('footer.adminlink').content || 'Admin'}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
