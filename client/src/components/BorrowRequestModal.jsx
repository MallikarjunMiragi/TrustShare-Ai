import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, CheckCircle2, Send, ShieldCheck, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import AnimatedButton from './AnimatedButton';

export default function BorrowRequestModal({ item, open, onClose, onSubmit, advisory }) {
  const [form, setForm] = useState({ durationDays: 3, message: '' });
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

  useEffect(() => {
    if (open) {
      setForm({
        durationDays: advisory?.suggestedDurationDays || 3,
        message: item?.title ? `Hi, can I borrow ${item.title} for a short project?` : '',
      });
      setStatus({ loading: false, error: '', success: '' });
    }
  }, [open, item?._id, advisory?.suggestedDurationDays]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, error: '', success: '' });
    try {
      await onSubmit({
        durationDays: Number(form.durationDays),
        message: form.message,
      });
      setStatus({
        loading: false,
        error: '',
        success: 'Request sent. The owner can approve or reject it from Requests.',
      });
    } catch (error) {
      setStatus({ loading: false, error: error.message, success: '' });
    }
  };

  return (
    <AnimatePresence>
      {open && item ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="glass-card w-full max-w-xl overflow-hidden rounded-[2rem] p-0"
          >
            <div className="relative bg-gradient-to-br from-white/90 via-white/60 to-emerald-100/60 p-6">
              <motion.div
                animate={{ y: [0, -8, 0], rotate: [0, 2, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute right-10 top-10 h-24 w-24 rounded-full bg-primary/20 blur-3xl"
              />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Borrow request
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Shared by {item.owner || item.ownerId?.name || 'Community member'}
                  </p>
                </div>
                <button onClick={onClose} className="rounded-full bg-white/70 p-2 text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="relative mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/70 p-3">
                  <p className="text-[11px] font-semibold text-slate-500">Availability</p>
                  <p className="text-sm font-semibold text-emerald-700">
                    {item.available ? 'Available' : 'Borrowed'}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/70 p-3">
                  <p className="text-[11px] font-semibold text-slate-500">Owner trust</p>
                  <p className="text-sm font-semibold text-primary">Trust {item.trustScore ?? 0}</p>
                </div>
                <div className="rounded-2xl bg-white/70 p-3">
                  <p className="text-[11px] font-semibold text-slate-500">Value tier</p>
                  <p className="text-sm font-semibold text-slate-900">{item.valueTier || 'LOW'}</p>
                </div>
              </div>
            </div>

            <form className="space-y-4 p-6" onSubmit={handleSubmit}>
              {advisory ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-gradient-to-r from-primary/10 via-sky-100/80 to-emerald-100/80 p-4"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <p className="text-sm font-semibold text-slate-900">
                      AI suggestion: {advisory.fitLabel}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    Suggested duration: <span className="font-semibold text-slate-900">{advisory.suggestedDurationDays} days</span>
                  </p>
                  {advisory.reasons?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {advisory.reasons.map((reason) => (
                        <span
                          key={reason}
                          className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold text-slate-700"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {advisory.caution ? (
                    <p className="mt-3 rounded-2xl bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-700">
                      {advisory.caution}
                    </p>
                  ) : null}
                </motion.div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-[150px_1fr]">
                <label className="space-y-2">
                  <span className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <CalendarDays className="h-4 w-4 text-primary" /> Days
                  </span>
                  <input
                    type="number"
                    name="durationDays"
                    min="1"
                    value={form.durationDays}
                    onChange={handleChange}
                    className="w-full rounded-2xl bg-white/75 px-4 py-3 text-sm outline-none ring-1 ring-white/50 focus:ring-primary/30"
                  />
                </label>

                <label className="space-y-2">
                  <span className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <ShieldCheck className="h-4 w-4 text-primary" /> Message to owner
                  </span>
                  <input
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    className="w-full rounded-2xl bg-white/75 px-4 py-3 text-sm outline-none ring-1 ring-white/50 focus:ring-primary/30"
                  />
                </label>
              </div>

              {status.error ? (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-rose-100 px-4 py-3 text-xs font-semibold text-rose-700"
                >
                  {status.error}
                </motion.p>
              ) : null}

              {status.success ? (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 rounded-2xl bg-emerald-100 px-4 py-3 text-xs font-semibold text-emerald-700"
                >
                  <CheckCircle2 className="h-4 w-4" /> {status.success}
                </motion.div>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="max-w-xs text-xs text-slate-500">
                  This creates a pending request. The item owner still needs to approve it.
                </p>
                <AnimatedButton type="submit" disabled={status.loading || !item.available}>
                  <span className="inline-flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    {status.loading ? 'Sending...' : 'Send Request'}
                  </span>
                </AnimatedButton>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
