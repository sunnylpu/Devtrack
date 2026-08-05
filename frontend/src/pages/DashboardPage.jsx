import { useQuery } from '@tanstack/react-query';
import { analyticsService, aiService } from '../services';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard, TrendingUp, CheckCircle2, AlertTriangle,
  Sparkles, Lightbulb
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';

const PIE_COLORS = ['var(--accent)', 'var(--accent-2)', '#c084fc', 'var(--success)'];
const STATUS_LABELS = { todo: 'To Do', 'in-progress': 'In Progress', review: 'Review', completed: 'Completed' };

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => analyticsService.getDashboard().then(r => r.data.data),
  });

  const { data: summaryData } = useQuery({
    queryKey: ['ai', 'weekly-summary'],
    queryFn: () => aiService.getWeeklySummary().then(r => r.data.data),
  });

  const { data: tipsData } = useQuery({
    queryKey: ['ai', 'tips'],
    queryFn: () => aiService.getProductivityTips().then(r => r.data.data),
  });

  const overview = analyticsData?.overview || {};
  const charts = analyticsData?.charts || {};
  const summaryText = summaryData?.summary || '';
  const summaryStats = summaryData?.stats || {};
  const tips = tipsData?.tips || [];

  // Transform backend chart data for Recharts
  const trendData = (charts.completionTrend || []).map(d => ({
    date: d._id,
    completed: d.count,
  }));

  const statusData = (charts.tasksByStatus || []).map(d => ({
    name: STATUS_LABELS[d._id] || d._id,
    value: d.count,
  }));

  const statCards = [
    {
      label: 'Total Tasks',
      value: overview.totalTasks ?? 0,
      sub: 'all time',
      icon: LayoutDashboard,
      gradient: 'linear-gradient(135deg, var(--accent-soft), var(--accent-soft))',
      iconBg: 'var(--accent-panel)',
      iconColor: 'var(--accent)',
      glow: 'card-accent',
    },
    {
      label: 'Completed',
      value: overview.completedTasks ?? 0,
      sub: `${overview.completedThisWeek ?? 0} this week`,
      icon: CheckCircle2,
      gradient: 'linear-gradient(135deg, rgba(74,222,128,0.15), rgba(74,222,128,0.05))',
      iconBg: 'rgba(74,222,128,0.2)',
      iconColor: 'var(--success)',
      glow: 'card-green',
    },
    {
      label: 'Productivity',
      value: `${overview.productivityScore ?? 0}%`,
      sub: 'completion rate',
      icon: TrendingUp,
      gradient: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(124,58,237,0.05))',
      iconBg: 'rgba(124,58,237,0.2)',
      iconColor: 'var(--accent)',
      glow: 'card-purple',
      badge: overview.productivityScore > 0 ? `↑ ${overview.productivityScore}%` : null,
      badgeColor: 'var(--success)',
    },
    {
      label: 'Overdue',
      value: overview.overdueTasks ?? 0,
      sub: 'need attention',
      icon: AlertTriangle,
      gradient: 'linear-gradient(135deg, rgba(251,146,60,0.15), rgba(251,146,60,0.05))',
      iconBg: 'rgba(251,146,60,0.2)',
      iconColor: 'var(--warning)',
      glow: 'card-orange',
    },
  ];

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  };

  return (
    <div className="page animate-fade-in" style={{ height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="page-title">
          {greeting()}, <span className="gradient-text">{user?.name || 'Developer'}</span> 👋
        </h1>
        <p className="page-subtitle" style={{ marginBottom: 0 }}>
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {isLoading
          ? [1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 130, borderRadius: 16 }} />)
          : statCards.map(({ label, value, sub, icon: Icon, gradient, iconBg, iconColor, glow, badge, badgeColor }) => (
              <div key={label} className={`card ${glow}`} style={{ background: gradient }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="stat-icon" style={{ background: iconBg }}>
                    <Icon size={20} style={{ color: iconColor, position: 'relative', zIndex: 1 }} />
                  </div>
                  {badge && (
                    <span className="badge" style={{ background: 'rgba(74,222,128,0.1)', color: badgeColor, fontSize: 11 }}>
                      {badge}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', lineHeight: 1, marginBottom: 4 }}>
                  {value}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 12, color: 'var(--subtle)' }}>{sub}</div>
              </div>
            ))
        }
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-8">
        {/* Area Chart */}
        <div className="card card-chart lg:col-span-3">
          <p className="section-title">TASK COMPLETION TREND — LAST 30 DAYS</p>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="var(--subtle)" tick={{ fill: 'var(--subtle)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--subtle)" tick={{ fill: 'var(--subtle)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)', fontSize: 13, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
                  labelStyle={{ color: 'var(--muted)' }}
                />
                <Area type="monotone" dataKey="completed" stroke="var(--accent)" strokeWidth={2.5} fill="url(#colorComp)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={36} style={{ color: 'var(--border)', marginBottom: 12 }} />
              <p style={{ color: 'var(--subtle)', fontSize: 14 }}>Complete tasks to see your trend</p>
            </div>
          )}
        </div>

        {/* Pie Chart */}
        <div className="card card-chart lg:col-span-2">
          <p className="section-title">TASK STATUS</p>
          {statusData.some(s => s.value > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)', fontSize: 13 }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--subtle)', fontSize: 14 }}>
              No tasks yet
            </div>
          )}
        </div>
      </div>

      {/* AI Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* AI Summary */}
        <div className="card card-purple">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div className="stat-icon" style={{ background: 'rgba(124,58,237,0.2)', width: 36, height: 36 }}>
              <Sparkles size={16} style={{ color: 'var(--accent)', position: 'relative', zIndex: 1 }} />
            </div>
            <p className="section-title" style={{ paddingBottom: 0 }}>AI WEEKLY SUMMARY</p>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7 }}>
            {summaryText || 'Keep pushing - every task completed is progress!'}
          </p>
          {summaryStats.completed !== undefined && (
            <div style={{ display: 'flex', gap: 32, marginTop: 20 }}>
              {[
                { label: 'Completed', value: summaryStats.completed ?? 0, color: 'var(--success)' },
                { label: 'Created', value: summaryStats.created ?? 0, color: 'var(--accent)' },
                { label: 'Overdue', value: summaryStats.overdue ?? 0, color: 'var(--danger)' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
                  <div style={{ fontSize: 12, color: 'var(--subtle)' }}>{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Productivity Tips */}
        <div className="card card-accent">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div className="stat-icon" style={{ background: 'rgba(250,204,21,0.2)', width: 36, height: 36 }}>
              <Lightbulb size={16} style={{ color: 'var(--warning)', position: 'relative', zIndex: 1 }} />
            </div>
            <p className="section-title" style={{ paddingBottom: 0 }}>PRODUCTIVITY TIPS</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {tips.length > 0 ? tips.slice(0, 3).map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span
                  style={{
                    width: 24, height: 24, borderRadius: 8, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700,
                    background: ['var(--accent-soft)', 'rgba(74,222,128,0.15)', 'rgba(251,146,60,0.15)'][i],
                    color: ['var(--accent)', 'var(--success)', 'var(--warning)'][i],
                  }}
                >
                  {i + 1}
                </span>
                <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.5 }}>{tip.tip || tip}</p>
              </div>
            )) : (
              <p style={{ color: 'var(--subtle)', fontSize: 13 }}>Loading tips...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
