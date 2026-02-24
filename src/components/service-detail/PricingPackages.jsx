import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const PricingPackages = ({ packages }) => {
    if (!packages || packages.length === 0) return null;
    const primaryColor = 'hsl(var(--primary))';
    const primaryForeground = 'hsl(var(--primary-foreground))';

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`flex flex-col p-8 rounded-3xl bg-card text-card-foreground shadow-sm ring-1 ring-border relative ${index === 1 ? 'md:scale-105 shadow-xl z-10' : ''
                        }`}
                    style={index === 1 ? { boxShadow: '0 20px 40px hsl(var(--foreground) / 0.08)', outline: '1px solid hsl(var(--primary) / 0.20)' } : undefined}
                >
                    {index === 1 && (
                        <div
                            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap"
                            style={{ backgroundColor: primaryColor, color: primaryForeground }}
                        >
                            MEST POPULÆR
                        </div>
                    )}
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-foreground mb-2">{pkg.name}</h3>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-foreground">{pkg.price}</span>
                        </div>
                        {pkg.description && (
                            <div
                                className="mt-4 text-sm text-muted-foreground prose-sm"
                                dangerouslySetInnerHTML={{ __html: pkg.description }}
                            />
                        )}
                    </div>

                    <ul className="space-y-4 mb-8 flex-1">
                        {pkg.features && pkg.features.map((feature, fIdx) => (
                            <li key={fIdx} className="flex items-start gap-3 text-sm text-muted-foreground">
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
