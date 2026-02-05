import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Users, Target, Lightbulb } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';

const About = () => {
  const [content, setContent] = useState(null);
  const icons = [Award, Users, Target, Lightbulb];

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase
        .from('content')
        .select('about_text, about_image, about_values')
        .single();

      if (data) {
        setContent(data);
      }
    };
    fetchContent();
  }, []);

  const defaultValues = [
    {
      title: 'Erfaring',
      description: 'Over 15 års erfaring i bransjen sikrer kvalitet i alle ledd.'
    },
    {
      title: 'Pålitelighet',
      description: 'Tillit er grunnlaget for alt vi gjør. Du kan stole på oss.'
    },
    {
      title: 'Kundefokus',
      description: 'Din suksess er vårt mål. Vi skreddersyr våre løsninger.'
    },
    {
      title: 'Innovasjon',
      description: 'Vi bruker moderne teknologi for effektiv regnskapsføring.'
    }
  ];

  const displayValues = content?.about_values && content.about_values.length > 0
    ? content.about_values
    : defaultValues;

  const defaultImage = "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bmV1dHJhbCUyMG9mZmljZXxlbnwwfHwwfHx8MA%3D%3D";

  const displayImage = content?.about_image || defaultImage;

  const defaultText = `Mandal Regnskapskontor AS er et ledende regnskapsbyrå med solid forankring i lokalsamfunnet. Med over 15 års erfaring har vi bygget opp en bred kompetanse som kommer våre kunder til gode hver eneste dag.

Vi spesialiserer oss på å levere høykvalitets regnskaps- og finansielle tjenester til små og mellomstore bedrifter. Vårt dedikerte team av erfarne regnskapsførere og revisor er forpliktet til å gi deg den beste service, personlig oppfølging og strategisk rådgivning.`;

  const displayText = content?.about_text || defaultText;

  return (
    <section className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-[#1B4965] font-semibold tracking-wider text-sm uppercase mb-3 block">Hvem er vi</span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Om oss</h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-full h-full border-2 border-[#1B4965]/20 rounded-2xl z-0 transform translate-x-4 translate-y-4"></div>
              <img
                src={displayImage}
                alt="Mandal Regnskapskontor"
                className="w-full h-[400px] lg:h-[500px] object-cover"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-1 lg:order-2"
          >
            <h3 className="text-2xl font-semibold text-[#1B4965] mb-6">Din lokale partner for økonomisk vekst</h3>
            <div className="text-lg text-gray-700 leading-relaxed font-light whitespace-pre-line">
              {displayText}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {displayValues.map((value, index) => {
            const Icon = icons[index % icons.length];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-8 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#1B4965]/20 group"
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-8 h-8 text-[#1B4965]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 font-light text-sm">{value.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default About;