import { AlertTriangle, ShieldCheck, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06 } }),
};

export default function AdminDashboard() {
  const { token } = useAuth();
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState('');
  const [expandedMemberId, setExpandedMemberId] = useState(null);
  const [limitDrafts, setLimitDrafts] = useState({});
  const [actionMessage, setActionMessage] = useState('');

  const fetchOverview = async () => {
    try {
      const data = await api.get('/admin/overview', token);
      setOverview(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOverview();
    }
  }, [token]);

  const updateStatus = async (memberId, status) => {
    setActionMessage('');
    await api.patch(`/admin/users/${memberId}/status`, { status }, token);
    setActionMessage('Status updated');
    fetchOverview();
  };

  const resetTrust = async (memberId) => {
    setActionMessage('');
    await api.patch(`/admin/users/${memberId}/reset-trust`, {}, token);
    setActionMessage('Trust reset');
    fetchOverview();
  };

  const clearOverride = async (memberId) => {
    setActionMessage('');
    await api.patch(`/admin/users/${memberId}/clear-trust-override`, {}, token);
    setActionMessage('Trust override cleared');
    fetchOverview();
  };

  const updateLimitDraft = (memberId, field, value) => {
    setLimitDrafts((prev) => ({
      ...prev,
      [memberId]: { ...prev[memberId], [field]: value },
    }));
  };

  const saveLimits = async (memberId) => {
    const draft = limitDrafts[memberId] || {};
    await api.patch(`/admin/users/${memberId}/limits`, draft, token);
    setActionMessage('Borrow limits updated');
    fetchOverview();
  };

  if (error) {
    return (
      <GlassCard className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-900">Admin Dashboard</h3>
        <p className="text-sm text-rose-500">{error}</p>
      </GlassCard>
    );
  }

  if (!overview) {
    return <p className="text-sm text-slate-600">Loading admin data...</p>;
  }

  const { stats, lowTrustMembers, lateReturns, members } = overview;

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-3xl font-semibold text-slate-900">Admin Trust Dashboard</h2>
        <p className="text-sm text-slate-600">Monitor trust health and potential misuse.</p>
        {actionMessage ? <p className="mt-2 text-xs font-semibold text-emerald-600">{actionMessage}</p> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[{ label: 'Members', value: stats.membersCount, icon: Users },
          { label: 'Items', value: stats.itemsCount, icon: ShieldCheck },
          { label: 'Active Borrows', value: stats.activeBorrows, icon: ShieldCheck },
          { label: 'Avg Trust', value: stats.avgTrust, icon: AlertTriangle },
        ].map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.label} custom={index} initial="hidden" animate="visible" variants={cardVariants}>
              <GlassCard className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>{card.label}</span>
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <p className="text-2xl font-semibold text-slate-900">{card.value}</p>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Low Trust Members</h3>
          {lowTrustMembers?.length ? (
            <div className="space-y-3 text-sm text-slate-600">
              {lowTrustMembers.map((member) => (
                <div key={member._id} className="flex items-center justify-between rounded-2xl bg-white/70 p-4">
                  <div>
                    <p className="font-semibold text-slate-900">{member.name}</p>
                    <p className="text-xs text-slate-500">{member.email}</p>
                  </div>
                  <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                    Trust {member.trustScore}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600">No low trust members right now.</p>
          )}
        </GlassCard>

        <GlassCard className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Late Returns</h3>
          {lateReturns?.length ? (
            <div className="space-y-3 text-sm text-slate-600">
              {lateReturns.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between rounded-2xl bg-white/70 p-4">
                  <div>
                    <p className="font-semibold text-slate-900">{entry.borrower?.name}</p>
                    <p className="text-xs text-slate-500">{entry.item?.title}</p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                    {entry.daysLate} days late
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600">No late returns detected.</p>
          )}
        </GlassCard>
      </div>

      <GlassCard className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Member Controls</h3>
        <div className="space-y-4">
          {members?.map((member) => (
            <div key={member._id} className="rounded-2xl bg-white/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">{member.name}</p>
                  <p className="text-xs text-slate-500">{member.email}</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">
                    Trust {member.trustScore}
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 font-semibold text-slate-600">
                    {member.trustTier?.replace('_', ' ')}
                  </span>
                  <span className={`rounded-full px-3 py-1 font-semibold ${member.accountStatus === 'SUSPENDED' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {member.accountStatus || 'ACTIVE'}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {member.accountStatus === 'SUSPENDED' ? (
                  <button onClick={() => updateStatus(member._id, 'ACTIVE')} className="rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-700">
                    Reinstate
                  </button>
                ) : (
                  <button onClick={() => updateStatus(member._id, 'SUSPENDED')} className="rounded-full bg-rose-100 px-3 py-1 font-semibold text-rose-700">
                    Suspend
                  </button>
                )}
                <button onClick={() => resetTrust(member._id)} className="rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-700">
                  Reset Trust
                </button>
                {member.manualTrustOverride ? (
                  <button onClick={() => clearOverride(member._id)} className="rounded-full bg-white px-3 py-1 font-semibold text-slate-600">
                    Clear Override
                  </button>
                ) : null}
                <button
                  onClick={() => setExpandedMemberId(expandedMemberId === member._id ? null : member._id)}
                  className="rounded-full bg-white px-3 py-1 font-semibold text-slate-600"
                >
                  {expandedMemberId === member._id ? 'Close Limits' : 'Set Limits'}
                </button>
              </div>

              {expandedMemberId === member._id ? (
                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  <input
                    type="number"
                    placeholder="Max active"
                    value={limitDrafts[member._id]?.maxActive || ''}
                    onChange={(event) => updateLimitDraft(member._id, 'maxActive', event.target.value)}
                    className="rounded-full bg-white px-3 py-2 text-xs outline-none"
                  />
                  <select
                    value={limitDrafts[member._id]?.maxValueTier || ''}
                    onChange={(event) => updateLimitDraft(member._id, 'maxValueTier', event.target.value)}
                    className="rounded-full bg-white px-3 py-2 text-xs outline-none"
                  >
                    <option value="">Max value tier</option>
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Max days"
                    value={limitDrafts[member._id]?.maxDurationDays || ''}
                    onChange={(event) => updateLimitDraft(member._id, 'maxDurationDays', event.target.value)}
                    className="rounded-full bg-white px-3 py-2 text-xs outline-none"
                  />
                  <button
                    onClick={() => saveLimits(member._id)}
                    className="rounded-full bg-primary px-3 py-2 text-xs font-semibold text-white"
                  >
                    Save Limits
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </GlassCard>
    </section>
  );
}
