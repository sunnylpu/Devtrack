import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Timer, Coffee, Crosshair } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const MODES = {
  work: { label: 'Focus', duration: 25, color: 'var(--accent)', icon: Crosshair },
  short: { label: 'Short Break', duration: 5, color: 'var(--success)', icon: Coffee },
  long: { label: 'Long Break', duration: 15, color: 'var(--accent)', icon: Coffee },
};

export default function FocusPage() {
  const { user } = useAuthStore();
  const workMins = user?.preferences?.pomodoroWork || 25;
  const breakMins = user?.preferences?.pomodoroBreak || 5;
  const longBreakMins = user?.preferences?.pomodoroLongBreak || 15;

  const [mode, setMode] = useState('work');
  const [timeLeft, setTimeLeft] = useState(workMins * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [totalFocusMin, setTotalFocusMin] = useState(0);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  const durations = { work: workMins * 60, short: breakMins * 60, long: longBreakMins * 60 };

  const reset = useCallback(() => {
    setRunning(false);
    clearInterval(intervalRef.current);
    setTimeLeft(durations[mode]);
  }, [mode, durations]);

  const switchMode = useCallback((m) => {
    setRunning(false);
    clearInterval(intervalRef.current);
    setMode(m);
    setTimeLeft(durations[m]);
  }, [durations]);

  useEffect(() => {
    if (running) {
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000 / 60);
            if (mode === 'work') {
              setSessions(s => s + 1);
              setTotalFocusMin(t => t + elapsed);
              toast.success('🎯 Focus session complete! Time for a break.', { duration: 5000 });
            } else {
              toast.success('☕ Break over! Ready to focus again?', { duration: 5000 });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode]);

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');
  const total = durations[mode];
  const progress = ((total - timeLeft) / total) * 100;

  const currentMode = MODES[mode];
  const circumference = 2 * Math.PI * 120;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div className="p-8 flex flex-col items-center min-h-screen" style={{ background: 'var(--bg)' }}>
      <h1 className="text-2xl font-bold mb-2 self-start" style={{ color: 'var(--text)' }}>Focus Mode</h1>
      <p className="text-sm mb-10 self-start" style={{ color: 'var(--subtle)' }}>Pomodoro-powered deep work sessions</p>

      {/* Mode selector */}
      <div className="flex gap-2 mb-12 p-1 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {Object.entries(MODES).map(([key, val]) => (
          <button
            key={key}
            onClick={() => switchMode(key)}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: mode === key ? val.color : 'transparent',
              color: mode === key ? 'white' : 'var(--subtle)',
            }}
          >
            {val.label}
          </button>
        ))}
      </div>

      {/* Timer circle */}
      <div className="relative flex items-center justify-center mb-10">
        <svg width="280" height="280" viewBox="0 0 280 280">
          {/* Background circle */}
          <circle
            cx="140" cy="140" r="120"
            fill="none" stroke="var(--surface-2)" strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="140" cy="140" r="120"
            fill="none"
            stroke={currentMode.color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 140 140)"
            style={{ transition: 'stroke-dashoffset 1s linear', filter: `drop-shadow(0 0 12px ${currentMode.color}80)` }}
          />
        </svg>

        <div className="absolute flex flex-col items-center">
          <div
            className="text-6xl font-bold tracking-tight mb-1"
            style={{ color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace" }}
          >
            {mins}:{secs}
          </div>
          <div className="text-sm font-medium" style={{ color: currentMode.color }}>
            {currentMode.label}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-12">
        <button
          onClick={reset}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <RotateCcw size={18} style={{ color: 'var(--subtle)' }} />
        </button>

        <button
          onClick={() => setRunning(!running)}
          className="w-20 h-20 rounded-full flex items-center justify-center transition-all hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${currentMode.color}, ${currentMode.color}aa)`,
            boxShadow: `0 0 30px ${currentMode.color}50`,
          }}
        >
          {running
            ? <Pause size={28} style={{ color: 'white' }} />
            : <Play size={28} style={{ color: 'white', marginLeft: 3 }} />
          }
        </button>

        <button
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--subtle)', cursor: 'default' }}
        >
          <Timer size={18} />
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-6">
        {[
          { label: 'Sessions Today', value: sessions, color: 'var(--accent)' },
          { label: 'Focus Minutes', value: totalFocusMin, color: 'var(--success)' },
          { label: 'Minutes Remaining', value: Math.ceil(timeLeft / 60), color: 'var(--warning)' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="text-center px-6 py-4 rounded-2xl"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="text-2xl font-bold mb-1" style={{ color }}>{value}</div>
            <div className="text-xs" style={{ color: 'var(--subtle)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div
        className="mt-8 max-w-md text-center p-5 rounded-2xl"
        style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent-soft)' }}
      >
        <p className="text-sm" style={{ color: 'var(--subtle)' }}>
          💡 <strong style={{ color: 'var(--muted)' }}>Tip:</strong> After 4 focus sessions, take a 15-minute long break.
          This is the classic Pomodoro technique for sustained productivity.
        </p>
      </div>
    </div>
  );
}
