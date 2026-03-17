import { ArrowUpRight, Package, ShieldCheck, Star, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import GlassCard from '../components/GlassCard';
import TrustMeter from '../components/TrustMeter';
import TrustHistoryChart from '../components/TrustHistoryChart';
import TrustTransparencyModal from '../components/TrustTransparencyModal';
import TrustTimeline from '../components/TrustTimeline';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

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
    if (token) {
      fetchStats();
      fetchHistory();
      fetchTimeline();
    }
  }, [token]);

  const metrics = [
    { label: 'Credit Points', value: stats.creditPoints, icon: Star },
    { label: 'Items Lent', value: stats.itemsLent, icon: Package },
    { label: 'Items Borrowed', value: stats.itemsBorrowed, icon: Users },
    { label: 'Pending Requests', value: stats.pendingRequests, icon: ShieldCheck },
  ];

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            Welcome back, {user?.name || 'Neighbor'}
          </p>
          <h2 className="text-3xl font-semibold text-slate-900">Your Trust Dashboard</h2>
        </div>
        <button className="flex items-center gap-2 rounded-full bg-white/70 px-5 py-2 text-sm font-semibold text-slate-700">
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

      <div className="grid gap-6 md:grid-cols-2">
        <GlassCard className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Trust Breakdown</h3>
          {stats.trustBreakdown ? (
            <div className="space-y-3 text-sm text-slate-600">
              {[
                { label: 'Return punctuality', value: stats.trustBreakdown.punctuality },
                { label: 'Average rating', value: stats.trustBreakdown.rating },
                { label: 'Item care', value: stats.trustBreakdown.care },
                { label: 'Community contribution', value: stats.trustBreakdown.contribution },
              ].map((metric) => (
                <div key={metric.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>{metric.label}</span>
                    <span>{Math.round(metric.value * 100)}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${Math.round(metric.value * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600">Collecting trust signals...</p>
          )}
        </GlassCard>

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

        <GlassCard className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Trust Timeline</h3>
          <TrustTimeline timeline={timeline} />
        </GlassCard>
      </div>

      <TrustTransparencyModal
        open={showTransparency}
        onClose={() => setShowTransparency(false)}
        breakdown={stats.trustBreakdown}
        tier={stats.trustTier?.replace('_', ' ') || 'LOW'}
        override={stats.trustOverride}
      />
    </section>
  );
}
