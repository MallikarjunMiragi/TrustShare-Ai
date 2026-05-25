import {
  AlertTriangle,
  ArrowUpRight,
  Gauge,
  Package,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import TrustMeter from '../components/TrustMeter';
import TrustHistoryChart from '../components/TrustHistoryChart';
import TrustTransparencyModal from '../components/TrustTransparencyModal';
import TrustTimeline from '../components/TrustTimeline';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const signalConfig = [
  { key: 'punctuality', label: 'Return punctuality' },
  { key: 'completion', label: 'Completion rate' },
  { key: 'rating', label: 'Reputation quality' },
  { key: 'care', label: 'Item care' },
  { key: 'contribution', label: 'Community contribution' },
  { key: 'diversity', label: 'Member diversity' },
  { key: 'verification', label: 'Profile verification' },
  { key: 'responsiveness', label: 'Owner responsiveness' },
  { key: 'valueHandling', label: 'Value-tier readiness' },
];

const flagTone = {
  high: 'bg-rose-100 text-rose-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-sky-100 text-sky-700',
};

const formatPct = (value) => `${Math.round((value || 0) * 100)}%`;

export default function Dashboard() {
  const { token, user, setUser } = useAuth();
  const [stats, setStats] = useState({
    trustScore: user?.trustScore ?? 0,
    creditPoints: user?.creditPoints ?? 0,
    trustTier: user?.trustTier ?? 'LOW',
    trustBreakdown: null,
    borrowLimits: null,
    trustOverride: null,
    itemsLent: 0,
    itemsBorrowed: 0,
    pendingRequests: 0,
  });
  const [history, setHistory] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [showTransparency, setShowTransparency] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get('/dashboard', token);
        setStats(data);
        if (user) {
          setUser({
            ...user,
            trustScore: data.trustScore,
            creditPoints: data.creditPoints,
            trustTier: data.trustTier,
          });
        }
      } catch (error) {
        // fallback to local state
      }
    };

    const fetchHistory = async () => {
      try {
        const data = await api.get('/trust/history?limit=12', token);
        setHistory(data.history || []);
      } catch (error) {
        setHistory([]);
      }
    };

    const fetchTimeline = async () => {
      try {
        const data = await api.get('/trust/timeline?limit=20', token);
        setTimeline(data.timeline || []);
      } catch (error) {
        setTimeline([]);
      }
    };

    const fetchAIAnalysis = async () => {
      try {
        const data = await api.get('/ai/trust-analysis', token);
        setAiAnalysis(data.analysis || null);
      } catch (error) {
        setAiAnalysis(null);
      }
    };

    if (token) {
      fetchStats();
      fetchHistory();
      fetchTimeline();
      fetchAIAnalysis();
    }
  }, [token]);

  const metrics = [
    { label: 'Credit Points', value: stats.creditPoints, icon: Star },
    { label: 'Items Lent', value: stats.itemsLent, icon: Package },
    { label: 'Items Borrowed', value: stats.itemsBorrowed, icon: Users },
    { label: 'Pending Requests', value: stats.pendingRequests, icon: ShieldCheck },
  ];

  const breakdown = stats.trustBreakdown;
  const signalEntries = signalConfig
    .map((entry) => ({
      ...entry,
      value: breakdown?.signals?.[entry.key] ?? breakdown?.[entry.key],
      weight: breakdown?.signalWeights?.[entry.key] ?? 0,
    }))
    .filter((entry) => typeof entry.value === 'number');
  const flags = breakdown?.flags || [];
  const strengths = breakdown?.strengths || [];

  const guardrailCards = breakdown
    ? [
        {
          label: 'Confidence',
          value: formatPct(breakdown.confidence?.overall),
          hint: `Blend ${formatPct(breakdown.confidence?.blend)}`,
        },
        {
          label: 'History cap',
          value: formatPct(breakdown.confidence?.historyCap),
          hint: breakdown.antiGaming?.historyCapApplied ? 'Cap active' : 'Cap lifted',
        },
        {
          label: 'Anti-gaming penalty',
          value: formatPct(breakdown.penalties?.total),
          hint: `${flags.length} active flags`,
        },
      ]
    : [];

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            Welcome back, {user?.name || 'Neighbor'}
          </p>
          <h2 className="text-3xl font-semibold text-slate-900">Your Trust Dashboard</h2>
        </div>
        <button
          onClick={() => setShowTransparency(true)}
          className="flex items-center gap-2 rounded-full bg-white/70 px-5 py-2 text-sm font-semibold text-slate-700"
        >
          View insights <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>

      <GlassCard className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-4">
          <TrustMeter value={stats.trustScore} />
          <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Tier: {stats.trustTier?.replace('_', ' ') || 'LOW'}
          </span>
          <button
            onClick={() => setShowTransparency(true)}
            className="text-xs font-semibold text-primary"
          >
            Why this score?
          </button>
        </div>
        <div className="grid flex-1 gap-4 sm:grid-cols-2">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="rounded-2xl bg-white/70 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-500">{metric.label}</p>
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <p className="text-2xl font-semibold text-slate-900">{metric.value}</p>
                <p className="text-xs text-slate-500">Updated just now</p>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {aiAnalysis ? (
        <GlassCard className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-slate-900">AI Trust Analyst</h3>
              </div>
              <p className="mt-1 text-sm text-slate-600">{aiAnalysis.summary}</p>
            </div>
            <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600">
              {aiAnalysis.source} · {aiAnalysis.engineVersion}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white/70 p-4">
              <p className="text-xs font-semibold text-slate-500">AI reliability score</p>
              <p className="mt-1 text-3xl font-semibold text-slate-900">{aiAnalysis.modelScore}</p>
              <p className="text-xs text-slate-500">Confidence {aiAnalysis.confidence}%</p>
            </div>
            <div className="rounded-2xl bg-white/70 p-4">
              <p className="text-xs font-semibold text-slate-500">Risk level</p>
              <p className="mt-1 text-3xl font-semibold text-slate-900">{aiAnalysis.riskLevel}</p>
              <p className="text-xs text-slate-500">Real-time behavioural analysis</p>
            </div>
            <div className="rounded-2xl bg-white/70 p-4">
              <p className="text-xs font-semibold text-slate-500">Lending advice</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{aiAnalysis.lendingAdvice}</p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_1fr_0.95fr]">
            <div className="rounded-2xl bg-white/70 p-4">
              <p className="text-sm font-semibold text-slate-900">Top positive drivers</p>
              <div className="mt-3 space-y-2">
                {(aiAnalysis.positiveDrivers || []).map((driver) => (
                  <div key={driver.label} className="rounded-2xl bg-emerald-50 px-3 py-2">
                    <p className="text-xs font-semibold text-emerald-700">{driver.label}</p>
                    <p className="text-xs text-slate-600">{driver.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white/70 p-4">
              <p className="text-sm font-semibold text-slate-900">Top risk drivers</p>
              <div className="mt-3 space-y-2">
                {(aiAnalysis.riskDrivers || []).length ? (
                  aiAnalysis.riskDrivers.map((driver) => (
                    <div key={driver.label} className="rounded-2xl bg-amber-50 px-3 py-2">
                      <p className="text-xs font-semibold text-amber-700">{driver.label}</p>
                      <p className="text-xs text-slate-600">{driver.detail}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-600">No major AI risk drivers detected right now.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-white/70 p-4">
              <p className="text-sm font-semibold text-slate-900">Next best actions</p>
              <div className="mt-3 space-y-2">
                {(aiAnalysis.recommendedActions || []).map((action) => (
                  <div key={action} className="rounded-2xl bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700">
                    {action}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <GlassCard className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Multi-Parameter Trust Signals</h3>
              <p className="text-sm text-slate-600">
                Score quality, reliability, diversity, and confidence all work together.
              </p>
            </div>
            <div className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600">
              {breakdown?.formulaVersion || 'Collecting signals'}
            </div>
          </div>

          {signalEntries.length ? (
            <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
              {signalEntries.map((signal, index) => (
                <motion.div
                  key={signal.key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  className="rounded-2xl bg-white/70 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-500">{signal.label}</p>
                      <p className="mt-1 text-2xl font-semibold text-slate-900">
                        {formatPct(signal.value)}
                      </p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
                      Weight {Math.round(signal.weight * 100)}%
                    </span>
                  </div>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round(signal.value * 100)}%` }}
                      transition={{ duration: 0.7, delay: index * 0.05 }}
                      className="h-full rounded-full bg-gradient-to-r from-primary via-sky-400 to-emerald-400"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600">Collecting trust signals...</p>
          )}
        </GlassCard>

        <GlassCard className="space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-slate-900">Anti-Gaming Guardrails</h3>
          </div>
          {guardrailCards.length ? (
            <>
              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                {guardrailCards.map((card) => (
                  <div key={card.label} className="rounded-2xl bg-white/70 p-4">
                    <p className="text-xs font-semibold text-slate-500">{card.label}</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">{card.value}</p>
                    <p className="text-xs text-slate-500">{card.hint}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl bg-white/70 p-4">
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold text-slate-900">How manipulation is reduced</p>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Trust is blended with confidence, capped for low-history accounts, and penalized
                  when activity or ratings are too concentrated.
                </p>
              </div>

              <div className="grid gap-4">
                <div className="rounded-2xl bg-white/70 p-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-500" />
                    <p className="text-sm font-semibold text-slate-900">Strengths</p>
                  </div>
                  {strengths.length ? (
                    <div className="mt-3 space-y-2">
                      {strengths.map((item) => (
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
                      Positive patterns will appear here as more borrowing history builds up.
                    </p>
                  )}
                </div>

                <div className="rounded-2xl bg-white/70 p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <p className="text-sm font-semibold text-slate-900">Flags</p>
                  </div>
                  {flags.length ? (
                    <div className="mt-3 space-y-2">
                      {flags.map((flag, index) => (
                        <motion.div
                          key={`${flag.code}-${index}`}
                          animate={{ opacity: [0.85, 1, 0.85] }}
                          transition={{ duration: 3, repeat: Infinity, delay: index * 0.3 }}
                          className={`rounded-2xl px-3 py-2 text-xs font-semibold ${
                            flagTone[flag.severity] || flagTone.medium
                          }`}
                        >
                          {flag.label}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-slate-600">
                      No manipulation risk flags are active right now.
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-600">Guardrails will appear after trust is computed.</p>
          )}
        </GlassCard>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <GlassCard className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Borrow Limits</h3>
          {stats.borrowLimits ? (
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between rounded-2xl bg-white/70 p-4">
                <span>Max active borrows</span>
                <span className="font-semibold text-slate-900">{stats.borrowLimits.maxActive}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/70 p-4">
                <span>Max item value</span>
                <span className="font-semibold text-slate-900">
                  {stats.borrowLimits.maxValueTier}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/70 p-4">
                <span>Max duration</span>
                <span className="font-semibold text-slate-900">
                  {stats.borrowLimits.maxDurationDays} days
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-600">Borrow limits will update after first return.</p>
          )}
        </GlassCard>

        <GlassCard className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Trust History</h3>
          <TrustHistoryChart history={history} />
        </GlassCard>
      </div>

      <GlassCard className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Trust Timeline</h3>
        <TrustTimeline timeline={timeline} />
      </GlassCard>

      <TrustTransparencyModal
        open={showTransparency}
        onClose={() => setShowTransparency(false)}
        breakdown={stats.trustBreakdown}
        tier={stats.trustTier?.replace('_', ' ') || 'LOW'}
        override={stats.trustOverride}
        score={stats.trustScore}
      />
    </section>
  );
}
