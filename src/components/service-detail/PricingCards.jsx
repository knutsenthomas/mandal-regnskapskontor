
import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PricingCards = ({ packages }) => {
  if (!packages || packages.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {packages.map((pkg, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className={`relative flex flex-col p-8 rounded-2xl border ${index === 1 ? 'border-[#1B4965] ring-2 ring-[#1B4965]/10 bg-white shadow-xl scale-105 z-10' : 'border-gray-200 bg-white shadow-lg'}`}
        >
          {index === 1 && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#1B4965] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              Mest Populær
            </div>
          )}
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
          <div className="text-3xl font-bold text-[#1B4965] mb-4">{pkg.price}</div>
          <p className="text-sm text-gray-500 mb-6">{pkg.description}</p>

          <div className="flex-grow space-y-4 mb-8">
            {pkg.features && pkg.features.map((feature, idx) => (
              <div key={idx} className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-600">{feature}</span>
              </div>
            ))}
          </div>

          <Button 
            className={`w-full ${index === 1 ? 'bg-[#1B4965] hover:bg-[#0F3347]' : 'bg-white text-[#1B4965] border-2 border-[#1B4965] hover:bg-blue-50'}`}
          >
            Velg {pkg.name}
          </Button>
        </motion.div>
      ))}
    </div>
  );
};

export default PricingCards;
