import { Trash2, ChevronRight, Clock } from 'lucide-react';
import { format } from 'date-fns';

const PRIORITY_STYLES = {
  urgent: { bg: 'rgba(248,113,113,0.1)', color: 'var(--danger)' },
  high: { bg: 'rgba(251,146,60,0.1)', color: 'var(--warning)' },
  medium: { bg: 'rgba(250,204,21,0.1)', color: 'var(--warning)' },
  low: { bg: 'rgba(74,222,128,0.1)', color: 'var(--success)' },
};

export default function TaskCard({ task, onStatusChange, onDelete }) {
  const priorityStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium;
  const progress = task.subtaskProgress || 0;

  return (
    <div
      className="rounded-xl p-4 mb-3 cursor-pointer card-hover"
      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-semibold leading-tight flex-1 pr-2" style={{ color: 'var(--text)' }}>
          {task.title}
        </h4>
        <button
          onClick={() => onDelete(task._id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-500/10"
          style={{ color: 'var(--subtle)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--subtle)'}
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Tags */}
      {task.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 3).map(t => (
            <span key={t} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Subtask progress */}
      {task.subtasks?.length > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--subtle)' }}>
            <span>Subtasks</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, var(--accent), var(--accent-strong))' }} />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: priorityStyle.bg, color: priorityStyle.color }}
        >
          {task.priority}
        </span>
        {task.deadline && (
          <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--subtle)' }}>
            <Clock size={11} />
            {format(new Date(task.deadline), 'MMM d')}
          </div>
        )}
      </div>

      {/* Quick status change */}
      {task.status !== 'completed' && (
        <button
          onClick={() => {
            const next = { 'todo': 'in-progress', 'in-progress': 'review', 'review': 'completed' };
            onStatusChange(task._id, next[task.status]);
          }}
          className="mt-3 w-full text-xs py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all"
          style={{ background: 'var(--border)', color: 'var(--subtle)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-soft)'; e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--border)'; e.currentTarget.style.color = 'var(--subtle)'; }}
        >
          <ChevronRight size={12} /> Move Forward
        </button>
      )}
    </div>
  );
}
