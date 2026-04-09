import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ShieldCheck, Sparkles, X } from 'lucide-react';

const signalLabels = {
  punctuality: 'Return punctuality',
  completion: 'Completion rate',
  rating: 'Reputation quality',
  care: 'Item care',
  contribution: 'Community contribution',
  diversity: 'Member diversity',
  verification: 'Profile verification',
  responsiveness: 'Owner responsiveness',
  valueHandling: 'Value-tier readiness',
};

const penaltyLabels = {
  overdueExposure: 'Overdue exposure',
  latePattern: 'Late-return pattern',
  ratingConcentration: 'Rating concentration',
  counterpartyConcentration: 'Counterparty concentration',
  signalMismatch: 'Signal mismatch',
  suspension: 'Account suspension',
  total: 'Total deduction',
};

const formatPct = (value) => `${Math.round((value || 0) * 100)}%`;

export default function TrustTransparencyModal({
  open,
  onClose,
  breakdown,
  tier,
  override,
  score,
}) {
  const signalEntries = breakdown?.signals
    ? Object.entries(breakdown.signals).map(([key, value]) => ({
        key,
        label: signalLabels[key] || key,
        value,
        weight: breakdown?.signalWeights?.[key] ?? 0,
      }))
    : [];

  const penaltyEntries = breakdown?.penalties
    ? Object.entries(breakdown.penalties)
        .filter(([key, value]) => key !== 'total' && (value || 0) > 0)
        .map(([key, value]) => ({
          key,
          label: penaltyLabels[key] || key,
          value,
        }))
    : [];

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
            className="glass-card max-h-[88vh] w-full max-w-4xl overflow-y-auto rounded-3xl p-6"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-500">Trust transparency</p>
                <h3 className="text-2xl font-semibold text-slate-900">Why this score?</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Score {score ?? 0} · Tier {tier}
                </p>
              </div>
              <button onClick={onClose} className="rounded-full bg-white/70 p-2 text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 space-y-4 text-sm text-slate-600">
              <p>
                Trust uses multiple behavior signals, then blends them with confidence and applies
                anti-gaming deductions. That means a few easy ratings or repeated transactions with
                the same person cannot push the score unrealistically high.
              </p>

              {override ? (
                <div className="rounded-2xl bg-amber-100/70 p-3 text-xs text-amber-700">
                  Admin override active: trust set to {override.score} ({override.tier || 'tier'}).
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-white/70 p-4">
                  <p className="text-xs font-semibold text-slate-500">Composite score</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">
                    {formatPct(breakdown?.antiGaming?.baseComposite)}
                  </p>
                  <p className="text-xs text-slate-500">Weighted behavior signals</p>
                </div>
                <div className="rounded-2xl bg-white/70 p-4">
                  <p className="text-xs font-semibold text-slate-500">Confidence blend</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">
                    {formatPct(breakdown?.confidence?.blend)}
                  </p>
                  <p className="text-xs text-slate-500">Small history keeps trust capped</p>
                </div>
                <div className="rounded-2xl bg-white/70 p-4">
                  <p className="text-xs font-semibold text-slate-500">History cap</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">
                    {formatPct(breakdown?.confidence?.historyCap)}
                  </p>
                  <p className="text-xs text-slate-500">Cap before deductions apply</p>
                </div>
              </div>

              <div className="rounded-2xl bg-white/70 p-4">
                <p className="text-xs font-semibold text-slate-500">Formula flow</p>
                <p className="mt-2 text-sm text-slate-700">
                  Final trust = min(weighted signal score blended with confidence, history cap) -
                  anti-gaming penalties
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Signals include punctuality, completion, reputation, care, contribution,
                  diversity, verification, responsiveness, and higher-value item readiness.
                </p>
              </div>

              {signalEntries.length ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <p className="text-sm font-semibold text-slate-900">Signals and weights</p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {signalEntries.map((signal) => (
                      <div key={signal.key} className="rounded-2xl bg-white/70 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold text-slate-500">{signal.label}</p>
                            <p className="text-lg font-semibold text-slate-900">
                              {formatPct(signal.value)}
                            </p>
                          </div>
                          <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
                            {Math.round(signal.weight * 100)}% weight
                          </span>
                        </div>
                        <div className="mt-3 h-2 w-full rounded-full bg-slate-200">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-primary via-sky-400 to-emerald-400"
                            style={{ width: `${Math.round(signal.value * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-600">We are still collecting trust signals.</p>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-white/70 p-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-500" />
                    <p className="text-sm font-semibold text-slate-900">Strengths</p>
                  </div>
                  {breakdown?.strengths?.length ? (
                    <div className="mt-3 space-y-2">
                      {breakdown.strengths.map((item) => (
                        <div
                          key={item}
                          className="rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-slate-600">
                      Strong patterns will appear here once the account has richer history.
                    </p>
                  )}
                </div>

                <div className="rounded-2xl bg-white/70 p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <p className="text-sm font-semibold text-slate-900">Anti-gaming deductions</p>
                  </div>
                  {penaltyEntries.length ? (
                    <div className="mt-3 space-y-2">
                      {penaltyEntries.map((penalty) => (
                        <div
                          key={penalty.key}
                          className="flex items-center justify-between rounded-2xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700"
                        >
                          <span>{penalty.label}</span>
                          <span>-{formatPct(penalty.value)}</span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
                        <span>Total deduction</span>
                        <span>-{formatPct(breakdown?.penalties?.total)}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-slate-600">
                      No anti-gaming deductions are active at the moment.
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-white/70 p-4">
                  <p className="text-xs font-semibold text-slate-500">Confidence counts</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-700">
                    <div className="flex items-center justify-between">
                      <span>Completed transactions</span>
                      <span>{breakdown?.counts?.completedTransactions ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Unique counterparties</span>
                      <span>{breakdown?.counts?.uniqueCounterparties ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Unique raters</span>
                      <span>{breakdown?.counts?.uniqueRaters ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Risky-item returns</span>
                      <span>{breakdown?.counts?.riskyBorrowReturns ?? 0}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-white/70 p-4">
                  <p className="text-xs font-semibold text-slate-500">Pattern diagnostics</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-700">
                    <div className="flex items-center justify-between">
                      <span>Average rating</span>
                      <span>{breakdown?.averages?.averageRating ?? 0}/5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Average care</span>
                      <span>{breakdown?.averages?.averageCare ?? 0}/5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Top rater share</span>
                      <span>{formatPct(breakdown?.antiGaming?.topRaterShare)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Top counterparty share</span>
                      <span>{formatPct(breakdown?.antiGaming?.topCounterpartyShare)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {breakdown?.flags?.length ? (
                <div className="rounded-2xl bg-white/70 p-4">
                  <p className="text-xs font-semibold text-slate-500">Active flags</p>
                  <div className="mt-3 space-y-2">
                    {breakdown.flags.map((flag, index) => (
                      <motion.div
                        key={`${flag.code}-${index}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="rounded-2xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700"
                      >
                        {flag.label}
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
