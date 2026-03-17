import { motion } from 'framer-motion';

export default function TrustHistoryChart({ history }) {
  if (!history || history.length === 0) {
    return <p className="text-sm text-slate-600">No trust history yet.</p>;
  }

  const width = 360;
  const height = 140;
  const padding = 20;

  const scores = history.map((point) => point.trustScore || 0);
  const maxScore = Math.max(...scores, 100);
  const minScore = Math.min(...scores, 0);

  const points = history
    .map((point, index) => {
      const x = padding + (index / Math.max(history.length - 1, 1)) * (width - padding * 2);
      const y =
        padding +
        (1 - (point.trustScore - minScore) / Math.max(maxScore - minScore, 1)) *
          (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="rounded-2xl bg-white/70 p-4">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="trustLine" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#22C55E" />
          </linearGradient>
        </defs>
        <motion.polyline
          points={points}
          fill="none"
          stroke="url(#trustLine)"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        />
        {history.map((point, index) => {
          const x = padding + (index / Math.max(history.length - 1, 1)) * (width - padding * 2);
          const y =
            padding +
            (1 - (point.trustScore - minScore) / Math.max(maxScore - minScore, 1)) *
              (height - padding * 2);
          return (
            <circle key={point._id || index} cx={x} cy={y} r="4" fill="#7C3AED" />
          );
        })}
      </svg>
      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
        <span>Last {history.length} updates</span>
        <span>{history[history.length - 1]?.trustScore ?? 0} current</span>
      </div>
    </div>
  );
}
