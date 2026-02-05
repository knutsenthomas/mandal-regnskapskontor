
import React from 'react';
import { motion } from 'framer-motion';

const ProcessSteps = ({ steps }) => {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="relative">
      {/* Connecting Line (Desktop) */}
      <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-gray-200 -z-10" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15 }}
            className="relative flex flex-col items-center text-center group"
          >
            <div className="w-16 h-16 rounded-full bg-white border-4 border-[#1B4965] text-[#1B4965] font-bold text-xl flex items-center justify-center mb-6 shadow-lg z-10 group-hover:bg-[#1B4965] group-hover:text-white transition-colors duration-300">
              {index + 1}
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h4>
            <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProcessSteps;
