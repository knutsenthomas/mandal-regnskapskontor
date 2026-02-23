import React from 'react';
import { motion } from 'framer-motion';

const ProcessSteps = ({ steps }) => {
    if (!steps || steps.length === 0) return null;

    return (
        <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#1B4965]/20 before:to-transparent">
            {steps.map((step, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
                >
                    {/* Dot */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-gray-100 text-[#1B4965] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform group-hover:scale-110">
                        <span className="font-bold">{index + 1}</span>
                    </div>

                    {/* Content */}
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <h3 className="font-bold text-lg text-blue-950 mb-2">{step.title}</h3>
                        <div
                            className="text-gray-600 prose prose-sm max-w-none prose-p:my-0"
                            dangerouslySetInnerHTML={{ __html: step.description }}
                        />
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default ProcessSteps;
