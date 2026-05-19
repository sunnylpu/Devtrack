import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Plus, Flame, TrendingUp, CheckCircle2, X, Trophy, Target, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const ICONS = ['🎯', '💪', '📚', '🏃', '💧', '🧘', '✍️', '🎸', '🌱', '🔥', '⭐', '🎨'];
const COLORS = ['#8b5cf6', '#6d28d9', '#22c55e', '#f59e0b', '#ef4444', '#d946ef', '#84cc16', '#f472b6'];
const FREQUENCIES = ['daily', 'weekdays', 'weekends', 'weekly'];

const transparentize = (color, alpha = '20') => (
  color?.startsWith('var(') ? 'var(--accent-soft)' : `${color}${alpha}`
);

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

  // Build last 7 days view
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

  return (
    <div
      className="rounded-2xl p-5 card-hover"
      style={{
        background: 'var(--surface)',
        border: `1px solid ${completedToday ? transparentize(habit.color, '40') : 'var(--border)'}`,
        boxShadow: completedToday ? `0 0 20px ${transparentize(habit.color, '30')}` : 'none',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ background: transparentize(habit.color) }}
          >
            {habit.icon}
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--text)' }}>{habit.name}</h3>
            <p className="text-xs" style={{ color: 'var(--subtle)' }}>{habit.frequency}</p>
          </div>
        </div>
        <button
          onClick={() => onDelete(habit._id)}
          className="p-1 rounded opacity-50 hover:opacity-100"
          style={{ color: 'var(--subtle)' }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Last 7 days */}
      <div className="flex gap-1.5 mb-4">
        {last7.map((day, i) => (
          <div
            key={i}
            title={day.date.toDateString()}
            className="flex-1 h-7 rounded-md transition-all"
            style={{
              background: day.completed ? habit.color : 'var(--surface-2)',
              opacity: day.completed ? 1 : 0.4,
            }}
          />
        ))}
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4">
          <div className="text-center">
            <div className="flex items-center gap-1">
              <Flame size={14} style={{ color: 'var(--warning)' }} />
              <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                {habit.streak?.current || 0}
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--subtle)' }}>Streak</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1">
              <Trophy size={14} style={{ color: 'var(--warning)' }} />
              <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                {habit.streak?.longest || 0}
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--subtle)' }}>Best</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1">
              <TrendingUp size={14} style={{ color: 'var(--success)' }} />
              <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                {habit.completionRate || 0}%
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--subtle)' }}>Rate</p>
          </div>
        </div>

        {/* Check-in button */}
        <button
          onClick={() => onCheckIn(habit._id)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          style={completedToday ? {
            background: transparentize(habit.color, '25'),
            color: habit.color,
            border: `1px solid ${habit.color}50`,
          } : {
            background: habit.color,
            color: 'white',
          }}
        >
          <CheckCircle2 size={15} />
          {completedToday ? 'Done ✓' : 'Check In'}
        </button>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--subtle)' }}>
          <span>30-day progress</span>
          <span>{habit.completionRate || 0}%</span>
        </div>
        <div className="h-1.5 rounded-full" style={{ background: 'var(--surface-2)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${habit.completionRate || 0}%`, background: habit.color }}
          />
        </div>
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
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-md rounded-2xl p-6 animate-fade-in" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>New Habit</h3>
          <button onClick={onClose} style={{ color: 'var(--subtle)' }}><X size={18} /></button>
        </div>

        <div className="space-y-4">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Habit name (e.g. Morning coding, Read 20 pages)"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />

          <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />

          {/* Icon picker */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--muted)' }}>Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(ic => (
                <button
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all"
                  style={{ background: icon === ic ? 'var(--accent-panel)' : 'var(--surface-2)', border: icon === ic ? '1px solid var(--accent)' : '1px solid var(--border)' }}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--muted)' }}>Color</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full transition-all"
                  style={{
                    background: c,
                    transform: color === c ? 'scale(1.3)' : 'scale(1)',
                    outline: color === c ? `2px solid ${c}` : 'none',
                    outlineOffset: '2px',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--muted)' }}>Frequency</label>
            <div className="flex gap-2">
              {FREQUENCIES.map(f => (
                <button
                  key={f}
                  onClick={() => setFrequency(f)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize"
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
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm" style={{ background: 'var(--surface-2)', color: 'var(--subtle)' }}>
            Cancel
          </button>
          <button
            onClick={() => { if(name) { onCreate({ name, icon, color, frequency, description }); onClose(); } else toast.error('Name required'); }}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))', color: 'white' }}
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
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text)' }}>Habit Tracker</h1>
          <p className="text-sm" style={{ color: 'var(--subtle)' }}>{today}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))', color: 'white' }}
        >
          <Plus size={16} /> New Habit
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Target, label: 'Total Habits', value: stats.totalHabits ?? 0, color: 'var(--accent)' },
          { icon: CheckCircle2, label: 'Completed Today', value: stats.totalCompletedToday ?? 0, color: 'var(--success)' },
          { icon: Trophy, label: 'Longest Streak', value: `${stats.longestStreak ?? 0} days`, color: 'var(--warning)' },
          { icon: TrendingUp, label: 'Avg Completion', value: `${stats.averageCompletionRate ?? 0}%`, color: 'var(--accent)' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: transparentize(color) }}>
                <Icon size={18} style={{ color }} />
              </div>
            </div>
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text)' }}>{value}</div>
            <div className="text-xs" style={{ color: 'var(--subtle)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Habits grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-52 rounded-2xl" />)}
        </div>
      ) : habits.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>No habits yet</h3>
          <p className="mb-6 text-sm" style={{ color: 'var(--subtle)' }}>
            Start tracking daily habits to build consistency and see your streaks grow!
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 rounded-xl font-semibold text-sm"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))', color: 'white' }}
          >
            <Plus size={16} className="inline mr-2" /> Create First Habit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
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
