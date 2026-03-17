import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export default function TrustMeter({ value = 78, size = 140, className }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(value, 0), 100);
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <svg width={size} height={size} viewBox="0 0 140 140">
        <defs>
          <linearGradient id="trustGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#22C55E" />
          </linearGradient>
        </defs>
        <circle
          cx="70"
          cy="70"
          r={radius}
          stroke="rgba(148, 163, 184, 0.25)"
          strokeWidth="12"
          fill="none"
        />
        <motion.circle
          cx="70"
          cy="70"
          r={radius}
          stroke="url(#trustGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          style={{ transformOrigin: '50% 50%', transform: 'rotate(-90deg)' }}
        />
        <text
          x="70"
          y="75"
          textAnchor="middle"
          fontSize="22"
          fontWeight="700"
          fill="#0F172A"
        >
          {progress}
        </text>
        <text x="70" y="95" textAnchor="middle" fontSize="12" fill="#64748B">
          Trust Score
        </text>
      </svg>
      <div>
        <p className="text-sm text-slate-500">Community confidence</p>
        <p className="text-lg font-semibold">Top 12% this month</p>
      </div>
    </div>
  );
}
