import { motion } from 'framer-motion';
import { CalendarClock } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function TrustTimeline({ timeline }) {
  if (!timeline || timeline.length === 0) {
    return <p className="text-sm text-slate-600">No trust events yet.</p>;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-3">
      {timeline.map((entry) => (
        <motion.div
          key={entry._id}
          variants={item}
          className="flex items-center justify-between rounded-2xl bg-white/70 p-4 text-sm text-slate-600"
        >
          <div>
            <p className="font-semibold text-slate-900">{entry.label}</p>
            <p className="text-xs text-slate-500">{entry.type.replace(/_/g, ' ')}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CalendarClock className="h-4 w-4" />
            {new Date(entry.createdAt).toLocaleDateString()}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
