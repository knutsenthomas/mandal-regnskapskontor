import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';

const Logo = ({
	color = 'dark',
	isMobileMenu = false
}) => {
	const isDarkText = color === 'dark';

	return (
		<motion.div initial={false} className="flex items-center space-x-3 cursor-pointer select-none">
			{/* Icon Container - Always Blue Background */}
			<motion.div
				className="flex-shrink-0 p-2 sm:p-2.5 rounded-lg bg-[#1B4965]"
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
			>
				<Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={1.5} />
			</motion.div>

			{/* Text Container */}
			<div className="flex flex-col justify-center">
				<motion.span
					initial={false}
					animate={{ color: isDarkText ? '#1B4965' : '#ffffff' }}
					transition={{ duration: 0.3 }}
					// ENDRING HER: Har fjernet 'font-serif' fra linjen under
					className={`font-bold leading-tight tracking-wide uppercase whitespace-nowrap ${isMobileMenu ? 'text-sm' : 'text-sm sm:text-base md:text-lg'}`}
				>
					MANDAL REGNSKAPSKONTOR
				</motion.span>

				<motion.span
					initial={false}
					animate={{ color: isDarkText ? '#64748B' : 'rgba(255, 255, 255, 0.75)' }}
					transition={{ duration: 0.3 }}
					className="text-[10px] sm:text-xs font-bold tracking-[0.15em] uppercase mt-0.5 hidden sm:block whitespace-nowrap"
				>
					AUTORISERT REGNSKAPSFØRER
				</motion.span>

				<motion.span
					initial={false}
					animate={{ color: isDarkText ? '#64748B' : 'rgba(255, 255, 255, 0.75)' }}
					transition={{ duration: 0.3 }}
					className="text-[9px] font-bold tracking-[0.1em] uppercase mt-0.5 sm:hidden whitespace-nowrap"
				>
					AUTORISERT REGNSKAPSFØRER
				</motion.span>
			</div>
		</motion.div>
	);
};

export default Logo;