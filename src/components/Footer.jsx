import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Lock } from 'lucide-react';

const Footer = () => {
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    } else if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <p className="text-2xl font-bold text-white">Mandal Regnskapskontor AS</p>
            <p className="text-sm leading-relaxed">
              Din pålitelige partner for profesjonell regnskap og finansiell rådgivning siden 2009.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-lg font-semibold text-white mb-4">Hurtiglenker</p>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollToSection('home')}
                  className="hover:text-teal-400 transition-colors duration-200 text-left"
                >
                  Hjem
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('services')}
                  className="hover:text-teal-400 transition-colors duration-200 text-left"
                >
                  Tjenester
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('about')}
                  className="hover:text-teal-400 transition-colors duration-200 text-left"
                >
                  Om oss
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="hover:text-teal-400 transition-colors duration-200 text-left"
                >
                  Kontakt
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <p className="text-lg font-semibold text-white mb-4">Kontakt</p>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-teal-400 flex-shrink-0" />
                <span className="text-sm">91 75 98 55</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-teal-400 flex-shrink-0" />
                <span className="text-sm break-all">jan@mandalregnskapskontor.no</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-teal-400 flex-shrink-0 mt-1" />
                <span className="text-sm">Bryggegata 1, 4514 Mandal</span>
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div>
            <p className="text-lg font-semibold text-white mb-4">Åpningstider</p>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>Mandag - Fredag:</span>
                <span className="text-white">08:00 - 16:00</span>
              </li>
              <li className="flex justify-between">
                <span>Lørdag - Søndag:</span>
                <span className="text-white">Stengt</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} Mandal Regnskapskontor AS. Alle rettigheter reservert.
          </p>
          <div className="mt-4 md:mt-0">
            <Link to="/admin/login" className="flex items-center hover:text-white transition-colors">
              <Lock className="w-3 h-3 mr-1" />
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;