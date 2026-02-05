
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, FileText, Users, ClipboardCheck, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import ServiceCard from './ServiceCard';

const Services = () => {
  const [dbServices, setDbServices] = useState([]);
  
  // Static configuration for visual assets (Icons and Gradients)
  // We map these to the database data by index
  const serviceConfig = [
    { icon: Calculator, gradient: 'from-[#1B4965] to-[#2A6F97]' },
    { icon: FileText, gradient: 'from-[#1B4965] to-[#0F3347]' },
    { icon: Users, gradient: 'from-[#2A6F97] to-[#468FAF]' },
    { icon: ClipboardCheck, gradient: 'from-[#0F3347] to-[#1B4965]' },
    { icon: TrendingUp, gradient: 'from-[#1B4965] to-[#2C7DA0]' }
  ];

  // Default data in case DB is empty or loading
  const defaultServices = [
    { title: 'Regnskap', description: 'Full digital kontroll og presisjon i hver postering. Med våre moderne systemer sikrer vi at du alltid har full kontroll over din økonomiske status.' },
    { title: 'Fakturering', description: 'Effektive rutiner som sikrer raskere innbetaling. Vi hjelper deg med alt fra fakturaoppsett til oppfølging av utestående beløp.' },
    { title: 'Lønn & Personal', description: 'Trygg håndtering av dine ansattes viktigste gode. Vi tar oss av lønnsbehandling, skattetrekk og all nødvendig rapportering.' },
    { title: 'Revisjon', description: 'Grundig gjennomgang som gir trygghet og innsikt. Våre erfarne revisorer sikrer at alt er i henhold til gjeldende regelverk.' },
    { title: 'Skatteplanlegging', description: 'Spesialkompetanse innen prosjekt og utvikling. Vi optimaliserer din skattesituasjon på en lovlig og effektiv måte.' }
  ];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('content')
          .select('services_data')
          .single();

        if (data && data.services_data && Array.isArray(data.services_data) && data.services_data.length > 0) {
          setDbServices(data.services_data);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };
    fetchServices();
  }, []);

  // Merge DB data with Config. If DB data is missing, use Default.
  const displayServices = (dbServices.length > 0 ? dbServices : defaultServices).map((service, index) => ({
    ...service,
    // Fallback to safe defaults if index exceeds config length
    ...(serviceConfig[index] || serviceConfig[0])
  }));

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section className="py-24 bg-gray-50 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-5">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#1B4965] blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-[#468FAF] blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-[#1B4965] font-semibold tracking-wider text-sm uppercase mb-3 block">Hva vi tilbyr</span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">Våre tjenester</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
            Vi tilbyr omfattende regnskaps- og finansielle tjenester skreddersydd etter dine behov.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {displayServices.map((service, index) => (
            <ServiceCard 
              key={index} 
              service={service} 
              index={index} 
              variants={item} 
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
