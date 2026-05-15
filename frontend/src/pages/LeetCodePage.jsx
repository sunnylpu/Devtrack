import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leetcodeService } from '../services';
import { useAuthStore } from '../store/authStore';
import {
  Code2, Trophy, Flame, Award, ExternalLink, CheckCircle2,
  Clock, Link2, Unlink, Loader2, BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const DIFF_STYLES = {
  easy: { bg: 'rgba(74,222,128,0.12)', color: '#4ade80', label: 'Easy' },
  medium: { bg: 'rgba(250,204,21,0.12)', color: '#facc15', label: 'Medium' },
  hard: { bg: 'rgba(248,113,113,0.12)', color: '#f87171', label: 'Hard' },
};

function StatRing({ solved, total, color, label, size = 100 }) {
  const pct = total > 0 ? (solved / total) * 100 : 0;
  const r = (size - 12) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1c2236" strokeWidth="8" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.8s ease', filter: `drop-shadow(0 0 6px ${color}60)` }}
        />
        <text x="50%" y="48%" textAnchor="middle" fill={color} fontSize="18" fontWeight="bold" fontFamily="'JetBrains Mono', monospace">
          {solved}
        </text>
        <text x="50%" y="68%" textAnchor="middle" fill="#566082" fontSize="10">
          / {total}
        </text>
      </svg>
      <span className="text-xs font-semibold" style={{ color }}>{label}</span>
    </div>
  );
}

function SubmissionHeatmap({ calendar = [] }) {
  if (!calendar.length) return <p className="text-sm" style={{ color: '#566082' }}>No submission data</p>;

  // Group by weeks (last ~52 weeks)
  const last365 = calendar.slice(-365);
  const weeks = [];
  for (let i = 0; i < last365.length; i += 7) {
    weeks.push(last365.slice(i, i + 7));
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-[3px]">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day, di) => (
              <div
                key={di}
                title={`${day.date}: ${day.count} submissions`}
                className="w-[11px] h-[11px] rounded-[2px] transition-all hover:scale-150"
                style={{
                  background: day.count === 0 ? '#1c2236'
                    : day.count < 3 ? 'rgba(251,146,60,0.3)'
                    : day.count < 6 ? 'rgba(251,146,60,0.6)'
                    : day.count < 10 ? '#fb923c' : '#f97316',
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-3 text-xs" style={{ color: '#566082' }}>
        <span>Less</span>
        {['#1c2236', 'rgba(251,146,60,0.3)', 'rgba(251,146,60,0.6)', '#fb923c', '#f97316'].map((c, i) => (
          <div key={i} className="w-[11px] h-[11px] rounded-[2px]" style={{ background: c }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

export default function LeetCodePage() {
  const { user, fetchMe } = useAuthStore();
  const queryClient = useQueryClient();
  const [inputUsername, setInputUsername] = useState('');
  const lcUsername = user?.leetcode?.username;

  // Connect mutation
  const connectMutation = useMutation({
    mutationFn: (username) => leetcodeService.connect(username),
    onSuccess: () => {
      fetchMe();
      toast.success('LeetCode connected!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'User not found on LeetCode');
    },
  });

  // Disconnect mutation
  const disconnectMutation = useMutation({
    mutationFn: () => leetcodeService.disconnect(),
    onSuccess: () => {
      fetchMe();
      queryClient.removeQueries({ queryKey: ['leetcode'] });
      toast.success('LeetCode disconnected');
    },
  });

  // Queries (only run when connected)
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['leetcode', 'profile', lcUsername],
    queryFn: () => leetcodeService.getProfile(lcUsername).then(r => r.data.data),
    enabled: !!lcUsername,
  });

  const { data: calendarData } = useQuery({
    queryKey: ['leetcode', 'calendar', lcUsername],
    queryFn: () => leetcodeService.getCalendar(lcUsername).then(r => r.data.data),
    enabled: !!lcUsername,
  });

  const { data: recentData } = useQuery({
    queryKey: ['leetcode', 'recent', lcUsername],
    queryFn: () => leetcodeService.getRecent(lcUsername).then(r => r.data.data),
    enabled: !!lcUsername,
  });

  const handleConnect = () => {
    const username = inputUsername.trim();
    if (!username) return toast.error('Enter your LeetCode username');
    connectMutation.mutate(username);
  };

  // ─── Not Connected ─────────────────────────────────────────────────────────
  if (!lcUsername) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-center max-w-md animate-fade-in">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.2)' }}
          >
            <Code2 size={40} style={{ color: '#fb923c' }} />
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: '#e2e8f0' }}>Connect LeetCode</h2>
          <p className="mb-6 text-sm" style={{ color: '#566082' }}>
            Enter your LeetCode username to track your solving progress, view submission heatmap, and recent accepted solutions.
          </p>
          <div className="flex gap-2 max-w-sm mx-auto">
            <input
              value={inputUsername}
              onChange={e => setInputUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleConnect()}
              placeholder="e.g. sunnytyagi"
              className="input flex-1"
              autoFocus
            />
            <button
              onClick={handleConnect}
              disabled={connectMutation.isPending}
              className="px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #fb923c, #f97316)', color: 'white' }}
            >
              {connectMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Link2 size={16} />}
              Connect
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (profileLoading) {
    return (
      <div className="p-8">
        <div className="skeleton h-8 w-48 rounded-xl mb-6" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton h-40 rounded-xl" />)}
        </div>
      </div>
    );
  }

  // ─── Connected View ─────────────────────────────────────────────────────────
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {profile?.avatar && (
            <img src={profile.avatar} alt={profile.username} className="w-12 h-12 rounded-full border-2" style={{ borderColor: '#fb923c' }} />
          )}
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#e2e8f0' }}>
              {profile?.username || lcUsername} <span style={{ color: '#fb923c' }}>on LeetCode</span>
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <a
                href={`https://leetcode.com/u/${lcUsername}`}
                target="_blank" rel="noreferrer"
                className="text-sm flex items-center gap-1" style={{ color: '#fb923c' }}
              >
                View Profile <ExternalLink size={12} />
              </a>
              {profile?.ranking > 0 && (
                <span className="text-xs flex items-center gap-1" style={{ color: '#566082' }}>
                  <Trophy size={11} /> Rank #{profile.ranking.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => disconnectMutation.mutate()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
          style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171' }}
        >
          <Unlink size={14} /> Disconnect
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Total Solved */}
        <div className="card flex items-center gap-4">
          <div className="stat-icon" style={{ background: 'rgba(59,109,251,0.15)' }}>
            <BarChart3 size={20} style={{ color: '#3b6dfb' }} />
          </div>
          <div>
            <p className="text-2xl font-bold" style={{ color: '#e2e8f0' }}>{profile?.solved?.all || 0}</p>
            <p className="text-xs" style={{ color: '#566082' }}>Total Solved</p>
          </div>
        </div>
        {/* Easy */}
        <div className="card flex items-center gap-4">
          <div className="stat-icon" style={{ background: DIFF_STYLES.easy.bg }}>
            <CheckCircle2 size={20} style={{ color: DIFF_STYLES.easy.color }} />
          </div>
          <div>
            <p className="text-2xl font-bold" style={{ color: DIFF_STYLES.easy.color }}>{profile?.solved?.easy || 0}</p>
            <p className="text-xs" style={{ color: '#566082' }}>Easy</p>
          </div>
        </div>
        {/* Medium */}
        <div className="card flex items-center gap-4">
          <div className="stat-icon" style={{ background: DIFF_STYLES.medium.bg }}>
            <Flame size={20} style={{ color: DIFF_STYLES.medium.color }} />
          </div>
          <div>
            <p className="text-2xl font-bold" style={{ color: DIFF_STYLES.medium.color }}>{profile?.solved?.medium || 0}</p>
            <p className="text-xs" style={{ color: '#566082' }}>Medium</p>
          </div>
        </div>
        {/* Hard */}
        <div className="card flex items-center gap-4">
          <div className="stat-icon" style={{ background: DIFF_STYLES.hard.bg }}>
            <Award size={20} style={{ color: DIFF_STYLES.hard.color }} />
          </div>
          <div>
            <p className="text-2xl font-bold" style={{ color: DIFF_STYLES.hard.color }}>{profile?.solved?.hard || 0}</p>
            <p className="text-xs" style={{ color: '#566082' }}>Hard</p>
          </div>
        </div>
      </div>

      {/* Difficulty Ring Charts */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: '#141827', border: '1px solid #2a3250' }}>
        <h3 className="font-semibold mb-6 text-xs tracking-wider" style={{ color: '#94a3b8' }}>PROGRESS BREAKDOWN</h3>
        <div className="flex justify-center gap-12 flex-wrap">
          <StatRing solved={profile?.solved?.easy || 0} total={845} color="#4ade80" label="Easy" />
          <StatRing solved={profile?.solved?.medium || 0} total={1775} color="#facc15" label="Medium" />
          <StatRing solved={profile?.solved?.hard || 0} total={760} color="#f87171" label="Hard" />
        </div>
      </div>

      {/* Submission Heatmap */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: '#141827', border: '1px solid #2a3250' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-xs tracking-wider" style={{ color: '#94a3b8' }}>SUBMISSION CALENDAR</h3>
          {calendarData?.totalActiveDays > 0 && (
            <span className="text-sm font-semibold" style={{ color: '#fb923c' }}>
              {calendarData.totalActiveDays} active days
            </span>
          )}
        </div>
        <SubmissionHeatmap calendar={calendarData?.calendar || []} />
      </div>

      {/* Recent Submissions + Badges */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Accepted */}
        <div className="rounded-2xl p-6" style={{ background: '#141827', border: '1px solid #2a3250' }}>
          <h3 className="font-semibold mb-4 text-xs tracking-wider" style={{ color: '#94a3b8' }}>RECENT ACCEPTED</h3>
          <div className="space-y-3">
            {(recentData?.submissions || []).map((sub, i) => (
              <div key={i} className="flex items-start gap-3 group">
                <CheckCircle2 size={14} style={{ color: '#4ade80', marginTop: 3, flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <a
                    href={sub.url}
                    target="_blank" rel="noreferrer"
                    className="text-sm font-medium truncate block hover:underline"
                    style={{ color: '#e2e8f0' }}
                  >
                    {sub.title}
                  </a>
                  <div className="flex items-center gap-2 text-xs mt-0.5" style={{ color: '#566082' }}>
                    <span className="px-1.5 py-0.5 rounded" style={{ background: '#1c2236' }}>{sub.language}</span>
                    <span>{format(new Date(sub.timestamp), 'MMM d, HH:mm')}</span>
                  </div>
                </div>
              </div>
            ))}
            {(!recentData?.submissions || recentData.submissions.length === 0) && (
              <p className="text-sm" style={{ color: '#566082' }}>No recent submissions</p>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="rounded-2xl p-6" style={{ background: '#141827', border: '1px solid #2a3250' }}>
          <h3 className="font-semibold mb-4 text-xs tracking-wider" style={{ color: '#94a3b8' }}>BADGES</h3>
          {profile?.badges?.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {profile.badges.map((badge, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: '#1c2236', border: '1px solid #2a3250' }}
                >
                  {badge.icon && <img src={badge.icon} alt={badge.name} className="w-8 h-8" />}
                  <span className="text-xs font-medium" style={{ color: '#e2e8f0' }}>{badge.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: '#566082' }}>No badges earned yet. Keep solving!</p>
          )}
        </div>
      </div>
    </div>
  );
}
