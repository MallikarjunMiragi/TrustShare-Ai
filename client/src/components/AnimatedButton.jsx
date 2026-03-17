import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export default function AnimatedButton({ className, children, ...props }) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
      className={cn(
        'rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-glow transition-shadow hover:shadow-xl',
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
