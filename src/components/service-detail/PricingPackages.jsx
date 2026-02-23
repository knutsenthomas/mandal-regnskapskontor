import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const PricingPackages = ({ packages }) => {
    if (!packages || packages.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`flex flex-col p-8 rounded-3xl bg-white shadow-sm ring-1 ring-gray-100 relative ${index === 1 ? 'md:scale-105 shadow-xl ring-primary/20 z-10' : ''
                        }`}
                >
                    {index === 1 && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                            MEST POPULÆR
                        </div>
                    )}
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{pkg.name}</h3>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-slate-900">{pkg.price}</span>
                        </div>
                        {pkg.description && (
                            <div
                                className="mt-4 text-sm text-gray-500 prose-sm"
                                dangerouslySetInnerHTML={{ __html: pkg.description }}
                            />
                        )}
                    </div>

                    <ul className="space-y-4 mb-8 flex-1">
                        {pkg.features && pkg.features.map((feature, fIdx) => (
                            <li key={fIdx} className="flex items-start gap-3 text-sm text-gray-600">
                                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                </motion.div>
            ))}
        </div>
    );
};

export default PricingPackages;
