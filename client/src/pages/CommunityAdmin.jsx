import { useEffect, useState } from 'react';
import { RefreshCw, Users } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import AnimatedButton from '../components/AnimatedButton';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function CommunityAdmin() {
  const { token, user } = useAuth();
  const [community, setCommunity] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionStatus, setActionStatus] = useState('');

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const data = await api.get('/communities/me', token);
        setCommunity(data.community);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      fetchCommunity();
    }
  }, [token]);

  const isAdmin = community?.adminId?.toString
    ? community.adminId.toString() === (user?.id || user?._id)
    : community?.adminId === (user?.id || user?._id);

  const refreshInvite = async () => {
    setActionStatus('');
    try {
      const data = await api.patch('/communities/invite-code', {}, token);
      setCommunity((prev) => ({ ...prev, inviteCode: data.inviteCode }));
      setActionStatus('Invite code refreshed.');
    } catch (err) {
      setActionStatus(err.message);
    }
  };

  const copyCode = async () => {
    if (!community?.inviteCode) return;
    await navigator.clipboard.writeText(community.inviteCode);
    setActionStatus('Invite code copied.');
  };

  if (loading) {
    return <div className="text-sm text-slate-500">Loading community...</div>;
  }

  if (error) {
    return <div className="text-sm text-rose-500">{error}</div>;
  }

  if (!community || !isAdmin) {
    return (
      <GlassCard className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-900">Admin only</h3>
        <p className="text-sm text-slate-600">
          You do not have permission to view community management settings.
        </p>
      </GlassCard>
    );
  }

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-3xl font-semibold text-slate-900">Community Management</h2>
        <p className="text-sm text-slate-600">Manage invite codes and members.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <GlassCard className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Community</p>
              <h3 className="text-2xl font-semibold text-slate-900">{community.name}</h3>
            </div>
            <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
              Admin
            </span>
          </div>
          <div className="rounded-2xl bg-white/70 p-4">
            <p className="text-xs font-semibold text-slate-500">Invite code</p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-lg font-semibold tracking-widest text-primary">
                {community.inviteCode}
              </p>
              <button
                onClick={copyCode}
                className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-700"
              >
                Copy
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <AnimatedButton onClick={refreshInvite} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Refresh Code
            </AnimatedButton>
            {actionStatus ? (
              <p className="text-xs font-semibold text-slate-600">{actionStatus}</p>
            ) : null}
          </div>
        </GlassCard>

        <GlassCard className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h3 className="text-lg font-semibold text-slate-900">Members</h3>
          </div>
          <div className="space-y-2 text-sm text-slate-600">
            {community.members?.map((member) => (
              <div key={member._id} className="flex items-center justify-between rounded-2xl bg-white/70 p-3">
                <div>
                  <p className="font-semibold text-slate-900">{member.name}</p>
                  <p className="text-xs text-slate-500">{member.email}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Trust {member.trustScore ?? 0}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
