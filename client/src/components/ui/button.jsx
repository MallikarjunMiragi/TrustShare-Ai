import { cn } from '../../lib/utils';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60 disabled:pointer-events-none';

const variants = {
  default: 'bg-primary text-white shadow-glow hover:-translate-y-0.5 hover:shadow-xl',
  secondary: 'bg-white/70 text-slate-900 glass-border hover:-translate-y-0.5',
  ghost: 'bg-transparent text-slate-900 hover:bg-white/40',
};

const sizes = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({ className, variant = 'default', size = 'md', ...props }) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
