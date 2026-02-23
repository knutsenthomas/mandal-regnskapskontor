import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useContent } from '@/contexts/ContentContext';

const ServiceCard = ({ service, index, variants }) => {
  return (
    <motion.div
      variants={variants}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group relative h-[320px] lg:h-[300px] xl:h-[280px] rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer"
    >
      <Link to={`/service/${index}`} className="block h-full w-full">
        {/* Background Image */}
        {/* Background Image */}
        {/* Background Image */}
        <div className="absolute inset-0 bg-gray-900">
          {service.image && (
            <img
              src={service.image}
              alt=""
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80"
              onError={(e) => e.target.style.display = 'none'}
            />
          )}
        </div>

        {/* Overlay - Dark gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 group-hover:opacity-90"></div>

        {/* Content Container */}
        <div className="relative z-10 flex flex-col justify-end h-full p-6 xl:p-5 text-white">

          {/* Title */}
          <h3 className="text-xl xl:text-lg font-bold mb-2 tracking-tight leading-tight group-hover:text-slate-200 transition-colors">
            {service.title || useContent('servicecard.title').content || 'Tittel'}
          </h3>

          {/* Description (truncated/shortened visually) */}
          <p className="text-gray-300 text-sm mb-4 line-clamp-3 font-light leading-relaxed opacity-90 group-hover:opacity-100">
            {service.description || useContent('servicecard.description').content || 'Beskrivelse av tjenesten.'}
          </p>

          {/* Action Button */}
          <div className="inline-flex items-center justify-center bg-primary hover:opacity-90 text-white font-medium py-2.5 px-5 rounded-lg transition-all duration-300 w-fit group-hover:gap-2 shadow-lg">
            <span>{useContent('servicecard.button').content || 'Les mer'}</span>
            <ArrowRight className="w-0 h-4 opacity-0 -ml-2 group-hover:w-4 group-hover:ml-2 group-hover:opacity-100 transition-all duration-300" />
          </div>
        </div>

        {/* Bottom Accent Line (using gradient from config or primary) */}
        <div className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${service.gradient || 'from-slate-700 to-slate-900'}`}></div>
      </Link>
    </motion.div>
  );
};

export default ServiceCard;
