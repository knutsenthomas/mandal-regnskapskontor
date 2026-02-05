import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, Calculator, FileText, Users, ClipboardCheck, TrendingUp
} from 'lucide-react';
import Footer from '@/components/Footer';

// Reusable Components
import OfferingsList from '@/components/service-detail/OfferingsList';

const ServiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // NY FUNKSJON: Sender brukeren tilbake til forsiden og scroller til tjenestene
  const handleBack = () => {
    navigate('/');
    
    // Vi bruker en liten timeout for å la forsiden laste ferdig før vi scroller
    setTimeout(() => {
      const section = document.getElementById('tjenester');
      if (section) {
        const headerOffset = 85; // Juster denne hvis menyen din er høyere/lavere
        const elementPosition = section.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }
    }, 100);
  };

  const serviceConfig = [
    { icon: Calculator, gradient: 'from-[#1B4965] to-[#2A6F97]', label: 'Regnskap' },
    { icon: FileText, gradient: 'from-[#1B4965] to-[#0F3347]', label: 'Fakturering' },
    { icon: Users, gradient: 'from-[#2A6F97] to-[#468FAF]', label: 'Lønn' },
    { icon: ClipboardCheck, gradient: 'from-[#0F3347] to-[#1B4965]', label: 'Revisjon' },
    { icon: TrendingUp, gradient: 'from-[#1B4965] to-[#2C7DA0]', label: 'Rådgivning' }
  ];

  useEffect(() => {
    const fetchServiceData = async () => {
      setLoading(true);
      try {
        const { data: contentData, error: contentError } = await supabase
          .from('content')
          .select('services_data')
          .single();

        if (contentError) throw contentError;

        const { data: detailsData, error: detailsError } = await supabase
          .from('service_details')
          .select('*')
          .eq('service_id', id)
          .single();
        
        if (detailsError && detailsError.code !== 'PGRST116') {
             console.error("Details fetch error:", detailsError);
        }

        const index = parseInt(id, 10);
        
        if (contentData?.services_data && contentData.services_data[index]) {
          const basicServiceData = contentData.services_data[index];
          const config = serviceConfig[index] || serviceConfig[0];
          
          setService({
            ...basicServiceData,
            ...config
          });
          setDetails(detailsData || {});
        } else {
          setError('Tjenesten ble ikke funnet.');
        }
      } catch (err) {
        console.error("Error fetching service:", err);
        setError('Kunne ikke laste tjenestedetaljer.');
      } finally {
        setLoading(false);
      }
    };

    fetchServiceData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B4965]"></div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Tjenesten finnes ikke'}</h2>
        <Button onClick={handleBack} className="bg-[#1B4965] hover:bg-[#0F3347]">
          <ArrowLeft className="mr-2 h-4 w-4" /> Tilbake til forsiden
        </Button>
      </div>
    );
  }

  const Icon = service.icon;

  return (
    <>
      <Helmet>
        <title>{service.title} - Mandal Regnskapskontor</title>
        <meta name="description" content={service.description} />
      </Helmet>

      {/* Subtle Gradient Background */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/80 pt-16 lg:pt-32">
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          
          {/* Back Button - Updated with handleBack */}
          <div className="mb-8">
            <Button 
                onClick={handleBack} 
                variant="ghost" 
                className="text-gray-500 hover:text-[#1B4965] hover:bg-transparent pl-0 group font-medium text-sm md:text-base"
              >
                <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" /> 
                Tilbake til alle tjenester
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
             
             {/* Left Column (Main Info) */}
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5 }}
               className="lg:col-span-6 flex flex-col items-start"
             >
                {/* Service Icon */}
                <div className="w-20 h-20 bg-[#EFF6FF] rounded-2xl flex items-center justify-center mb-8 shadow-sm ring-1 ring-blue-50">
                   <Icon className="w-9 h-9 text-[#1B4965]" />
                </div>

                {/* Title - ENDRET: Fjernet 'font-serif' herfra */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0F172A] mb-8 tracking-tight leading-[1.1]">
                  {service.title}
                </h1>

                {/* Description */}
                <div className="prose prose-lg text-gray-600 mb-10 leading-relaxed max-w-none font-light">
                   {details?.extended_description ? (
                      details.extended_description.split('\n').map((paragraph, idx) => (
                        <p key={idx} className="mb-6">{paragraph}</p>
                      ))
                    ) : (
                      <p className="mb-6">{service.description}</p>
                    )}
                </div>

                {/* CTA Button */}
                <Button 
                  size="lg"
                  onClick={() => navigate('/?section=kontakt')}
                  className="bg-[#1B4965] hover:bg-[#153a52] text-white text-base md:text-lg px-8 py-7 h-auto rounded-xl shadow-lg shadow-[#1B4965]/20 w-full sm:w-auto transition-all hover:scale-[1.02]"
                >
                  Bestill rådgivning for {service.title}
                </Button>
             </motion.div>

             {/* Right Column (Offerings Panel) */}
             <motion.div 
               initial={{ opacity: 0, y: 40 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.1 }}
               className="lg:col-span-6 w-full"
             >
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden h-full shadow-sm ring-1 ring-gray-100">
                   {/* ENDRET: Fjernet 'font-serif' herfra også for å være konsekvent */}
                   <h2 className="text-3xl font-bold text-[#0F172A] mb-8">Hva vi tilbyr</h2>
                   
                   <div className="mb-12">
                     {details?.offerings && details.offerings.length > 0 ? (
                        <OfferingsList offerings={details.offerings} />
                     ) : (
                        <p className="text-gray-500 italic">Ingen spesifikke punkter listet opp ennå.</p>
                     )}
                   </div>

                   {/* Dark CTA Card */}
                   <div className="bg-[#1B4965] rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden group">
                      {/* Decorative elements */}
                      <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors duration-500"></div>
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                      
                      <div className="relative z-10">
                        <h3 className="text-xl md:text-2xl font-bold mb-3 tracking-tight">Trenger du en skreddersydd plan?</h3>
                        <p className="text-blue-100 mb-8 text-sm md:text-base leading-relaxed opacity-90 font-light">
                          Vi tilpasser våre systemer nøyaktig etter dine behov og arbeidsflyt for maksimal effektivitet.
                        </p>
                        <Button 
                          onClick={() => navigate('/?section=kontakt')}
                          className="w-full bg-white text-[#1B4965] hover:bg-blue-50 font-bold h-14 rounded-xl text-base shadow-lg transition-all hover:shadow-xl"
                        >
                          Få et pristilbud
                        </Button>
                      </div>
                   </div>
                </div>
             </motion.div>

          </div>
        </div>
        
        <Footer />
      </div>
    </>
  );
};

export default ServiceDetailPage;