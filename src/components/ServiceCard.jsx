
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const ServiceCard = ({ service, index, variants }) => {
  return (
    <motion.div
      variants={variants}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col"
    >
      <Link to={`/service/${index}`} className="flex flex-col h-full">
        <div className="p-10 flex-grow">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-8 transform group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
            <service.icon className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#1B4965] transition-colors">
            {service.title}
          </h3>
          <p className="text-gray-600 leading-relaxed font-light mb-6">
            {service.description}
          </p>
        </div>
        
        <div className="px-10 pb-8 mt-auto flex items-center text-[#1B4965] font-semibold text-sm group-hover:underline decoration-2 underline-offset-4">
          Les mer
          <ArrowRight className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
        </div>

        <div className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${service.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
      </Link>
    </motion.div>
  );
};

export default ServiceCard;
