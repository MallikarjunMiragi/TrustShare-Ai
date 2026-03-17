import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function TrustTransparencyModal({ open, onClose, breakdown, tier, override }) {
  const formatPct = (value) => `${Math.round((value || 0) * 100)}%`;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/30 p-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="glass-card w-full max-w-2xl rounded-3xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">Trust transparency</p>
                <h3 className="text-2xl font-semibold text-slate-900">Why this score?</h3>
              </div>
              <button onClick={onClose} className="rounded-full bg-white/70 p-2 text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 space-y-4 text-sm text-slate-600">
              <p>
                Your current tier is <span className="font-semibold text-slate-900">{tier}</span>. We
                combine behavioral signals with a verification baseline and Bayesian smoothing for new
                users.
              </p>
              {override ? (
                <div className="rounded-2xl bg-amber-100/70 p-3 text-xs text-amber-700">
                  Admin override active: trust set to {override.score} ({override.tier || 'tier'}).
                </div>
              ) : null}

              <div className="rounded-2xl bg-white/70 p-4">
                <p className="text-xs font-semibold text-slate-500">Formula</p>
                <p className="mt-2 text-sm text-slate-700">
                  Trust = 0.35·Punctuality + 0.30·Avg Rating + 0.20·Item Care + 0.15·Contribution
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Then blended with verification baseline (T_initial) and Bayesian prior for new users.
                </p>
              </div>

              {breakdown ? (
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl bg-white/70 p-4">
                    <p className="text-xs font-semibold text-slate-500">Punctuality</p>
                    <p className="text-lg font-semibold text-slate-900">{formatPct(breakdown.punctuality)}</p>
                  </div>
                  <div className="rounded-2xl bg-white/70 p-4">
                    <p className="text-xs font-semibold text-slate-500">Average Rating</p>
                    <p className="text-lg font-semibold text-slate-900">{formatPct(breakdown.rating)}</p>
                  </div>
                  <div className="rounded-2xl bg-white/70 p-4">
                    <p className="text-xs font-semibold text-slate-500">Item Care</p>
                    <p className="text-lg font-semibold text-slate-900">{formatPct(breakdown.care)}</p>
                  </div>
                  <div className="rounded-2xl bg-white/70 p-4">
                    <p className="text-xs font-semibold text-slate-500">Contribution</p>
                    <p className="text-lg font-semibold text-slate-900">{formatPct(breakdown.contribution)}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-600">We are still collecting trust signals.</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
