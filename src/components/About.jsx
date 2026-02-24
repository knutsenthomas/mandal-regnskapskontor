import React from 'react';
import { motion } from 'framer-motion';
import { Award, Users, Target, Lightbulb } from 'lucide-react';
import { useContent } from '@/contexts/ContentContext';

const containsHtml = (value) => /<\/?[a-z][\s\S]*>/i.test(value || '');

const About = () => {
  const icons = [Award, Users, Target, Lightbulb];
  // Hent tekst, bilde og verdier fra content_blocks
  const { content: aboutText } = useContent('about.text');
  const { content: aboutImage } = useContent('about.image');
  const { content: aboutValues } = useContent('about.values');

  // Fallbacks hvis ikke satt i content_blocks
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
  let parsedValues = defaultValues;
  if (aboutValues) {
    if (Array.isArray(aboutValues) && aboutValues.length > 0) {
      parsedValues = aboutValues;
    } else if (typeof aboutValues === 'string') {
      try {
        const arr = JSON.parse(aboutValues);
        if (Array.isArray(arr) && arr.length > 0) parsedValues = arr;
      } catch { }
    }
  }
  const defaultImage = "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bmV1dHJhbCUyMG9mZmljZXxlbnwwfHwwfHx8MA%3D%3D";
  const displayImage = aboutImage || defaultImage;
  const defaultText = `Mandal Regnskapskontor er et ledende regnskapsbyrå med solid forankring i lokalsamfunnet. Med over 15 års erfaring har vi bygget opp en bred kompetanse som kommer våre kunder til gode hver eneste dag.\n\nVi spesialiserer oss på å levere høykvalitets regnskaps- og finansielle tjenester til små og mellomstore bedrifter. Vårt dedikerte team av erfarne regnskapsførere og revisor er forpliktet til å gi deg den beste service, personlig oppfølging og strategisk rådgivning.`;
  const displayText = aboutText || defaultText;
  const valuesGridCols = parsedValues.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4';
  return (
    <section className="py-24 bg-background text-foreground relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          // ... (lines elided)
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-primary font-semibold tracking-wider text-sm uppercase mb-3 block">{useContent('about.sectionlabel').content || 'Hvem er vi'}</span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">{useContent('about.title').content || 'Om oss'}</h2>
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
              <div className="absolute -top-4 -left-4 w-full h-full border-2 border-primary/20 rounded-2xl z-0 transform translate-x-4 translate-y-4"></div>
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
            <h3 className="text-2xl font-semibold text-primary mb-6">{useContent('about.subtitle').content || 'Din lokale partner for økonomisk vekst'}</h3>
            {containsHtml(displayText) ? (
              <div
                className="prose prose-lg max-w-none text-foreground/80 font-light"
                dangerouslySetInnerHTML={{ __html: displayText }}
              />
            ) : (
              <div className="text-lg text-foreground/80 leading-relaxed font-light whitespace-pre-line">
                {displayText}
              </div>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={`grid grid-cols-1 sm:grid-cols-2 ${valuesGridCols} gap-8 max-w-6xl mx-auto justify-center`}
        >
          {parsedValues.map((value, index) => {
            const Icon = icons[index % icons.length];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-8 bg-card text-card-foreground rounded-2xl hover:shadow-xl transition-all duration-300 border border-border hover:border-primary/20 group"
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
