export default function TimerCircle({ timeLeft, total, color, label }) {
  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');
  const progress = ((total - timeLeft) / total) * 100;
  const circumference = 2 * Math.PI * 120;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="280" height="280" viewBox="0 0 280 280">
        <circle cx="140" cy="140" r="120" fill="none" stroke="var(--surface-2)" strokeWidth="8" />
        <circle
          cx="140" cy="140" r="120"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 140 140)"
          style={{ transition: 'stroke-dashoffset 1s linear', filter: `drop-shadow(0 0 12px ${color}80)` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <div
          className="text-6xl font-bold tracking-tight mb-1"
          style={{ color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace" }}
        >
          {mins}:{secs}
        </div>
        <div className="text-sm font-medium" style={{ color }}>{label}</div>
      </div>
    </div>
  );
}
