import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Plus, Flame, TrendingUp, CheckCircle2, X, Trophy, Target, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const ICONS = ['🎯', '💪', '📚', '🏃', '💧', '🧘', '✍️', '🎸', '🌱', '🔥', '⭐', '🎨'];
const COLORS = ['#3b6dfb', '#7c3aed', '#4ade80', '#fb923c', '#f87171', '#facc15', '#22d3ee', '#f472b6'];
const FREQUENCIES = ['daily', 'weekdays', 'weekends', 'weekly'];

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
        background: '#141827',
        border: `1px solid ${completedToday ? habit.color + '40' : '#2a3250'}`,
        boxShadow: completedToday ? `0 0 20px ${habit.color}15` : 'none',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ background: habit.color + '20' }}
          >
            {habit.icon}
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: '#e2e8f0' }}>{habit.name}</h3>
            <p className="text-xs" style={{ color: '#566082' }}>{habit.frequency}</p>
          </div>
        </div>
        <button
          onClick={() => onDelete(habit._id)}
          className="p-1 rounded opacity-50 hover:opacity-100"
          style={{ color: '#566082' }}
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
              background: day.completed ? habit.color : '#1c2236',
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
              <Flame size={14} style={{ color: '#fb923c' }} />
              <span className="text-sm font-bold" style={{ color: '#e2e8f0' }}>
                {habit.streak?.current || 0}
              </span>
            </div>
            <p className="text-xs" style={{ color: '#566082' }}>Streak</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1">
              <Trophy size={14} style={{ color: '#facc15' }} />
              <span className="text-sm font-bold" style={{ color: '#e2e8f0' }}>
                {habit.streak?.longest || 0}
              </span>
            </div>
            <p className="text-xs" style={{ color: '#566082' }}>Best</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1">
              <TrendingUp size={14} style={{ color: '#4ade80' }} />
              <span className="text-sm font-bold" style={{ color: '#e2e8f0' }}>
                {habit.completionRate || 0}%
              </span>
            </div>
            <p className="text-xs" style={{ color: '#566082' }}>Rate</p>
          </div>
        </div>

        {/* Check-in button */}
        <button
          onClick={() => onCheckIn(habit._id)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          style={completedToday ? {
            background: habit.color + '25',
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
        <div className="flex justify-between text-xs mb-1" style={{ color: '#566082' }}>
          <span>30-day progress</span>
          <span>{habit.completionRate || 0}%</span>
        </div>
        <div className="h-1.5 rounded-full" style={{ background: '#1c2236' }}>
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
  const [color, setColor] = useState('#3b6dfb');
  const [frequency, setFrequency] = useState('daily');
  const [description, setDescription] = useState('');

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-md rounded-2xl p-6 animate-fade-in" style={{ background: '#141827', border: '1px solid #2a3250' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold" style={{ color: '#e2e8f0' }}>New Habit</h3>
          <button onClick={onClose} style={{ color: '#566082' }}><X size={18} /></button>
        </div>

        <div className="space-y-4">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Habit name (e.g. Morning coding, Read 20 pages)"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{ background: '#1c2236', border: '1px solid #2a3250', color: '#e2e8f0' }}
            onFocus={e => e.target.style.borderColor = '#3b6dfb'}
            onBlur={e => e.target.style.borderColor = '#2a3250'}
          />

          <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{ background: '#1c2236', border: '1px solid #2a3250', color: '#e2e8f0' }}
          />

          {/* Icon picker */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#94a3b8' }}>Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(ic => (
                <button
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all"
                  style={{ background: icon === ic ? 'rgba(59,109,251,0.2)' : '#1c2236', border: icon === ic ? '1px solid #3b6dfb' : '1px solid #2a3250' }}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#94a3b8' }}>Color</label>
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
            <label className="block text-xs font-medium mb-2" style={{ color: '#94a3b8' }}>Frequency</label>
            <div className="flex gap-2">
              {FREQUENCIES.map(f => (
                <button
                  key={f}
                  onClick={() => setFrequency(f)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize"
                  style={{
                    background: frequency === f ? 'rgba(59,109,251,0.2)' : '#1c2236',
                    color: frequency === f ? '#3b6dfb' : '#566082',
                    border: frequency === f ? '1px solid #3b6dfb' : '1px solid #2a3250',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm" style={{ background: '#1c2236', color: '#566082' }}>
            Cancel
          </button>
          <button
            onClick={() => { if(name) { onCreate({ name, icon, color, frequency, description }); onClose(); } else toast.error('Name required'); }}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #3b6dfb, #7c3aed)', color: 'white' }}
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
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#e2e8f0' }}>Habit Tracker</h1>
          <p className="text-sm" style={{ color: '#566082' }}>{today}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg, #3b6dfb, #7c3aed)', color: 'white' }}
        >
          <Plus size={16} /> New Habit
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Target, label: 'Total Habits', value: stats.totalHabits ?? 0, color: '#3b6dfb' },
          { icon: CheckCircle2, label: 'Completed Today', value: stats.totalCompletedToday ?? 0, color: '#4ade80' },
          { icon: Trophy, label: 'Longest Streak', value: `${stats.longestStreak ?? 0} days`, color: '#facc15' },
          { icon: TrendingUp, label: 'Avg Completion', value: `${stats.averageCompletionRate ?? 0}%`, color: '#a78bfa' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-2xl p-5" style={{ background: '#141827', border: '1px solid #2a3250' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: color + '20' }}>
                <Icon size={18} style={{ color }} />
              </div>
            </div>
            <div className="text-2xl font-bold mb-1" style={{ color: '#e2e8f0' }}>{value}</div>
            <div className="text-xs" style={{ color: '#566082' }}>{label}</div>
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
          <h3 className="text-xl font-bold mb-2" style={{ color: '#e2e8f0' }}>No habits yet</h3>
          <p className="mb-6 text-sm" style={{ color: '#566082' }}>
            Start tracking daily habits to build consistency and see your streaks grow!
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 rounded-xl font-semibold text-sm"
            style={{ background: 'linear-gradient(135deg, #3b6dfb, #7c3aed)', color: 'white' }}
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
