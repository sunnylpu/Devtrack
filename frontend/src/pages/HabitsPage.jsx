import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Plus, Flame, TrendingUp, CheckCircle2, X, Trophy, Target, Calendar, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const ICONS = ['🎯', '💪', '📚', '🏃', '💧', '🧘', '✍️', '🎸', '🌱', '🔥', '⭐', '🎨'];
const COLORS = ['#8b5cf6', '#6d28d9', '#22c55e', '#f59e0b', '#ef4444', '#d946ef', '#84cc16', '#f472b6'];
const FREQUENCIES = ['daily', 'weekdays', 'weekends', 'weekly'];

const hex2rgba = (color, alpha) =>
  color?.startsWith('var(') ? 'var(--accent-soft)' : `${color}${alpha}`;

const habitApi = {
  getAll: () => api.get('/habits'),
  getStats: () => api.get('/habits/stats'),
  create: (data) => api.post('/habits', data),
  checkIn: (id) => api.put(`/habits/${id}/checkin`),
  delete: (id) => api.delete(`/habits/${id}`),
};

function HabitCard({ habit, onCheckIn, onDelete }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const completedToday = habit.entries?.some((e) => {
    const d = new Date(e.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime() && e.completed;
  });

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const entry = habit.entries?.find((e) => {
      const ed = new Date(e.date);
      ed.setHours(0, 0, 0, 0);
      return ed.getTime() === d.getTime();
    });
    return { date: d, completed: entry?.completed || false };
  });

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div
      className="rounded-2xl p-5 transition-all duration-300"
      style={{
        background: 'var(--surface)',
        border: `1px solid ${completedToday ? `${habit.color}50` : 'var(--border)'}`,
        boxShadow: completedToday ? `0 4px 24px ${habit.color}22` : 'none',
      }}
    >
      {/* Top Row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: hex2rgba(habit.color, '22') }}
          >
            {habit.icon}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>{habit.name}</h3>
            <p className="text-xs capitalize mt-0.5" style={{ color: 'var(--subtle)' }}>{habit.frequency}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {completedToday && (
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${habit.color}22`, color: habit.color }}>
              ✓ Done
            </span>
          )}
          <button
            onClick={() => onDelete(habit._id)}
            className="w-7 h-7 rounded-lg flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity"
            style={{ background: 'var(--surface-2)' }}
          >
            <X size={12} style={{ color: 'var(--subtle)' }} />
          </button>
        </div>
      </div>

      {/* Last 7 days mini calendar */}
      <div className="mb-4">
        <div className="flex gap-1.5">
          {last7.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full h-8 rounded-lg transition-all"
                title={day.date.toDateString()}
                style={{
                  background: day.completed ? habit.color : 'var(--surface-2)',
                  opacity: day.completed ? 1 : 0.5,
                  boxShadow: day.completed ? `0 2px 8px ${habit.color}44` : 'none',
                }}
              />
              <span className="text-xs" style={{ color: 'var(--subtle)', fontSize: '9px' }}>
                {days[day.date.getDay()]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1.5 flex-1 rounded-xl px-3 py-2" style={{ background: 'var(--surface-2)' }}>
          <Flame size={13} style={{ color: '#f59e0b' }} />
          <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{habit.streak?.current || 0}</span>
          <span className="text-xs" style={{ color: 'var(--subtle)' }}>streak</span>
        </div>
        <div className="flex items-center gap-1.5 flex-1 rounded-xl px-3 py-2" style={{ background: 'var(--surface-2)' }}>
          <Trophy size={13} style={{ color: '#f59e0b' }} />
          <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{habit.streak?.longest || 0}</span>
          <span className="text-xs" style={{ color: 'var(--subtle)' }}>best</span>
        </div>
        <div className="flex items-center gap-1.5 flex-1 rounded-xl px-3 py-2" style={{ background: 'var(--surface-2)' }}>
          <TrendingUp size={13} style={{ color: '#22c55e' }} />
          <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{habit.completionRate || 0}%</span>
          <span className="text-xs" style={{ color: 'var(--subtle)' }}>rate</span>
        </div>
      </div>

      {/* Progress + Check-in */}
      <div className="space-y-2.5">
        <div className="flex justify-between text-xs" style={{ color: 'var(--subtle)' }}>
          <span>30-day progress</span>
          <span style={{ color: habit.color, fontWeight: 600 }}>{habit.completionRate || 0}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${habit.completionRate || 0}%`,
              background: `linear-gradient(90deg, ${habit.color}cc, ${habit.color})`,
              boxShadow: `0 0 8px ${habit.color}66`,
            }}
          />
        </div>
        <button
          onClick={() => onCheckIn(habit._id)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all mt-1"
          style={completedToday ? {
            background: hex2rgba(habit.color, '18'),
            color: habit.color,
            border: `1px solid ${habit.color}40`,
          } : {
            background: `linear-gradient(135deg, ${habit.color}, ${habit.color}cc)`,
            color: 'white',
            boxShadow: `0 4px 14px ${habit.color}44`,
          }}
        >
          <CheckCircle2 size={15} />
          {completedToday ? 'Completed Today ✓' : 'Check In'}
        </button>
      </div>
    </div>
  );
}

function CreateHabitModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [color, setColor] = useState('#8b5cf6');
  const [frequency, setFrequency] = useState('daily');
  const [description, setDescription] = useState('');

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-md rounded-2xl p-6 animate-fade-in" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 24px 80px rgba(0,0,0,0.4)' }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>New Habit</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--subtle)' }}>Build a new daily routine</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--surface-2)', color: 'var(--subtle)' }}
          >
            <X size={15} />
          </button>
        </div>

        <div className="space-y-4">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Morning run, Read 20 pages..."
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />

          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--muted)' }}>ICON</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(ic => (
                <button
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all"
                  style={{
                    background: icon === ic ? 'var(--accent-panel)' : 'var(--surface-2)',
                    border: icon === ic ? '1px solid var(--accent)' : '1px solid var(--border)',
                    transform: icon === ic ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--muted)' }}>COLOR</label>
            <div className="flex gap-2.5">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full transition-all"
                  style={{
                    background: c,
                    transform: color === c ? 'scale(1.25)' : 'scale(1)',
                    outline: color === c ? `2px solid ${c}` : 'none',
                    outlineOffset: '3px',
                    boxShadow: color === c ? `0 0 12px ${c}66` : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--muted)' }}>FREQUENCY</label>
            <div className="grid grid-cols-4 gap-1.5">
              {FREQUENCIES.map(f => (
                <button
                  key={f}
                  onClick={() => setFrequency(f)}
                  className="py-2 rounded-xl text-xs font-semibold capitalize transition-all"
                  style={{
                    background: frequency === f ? 'var(--accent-panel)' : 'var(--surface-2)',
                    color: frequency === f ? 'var(--accent)' : 'var(--subtle)',
                    border: frequency === f ? '1px solid var(--accent)' : '1px solid var(--border)',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--surface-2)', color: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (name) { onCreate({ name, icon, color, frequency, description }); onClose(); }
              else toast.error('Habit name is required');
            }}
            className="flex-1 py-3 rounded-xl text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))', color: 'white', boxShadow: '0 4px 16px var(--accent-panel)' }}
          >
            Create Habit
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HabitsPage() {
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: statsData, isLoading } = useQuery({
    queryKey: ['habits', 'stats'],
    queryFn: () => habitApi.getStats().then(r => r.data.data),
  });

  const habits = statsData?.habits || [];
  const stats = statsData?.stats || {};

  const createMutation = useMutation({
    mutationFn: habitApi.create,
    onSuccess: () => { queryClient.invalidateQueries(['habits']); toast.success('Habit created! 🎯'); },
  });

  const checkInMutation = useMutation({
    mutationFn: habitApi.checkIn,
    onSuccess: () => { queryClient.invalidateQueries(['habits']); toast.success('Check-in recorded! 🔥'); },
  });

  const deleteMutation = useMutation({
    mutationFn: habitApi.delete,
    onSuccess: () => { queryClient.invalidateQueries(['habits']); toast.success('Habit removed'); },
  });

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">Habit Tracker</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>{today}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))', color: 'white', boxShadow: '0 4px 16px var(--accent-panel)' }}
        >
          <Plus size={16} /> New Habit
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Target, label: 'Total Habits', value: stats.totalHabits ?? 0, color: 'var(--accent)', bg: 'var(--accent-soft)' },
          { icon: CheckCircle2, label: 'Done Today', value: stats.totalCompletedToday ?? 0, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
          { icon: Trophy, label: 'Longest Streak', value: `${stats.longestStreak ?? 0}d`, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          { icon: TrendingUp, label: 'Avg Rate', value: `${stats.averageCompletionRate ?? 0}%`, color: '#c084fc', bg: 'rgba(192,132,252,0.1)' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div
            key={label}
            className="rounded-2xl p-5 transition-all"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div className="text-2xl font-bold mb-1" style={{ color }}>{value}</div>
            <div className="text-xs font-medium" style={{ color: 'var(--subtle)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Habits Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-56 rounded-2xl" />)}
        </div>
      ) : habits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center text-4xl mb-6"
            style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent-panel)' }}
          >
            🎯
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>No habits yet</h3>
          <p className="text-sm mb-8 max-w-sm" style={{ color: 'var(--subtle)' }}>
            Start tracking your daily habits. Build streaks, stay consistent, and watch your progress grow over time.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))', color: 'white', boxShadow: '0 4px 20px var(--accent-panel)' }}
          >
            <Plus size={16} /> Create First Habit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {habits.map(habit => (
            <HabitCard
              key={habit._id}
              habit={habit}
              onCheckIn={id => checkInMutation.mutate(id)}
              onDelete={id => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}

      {showModal && (
        <CreateHabitModal
          onClose={() => setShowModal(false)}
          onCreate={data => createMutation.mutate(data)}
        />
      )}
    </div>
  );
}
