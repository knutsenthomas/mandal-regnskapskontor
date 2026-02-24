import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';
import { useSite } from '@/contexts/SiteContext';

const Logo = ({
	color = 'dark',
	isMobileMenu = false
}) => {
	const { logoUrl, logoText } = useSite();
	const isDarkText = color === 'dark';

	return (
		<motion.div initial={false} className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none min-w-0 w-full lg:w-auto">
			{/* Icon Container */}
			{logoUrl ? (
				<motion.div
					className="flex-shrink-0 rounded-lg overflow-hidden"
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
				>
					<img
						src={logoUrl}
						alt="Logo"
						className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-lg"
					/>
				</motion.div>
			) : (
				<motion.div
					className="flex-shrink-0 p-2 sm:p-2.5 rounded-lg bg-primary"
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
				>
					<Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={1.5} />
				</motion.div>
			)}

			{/* Text Container */}
			<div className="flex flex-col justify-center min-w-0 overflow-hidden lg:overflow-visible">
				<motion.span
					initial={false}
					animate={{ color: isDarkText ? 'hsl(var(--primary))' : '#ffffff' }}
					transition={{ duration: 0.3 }}
					className={`font-bold leading-tight tracking-wide uppercase truncate lg:overflow-visible lg:text-clip ${isMobileMenu ? 'text-sm sm:text-base' : 'text-sm sm:text-lg md:text-xl'}`}
				>
					{logoText || "MANDAL REGNSKAPSKONTOR"}
				</motion.span>

				<motion.span
					initial={false}
					animate={{ color: isDarkText ? 'hsl(var(--muted-foreground))' : 'rgba(255, 255, 255, 0.75)' }}
					transition={{ duration: 0.3 }}
					className="text-[10px] sm:text-xs font-bold tracking-[0.15em] uppercase mt-0.5 hidden sm:block whitespace-nowrap"
				>
					AUTORISERT REGNSKAPSFØRER
				</motion.span>

				<motion.span
					initial={false}
					animate={{ color: isDarkText ? 'hsl(var(--muted-foreground))' : 'rgba(255, 255, 255, 0.75)' }}
					transition={{ duration: 0.3 }}
					className="text-[9px] font-bold tracking-[0.08em] uppercase mt-0.5 sm:hidden truncate"
				>
					AUTORISERT REGNSKAPSFØRER
				</motion.span>
			</div>
		</motion.div>
	);
};

export default Logo;
