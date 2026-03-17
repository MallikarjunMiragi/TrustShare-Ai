import { ArrowUpRight, Package, ShieldCheck, Star, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import GlassCard from '../components/GlassCard';
import TrustMeter from '../components/TrustMeter';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { token, user, setUser } = useAuth();
  const [stats, setStats] = useState({
    trustScore: user?.trustScore ?? 0,
    creditPoints: user?.creditPoints ?? 0,
    itemsLent: 0,
    itemsBorrowed: 0,
    pendingRequests: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get('/dashboard', token);
        setStats(data);
        if (user) {
          setUser({ ...user, trustScore: data.trustScore, creditPoints: data.creditPoints });
        }
      } catch (error) {
        // fallback to local state
      }
    };
    if (token) {
      fetchStats();
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
        <TrustMeter value={stats.trustScore} />
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
          <h3 className="text-lg font-semibold text-slate-900">Active Borrow Requests</h3>
          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-2xl bg-white/70 p-4">
              <div>
                <p className="font-semibold text-slate-900">Smart Projector</p>
                <p>From Meera K.</p>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                Pending
              </span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white/70 p-4">
              <div>
                <p className="font-semibold text-slate-900">Electric Grill</p>
                <p>From Rahul G.</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                Active
              </span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Trust Score Growth</h3>
          <div className="rounded-2xl bg-white/70 p-4">
            <p className="text-sm text-slate-600">
              Your trust score increased by 6 points this month thanks to on-time returns and
              positive ratings.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                +6 trust
              </span>
              <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                +20 points
              </span>
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
