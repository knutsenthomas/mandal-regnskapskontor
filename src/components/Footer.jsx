import React from 'react';
import { Link } from 'react-router-dom';
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
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    } else if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <p className="text-2xl font-bold text-white">{companyName || 'Mandal Regnskapskontor AS'}</p>
            <RichText
              className="text-sm leading-relaxed"
              value={companyDesc || 'Din pålitelige partner for profesjonell regnskap og finansiell rådgivning siden 2009.'}
            />
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-lg font-semibold text-white mb-4">{quicklinksLabel || 'Hurtiglenker'}</p>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollToSection('home')}
                  className="hover:text-white transition-colors duration-200 text-left"
                >
                  {useContent('footer.link.home').content || 'Hjem'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('services')}
                  className="hover:text-white transition-colors duration-200 text-left"
                >
                  {useContent('footer.link.services').content || 'Tjenester'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('about')}
                  className="hover:text-white transition-colors duration-200 text-left"
                >
                  {useContent('footer.link.about').content || 'Om oss'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="hover:text-white transition-colors duration-200 text-left"
                >
                  {useContent('footer.link.contact').content || 'Kontakt'}
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <p className="text-lg font-semibold text-white mb-4">{contactLabel || 'Kontakt'}</p>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <span className="text-sm">{phone || '91 75 98 55'}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <span className="text-sm break-all">{email || 'jan@mandalregnskapskontor.no'}</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" />
                <RichText className="text-sm" value={address || 'Bryggegata 1, 4514 Mandal'} />
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div>
            <p className="text-lg font-semibold text-white mb-4">{hoursLabel || 'Åpningstider'}</p>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>{useContent('footer.hours.weeklabel').content || 'Mandag - Fredag:'}</span>
                <RichText className="text-white text-right" value={hoursWeek || '08:00 - 16:00'} />
              </li>
              <li className="flex justify-between">
                <span>{useContent('footer.hours.weekendlabel').content || 'Lørdag - Søndag:'}</span>
                <RichText className="text-white text-right" value={hoursWeekend || 'Stengt'} />
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <RichText value={copyright || `© ${new Date().getFullYear()} Mandal Regnskapskontor AS. Alle rettigheter reservert.`} />
          <div className="mt-4 md:mt-0">
            <Link to="/admin/login" className="flex items-center hover:text-white transition-colors">
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
