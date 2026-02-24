import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const FAQSection = ({ faqs }) => {
    const [openIndex, setOpenIndex] = useState(null);

    if (!faqs || faqs.length === 0) return null;

    return (
        <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => {
                const isOpen = openIndex === index;

                return (
                    <div key={index} className="border border-border rounded-2xl overflow-hidden bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
                        <button
                            onClick={() => setOpenIndex(isOpen ? null : index)}
                            className="w-full px-6 py-5 text-left flex justify-between items-center gap-4 group"
                        >
                            <span className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                                {faq.question}
                            </span>
                            <div className="shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground group-hover:bg-primary/5 transition-colors">
                                {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            </div>
                        </button>

                        <AnimatePresence>
                            {isOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                >
                                    <div className="px-6 pb-6 pt-0 text-muted-foreground prose prose-sm max-w-none">
                                        <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
        </div>
    );
};

export default FAQSection;
