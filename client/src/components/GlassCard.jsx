import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export default function GlassCard({
  children,
  className,
  hoverable = true,
  floating = false,
}) {
  return (
    <motion.div
      whileHover={hoverable ? { y: -6, boxShadow: '0 26px 60px rgba(15, 23, 42, 0.2)' } : undefined}
      animate={floating ? { y: [0, -6, 0] } : undefined}
      transition={floating ? { duration: 6, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
      className={cn(
        'glass-card rounded-3xl p-6 transition-transform duration-300',
        className
      )}
    >
      {children}
    </motion.div>
  );
}
