import { motion } from 'framer-motion';
import { BadgeCheck, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import GlassCard from './GlassCard';
import AnimatedButton from './AnimatedButton';

export default function ItemCard({ item }) {
  return (
    <GlassCard className="space-y-4">
      <div className="rounded-2xl bg-white/50 p-4">
        <div className="flex h-40 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-white/70 via-white/40 to-indigo-100/70">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm font-semibold text-slate-600">{item.category}</span>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Link
            to={`/items/${item._id || item.id}`}
            className="text-lg font-semibold text-slate-900"
          >
            {item.title}
          </Link>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            {item.available ? 'Available' : 'Borrowed'}
          </span>
        </div>
        <p className="text-sm text-slate-500">Shared by {item.owner}</p>
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <ShieldCheck className="h-4 w-4 text-primary" />
        Trust {item.trustScore}
        {item.trustTier ? `· ${item.trustTier.replace('_', ' ')}` : ''}
      </div>
      {item.valueTier ? (
        <p className="text-xs font-semibold text-slate-500">Value tier: {item.valueTier}</p>
      ) : null}
      </div>
      <div className="flex items-center justify-between">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700"
        >
          <BadgeCheck className="h-4 w-4 text-secondary" />
          {item.badge}
        </motion.div>
        <AnimatedButton className="px-4 py-2 text-xs">Borrow</AnimatedButton>
      </div>
    </GlassCard>
  );
}
