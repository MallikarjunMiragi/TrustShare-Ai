export default function BackgroundBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-indigo-50" />
      <div className="glow-orb h-72 w-72 left-[-60px] top-[-40px] animate-drift" />
      <div className="glow-orb secondary h-80 w-80 right-[-120px] top-[10%] animate-pulseGlow" />
      <div className="glow-orb warm h-72 w-72 right-[10%] bottom-[-80px] animate-drift" />
      <div className="absolute left-[20%] top-[35%] h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
    </div>
  );
}
