import { Award, MapPin, ShieldCheck, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import GlassCard from '../components/GlassCard';
import TrustMeter from '../components/TrustMeter';
import { badges } from '../data/mock';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { token, user } = useAuth();
  const [community, setCommunity] = useState(null);

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const data = await api.get('/communities/me', token);
        setCommunity(data.community);
      } catch (error) {
        setCommunity(null);
      }
    };
    if (token) {
      fetchCommunity();
    }
  }, [token]);

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 text-2xl font-semibold text-slate-700">
            {user?.name ? user.name.split(' ').map((chunk) => chunk[0]).join('') : 'TS'}
          </div>
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">
              {user?.name || 'Community Member'}
            </h2>
            <p className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="h-4 w-4" /> {community?.name || 'Your community'}
            </p>
          </div>
        </div>
        <button className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white shadow-glow">
          Edit Profile
        </button>
      </div>

      <GlassCard className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <TrustMeter value={user?.trustScore ?? 0} />
        <div className="grid flex-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-white/70 p-4">
            <p className="text-xs font-semibold text-slate-500">Ratings</p>
            <p className="text-2xl font-semibold text-slate-900">4.9</p>
            <p className="text-xs text-slate-500">From 24 reviews</p>
          </div>
          <div className="rounded-2xl bg-white/70 p-4">
            <p className="text-xs font-semibold text-slate-500">Credit Points</p>
            <p className="text-2xl font-semibold text-slate-900">
              {user?.creditPoints ?? 0}
            </p>
            <p className="text-xs text-slate-500">Earned for good returns</p>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <GlassCard className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
          <div className="space-y-3 text-sm text-slate-600">
            {[
              { title: 'Shared Electric Kettle', icon: ShieldCheck, time: '2 days ago' },
              { title: 'Borrowed DSLR Camera', icon: Star, time: '1 week ago' },
              { title: 'Earned Trusted Neighbor badge', icon: Award, time: '2 weeks ago' },
            ].map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.title} className="flex items-center justify-between rounded-2xl bg-white/70 p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">{activity.title}</p>
                      <p className="text-xs text-slate-500">{activity.time}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Badges</h3>
          <div className="flex flex-wrap gap-3">
            {badges.map((badge) => (
              <span
                key={badge}
                className="rounded-full bg-white/70 px-4 py-2 text-xs font-semibold text-slate-700"
              >
                {badge}
              </span>
            ))}
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
