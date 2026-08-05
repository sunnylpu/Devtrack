import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, Crosshair, Zap, Clock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const MODES = {
  work:  { label: 'Focus',       duration: 25, color: '#8b5cf6', icon: Crosshair, desc: 'Deep work session' },
  short: { label: 'Short Break', duration: 5,  color: '#22c55e', icon: Coffee,    desc: 'Quick recharge' },
  long:  { label: 'Long Break',  duration: 15, color: '#f59e0b', icon: Coffee,    desc: 'Full rest' },
};

export default function FocusPage() {
  const { user } = useAuthStore();
  const workMins      = user?.preferences?.pomodoroWork      || 25;
  const breakMins     = user?.preferences?.pomodoroBreak     || 5;
  const longBreakMins = user?.preferences?.pomodoroLongBreak || 15;

  const [mode, setMode]               = useState('work');
  const [timeLeft, setTimeLeft]       = useState(workMins * 60);
  const [running, setRunning]         = useState(false);
  const [sessions, setSessions]       = useState(0);
  const [totalFocusMin, setFocusMin]  = useState(0);
  const intervalRef   = useRef(null);
  const startTimeRef  = useRef(null);

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
              setFocusMin(t => t + elapsed);
              toast.success('🎯 Focus session complete! Take a break.', { duration: 5000 });
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

  const mins         = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs         = (timeLeft % 60).toString().padStart(2, '0');
  const total        = durations[mode];
  const progress     = ((total - timeLeft) / total) * 100;
  const currentMode  = MODES[mode];
  const circumference = 2 * Math.PI * 110;
  const dashOffset   = circumference - (progress / 100) * circumference;

  return (
    <div className="page" style={{ height: '100%', overflowY: 'auto' }}>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="page-title">Focus Mode</h1>
        <p className="page-subtitle" style={{ marginBottom: 0 }}>Pomodoro-powered deep work sessions</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

        {/* ── Main Timer Card ── */}
        <div
          className="xl:col-span-2 rounded-3xl p-8 flex flex-col items-center"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          {/* Mode Tabs */}
          <div
            className="flex gap-1 mb-10 p-1 rounded-2xl w-full max-w-sm"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            {Object.entries(MODES).map(([key, val]) => (
              <button
                key={key}
                onClick={() => switchMode(key)}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all min-w-max px-3"
                style={mode === key ? {
                  background: val.color,
                  color: 'white',
                  boxShadow: `0 4px 12px ${val.color}55`,
                } : {
                  background: 'transparent',
                  color: 'var(--subtle)',
                }}
              >
                {val.label}
              </button>
            ))}
          </div>

          {/* SVG Timer Ring */}
          <div className="relative flex items-center justify-center mb-8">
            {/* Ambient glow */}
            <div
              className="absolute rounded-full transition-all duration-1000"
              style={{
                width: 260, height: 260,
                background: `radial-gradient(circle, ${currentMode.color}18 0%, transparent 70%)`,
                filter: running ? `blur(20px)` : 'blur(30px)',
                opacity: running ? 1 : 0.4,
              }}
            />
            <svg width="260" height="260" viewBox="0 0 260 260" style={{ display: 'block', overflow: 'visible', maxWidth: '100%' }}>
              <circle cx="130" cy="130" r="110" fill="none" stroke="var(--surface-2)" strokeWidth="10" />
              <circle
                cx="130" cy="130" r="110"
                fill="none"
                stroke={currentMode.color}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 130 130)"
                style={{
                  transition: 'stroke-dashoffset 1s linear',
                  filter: `drop-shadow(0 0 10px ${currentMode.color}99)`,
                }}
              />
            </svg>

            {/* Timer display */}
            <div className="absolute flex flex-col items-center">
              <div
                className="text-6xl font-bold tracking-tight"
                style={{ color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace" }}
              >
                {mins}:{secs}
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <div className="w-2 h-2 rounded-full" style={{ background: running ? currentMode.color : 'var(--subtle)' }} />
                <span className="text-sm font-semibold" style={{ color: running ? currentMode.color : 'var(--subtle)' }}>
                  {running ? currentMode.label : 'Paused'}
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-5">
            <button
              onClick={reset}
              className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:scale-105"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
            >
              <RotateCcw size={17} style={{ color: 'var(--muted)' }} />
            </button>

            <button
              onClick={() => setRunning(!running)}
              className="w-20 h-20 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${currentMode.color}, ${currentMode.color}bb)`,
                boxShadow: `0 8px 30px ${currentMode.color}55`,
              }}
            >
              {running
                ? <Pause size={30} style={{ color: 'white' }} />
                : <Play size={30} style={{ color: 'white', marginLeft: 3 }} />
              }
            </button>

            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
            >
              <Clock size={17} style={{ color: 'var(--subtle)' }} />
            </div>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="flex flex-col gap-4">
          {/* Session Stats */}
          <div
            className="rounded-2xl p-5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <h3 className="text-xs font-bold mb-4 tracking-wider" style={{ color: 'var(--subtle)' }}>TODAY'S STATS</h3>
            <div className="space-y-3">
              {[
                { label: 'Sessions Done', value: sessions, color: '#8b5cf6', icon: Crosshair },
                { label: 'Focus Minutes', value: totalFocusMin, color: '#22c55e', icon: Zap },
                { label: 'Mins Remaining', value: Math.ceil(timeLeft / 60), color: '#f59e0b', icon: Clock },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
                      <Icon size={14} style={{ color }} />
                    </div>
                    <span className="text-xs" style={{ color: 'var(--subtle)' }}>{label}</span>
                  </div>
                  <span className="text-lg font-bold" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Session Dots */}
          <div
            className="rounded-2xl p-5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <h3 className="text-xs font-bold mb-4 tracking-wider" style={{ color: 'var(--subtle)' }}>SESSION PROGRESS</h3>
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all"
                  style={i < sessions ? {
                    background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                    color: 'white',
                    boxShadow: '0 2px 10px #8b5cf655',
                  } : {
                    background: 'var(--surface-2)',
                    color: 'var(--subtle)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {i < sessions ? '✓' : i + 1}
                </div>
              ))}
            </div>
            <p className="text-xs mt-3" style={{ color: 'var(--subtle)' }}>
              {sessions >= 4 ? '🏆 Great work! Take a long break.' : `${4 - Math.min(sessions, 4)} more sessions until long break`}
            </p>
          </div>

          {/* Tips */}
          <div
            className="rounded-2xl p-5"
            style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent-panel)' }}
          >
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
              💡 <strong style={{ color: 'var(--text)' }}>Pomodoro Technique:</strong> Work 25 min, take a 5-min break. After 4 sessions, take a 15-min long break for maximum productivity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
