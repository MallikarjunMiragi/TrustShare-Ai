import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  BadgeCheck,
  CalendarClock,
  Mail,
  Package,
  Save,
  ShieldCheck,
  Star,
  UserRound,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import TrustMeter from './TrustMeter';

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : 'Not set');

const statusTone = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  PENDING: 'bg-amber-100 text-amber-700',
  RETURNED: 'bg-slate-100 text-slate-700',
  REJECTED: 'bg-rose-100 text-rose-700',
};

export default function AdminMemberProfileModal({ open, memberId, token, onClose, onUpdated }) {
  const [profile, setProfile] = useState(null);
  const [draft, setDraft] = useState({
    name: '',
    email: '',
    avatar: '',
    creditPoints: 0,
    verification: {
      emailVerified: false,
      communityVerified: false,
      idVerified: false,
    },
  });
  const [status, setStatus] = useState({ loading: false, saving: false, error: '', success: '' });

  const fetchProfile = async () => {
    if (!memberId || !token) return;
    setStatus({ loading: true, saving: false, error: '', success: '' });
    try {
      const data = await api.get(`/admin/users/${memberId}`, token);
      setProfile(data);
      setDraft({
        name: data.member?.name || '',
        email: data.member?.email || '',
        avatar: data.member?.avatar || '',
        creditPoints: data.member?.creditPoints ?? 0,
        verification: {
          emailVerified: Boolean(data.member?.verification?.emailVerified),
          communityVerified: Boolean(data.member?.verification?.communityVerified),
          idVerified: Boolean(data.member?.verification?.idVerified),
        },
      });
      setStatus({ loading: false, saving: false, error: '', success: '' });
    } catch (error) {
      setStatus({ loading: false, saving: false, error: error.message, success: '' });
    }
  };

  useEffect(() => {
    if (open) {
      fetchProfile();
    } else {
      setProfile(null);
    }
  }, [open, memberId, token]);

  const updateDraft = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const updateVerification = (field, value) => {
    setDraft((prev) => ({
      ...prev,
      verification: { ...prev.verification, [field]: value },
    }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setStatus((prev) => ({ ...prev, saving: true, error: '', success: '' }));
    try {
      await api.patch(
        `/admin/users/${memberId}/profile`,
        {
          name: draft.name,
          email: draft.email,
          avatar: draft.avatar,
          creditPoints: Number(draft.creditPoints),
          verification: draft.verification,
        },
        token
      );
      await fetchProfile();
      setStatus((prev) => ({
        ...prev,
        loading: false,
        saving: false,
        success: 'Profile updated and trust recomputed.',
      }));
      onUpdated?.();
    } catch (error) {
      setStatus((prev) => ({ ...prev, saving: false, error: error.message }));
    }
  };

  const member = profile?.member;
  const trustProfile = profile?.trustProfile;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="glass-card max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-[2rem] p-0"
          >
            <div className="sticky top-0 z-10 border-b border-white/40 bg-white/70 p-5 backdrop-blur-2xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Admin member profile
                  </p>
                  <h3 className="mt-1 text-2xl font-semibold text-slate-950">
                    {member?.name || 'Loading member...'}
                  </h3>
                </div>
                <button onClick={onClose} className="rounded-full bg-white/80 p-2 text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {status.loading ? (
              <div className="p-6 text-sm text-slate-600">Loading profile...</div>
            ) : status.error && !profile ? (
              <div className="p-6 text-sm font-semibold text-rose-500">{status.error}</div>
            ) : profile ? (
              <div className="grid gap-6 p-6 xl:grid-cols-[0.9fr_1.35fr]">
                <div className="space-y-6">
                  <div className="rounded-[1.5rem] bg-white/70 p-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-3xl bg-primary/10">
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} className="h-full w-full object-cover" />
                        ) : (
                          <UserRound className="h-7 w-7 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-slate-900">{member.name}</p>
                        <p className="flex items-center gap-2 text-xs text-slate-500">
                          <Mail className="h-3.5 w-3.5" /> {member.email}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                        Trust {trustProfile?.trustScore ?? member.trustScore}
                      </span>
                      <span className="rounded-full bg-white px-3 py-1 text-slate-600">
                        {(trustProfile?.trustTier || member.trustTier || 'LOW').replace('_', ' ')}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 ${
                          member.accountStatus === 'SUSPENDED'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {member.accountStatus || 'ACTIVE'}
                      </span>
                    </div>

                    <div className="mt-5 flex justify-center">
                      <TrustMeter value={trustProfile?.trustScore ?? member.trustScore ?? 0} />
                    </div>
                  </div>

                  <form onSubmit={saveProfile} className="space-y-3 rounded-[1.5rem] bg-white/70 p-5">
                    <div className="flex items-center gap-2">
                      <BadgeCheck className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold text-slate-900">Edit safe profile fields</h4>
                    </div>
                    <input
                      value={draft.name}
                      onChange={(event) => updateDraft('name', event.target.value)}
                      placeholder="Name"
                      className="w-full rounded-2xl bg-white px-4 py-3 text-sm outline-none"
                    />
                    <input
                      value={draft.email}
                      onChange={(event) => updateDraft('email', event.target.value)}
                      placeholder="Email"
                      className="w-full rounded-2xl bg-white px-4 py-3 text-sm outline-none"
                    />
                    <input
                      value={draft.avatar}
                      onChange={(event) => updateDraft('avatar', event.target.value)}
                      placeholder="Avatar image URL"
                      className="w-full rounded-2xl bg-white px-4 py-3 text-sm outline-none"
                    />
                    <input
                      type="number"
                      value={draft.creditPoints}
                      onChange={(event) => updateDraft('creditPoints', event.target.value)}
                      placeholder="Credit points"
                      className="w-full rounded-2xl bg-white px-4 py-3 text-sm outline-none"
                    />

                    <div className="grid gap-2 text-xs font-semibold text-slate-600 sm:grid-cols-3">
                      {[
                        ['emailVerified', 'Email verified'],
                        ['communityVerified', 'Community verified'],
                        ['idVerified', 'ID verified'],
                      ].map(([field, label]) => (
                        <label key={field} className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2">
                          <input
                            type="checkbox"
                            checked={draft.verification[field]}
                            onChange={(event) => updateVerification(field, event.target.checked)}
                          />
                          {label}
                        </label>
                      ))}
                    </div>

                    {status.error ? (
                      <p className="text-xs font-semibold text-rose-500">{status.error}</p>
                    ) : null}
                    {status.success ? (
                      <p className="text-xs font-semibold text-emerald-600">{status.success}</p>
                    ) : null}

                    <button
                      type="submit"
                      disabled={status.saving}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
                    >
                      <Save className="h-4 w-4" />
                      {status.saving ? 'Saving...' : 'Save profile'}
                    </button>
                  </form>
                </div>

                <div className="space-y-6">
                  <div className="grid gap-3 sm:grid-cols-4">
                    {[
                      { label: 'Items', value: profile.stats.itemsListed, icon: Package },
                      { label: 'Borrowed', value: profile.stats.borrowedCount, icon: Activity },
                      { label: 'Lent', value: profile.stats.lentCount, icon: ShieldCheck },
                      { label: 'Late returns', value: profile.stats.lateReturnedCount, icon: CalendarClock },
                    ].map((card) => {
                      const Icon = card.icon;
                      return (
                        <div key={card.label} className="rounded-3xl bg-white/70 p-4">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-slate-500">{card.label}</p>
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <p className="mt-1 text-2xl font-semibold text-slate-900">{card.value}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-[1.5rem] bg-white/70 p-5">
                    <h4 className="font-semibold text-slate-900">Trust flags and strengths</h4>
                    <div className="mt-3 grid gap-3 lg:grid-cols-2">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-500">Flags</p>
                        {trustProfile?.breakdown?.flags?.length ? (
                          trustProfile.breakdown.flags.map((flag) => (
                            <div key={flag.code} className="rounded-2xl bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-700">
                              {flag.label}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-slate-600">No active trust flags.</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-500">Strengths</p>
                        {trustProfile?.breakdown?.strengths?.length ? (
                          trustProfile.breakdown.strengths.map((strength) => (
                            <div key={strength} className="rounded-2xl bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700">
                              {strength}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-slate-600">No strong patterns yet.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <HistoryPanel title="Borrowed requests" requests={profile.borrowedRequests} direction="borrowed" />
                    <HistoryPanel title="Lent requests" requests={profile.lentRequests} direction="lent" />
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-[1.5rem] bg-white/70 p-5">
                      <h4 className="flex items-center gap-2 font-semibold text-slate-900">
                        <Star className="h-4 w-4 text-primary" /> Recent ratings
                      </h4>
                      <div className="mt-3 space-y-2">
                        {profile.ratings?.length ? (
                          profile.ratings.map((rating) => (
                            <div key={rating._id} className="rounded-2xl bg-white px-3 py-2 text-sm text-slate-600">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-900">
                                  {rating.fromUserId?.name || 'Community member'}
                                </span>
                                <span>{rating.score}/5</span>
                              </div>
                              <p className="text-xs text-slate-500">{rating.comment || 'No comment'}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-slate-600">No ratings yet.</p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] bg-white/70 p-5">
                      <h4 className="flex items-center gap-2 font-semibold text-slate-900">
                        <CalendarClock className="h-4 w-4 text-primary" /> Trust timeline
                      </h4>
                      <div className="mt-3 space-y-2">
                        {profile.trustEvents?.length ? (
                          profile.trustEvents.map((event) => (
                            <div key={event._id} className="rounded-2xl bg-white px-3 py-2 text-sm text-slate-600">
                              <p className="font-semibold text-slate-900">{event.label}</p>
                              <p className="text-xs text-slate-500">
                                {event.type.replace(/_/g, ' ')} · {formatDate(event.createdAt)}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-slate-600">No trust events yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function HistoryPanel({ title, requests, direction }) {
  return (
    <div className="rounded-[1.5rem] bg-white/70 p-5">
      <h4 className="font-semibold text-slate-900">{title}</h4>
      <div className="mt-3 space-y-2">
        {requests?.length ? (
          requests.map((request) => {
            const person = direction === 'borrowed' ? request.ownerId : request.borrowerId;
            return (
              <div key={request._id} className="rounded-2xl bg-white px-3 py-2 text-sm text-slate-600">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {request.itemId?.title || 'Shared item'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {direction === 'borrowed' ? 'Owner' : 'Borrower'}: {person?.name || 'Member'}
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${statusTone[request.status] || statusTone.PENDING}`}>
                    {request.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Requested {formatDate(request.requestedAt)}
                  {request.dueAt ? ` · Due ${formatDate(request.dueAt)}` : ''}
                </p>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-slate-600">No history yet.</p>
        )}
      </div>
    </div>
  );
}
