
import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, FileSpreadsheet, FileCheck, UploadCloud, Send, Bell, 
  ListChecks, AlertTriangle, Banknote, Plane, HeartPulse, Scale, 
  Stamp, Search, ShieldCheck, GitMerge, Users, HeartHandshake as Handshake, 
  FileWarning, CheckCircle2, Star, Zap, Layout 
} from 'lucide-react';

const iconMap = {
  BookOpen, FileSpreadsheet, FileCheck, UploadCloud,
  Send, Bell, ListChecks, AlertTriangle,
  Banknote, Plane, HeartPulse,
  Scale, Stamp, Search, ShieldCheck,
  GitMerge, Users, Handshake, FileWarning,
  CheckCircle2, Star, Zap, Layout
};

const OfferingsList = ({ offerings }) => {
  if (!offerings || offerings.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {offerings.map((item, index) => {
        // Use CheckCircle2 as default if specific icon isn't found, or if user selected CheckCircle2
        const IconComponent = iconMap[item.icon] || CheckCircle2;
        
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center p-5 bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 border border-transparent hover:border-gray-100"
          >
            <div className="flex-shrink-0 mr-5">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1B4965]">
                <IconComponent className="w-5 h-5 stroke-[2.5px]" />
              </div>
            </div>
            <span className="font-semibold text-gray-800 text-lg">{item.title}</span>
          </motion.div>
        );
      })}
    </div>
  );
};

export default OfferingsList;
