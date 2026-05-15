import { Trash2, ChevronRight, Clock } from 'lucide-react';
import { format } from 'date-fns';

const PRIORITY_STYLES = {
  urgent: { bg: 'rgba(248,113,113,0.1)', color: '#f87171' },
  high: { bg: 'rgba(251,146,60,0.1)', color: '#fb923c' },
  medium: { bg: 'rgba(250,204,21,0.1)', color: '#facc15' },
  low: { bg: 'rgba(74,222,128,0.1)', color: '#4ade80' },
};

export default function TaskCard({ task, onStatusChange, onDelete }) {
  const priorityStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium;
  const progress = task.subtaskProgress || 0;

  return (
    <div
      className="rounded-xl p-4 mb-3 cursor-pointer card-hover"
      style={{ background: '#1c2236', border: '1px solid #2a3250' }}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-semibold leading-tight flex-1 pr-2" style={{ color: '#e2e8f0' }}>
          {task.title}
        </h4>
        <button
          onClick={() => onDelete(task._id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-500/10"
          style={{ color: '#566082' }}
          onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
          onMouseLeave={e => e.currentTarget.style.color = '#566082'}
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Tags */}
      {task.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 3).map(t => (
            <span key={t} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(59,109,251,0.15)', color: '#3b6dfb' }}>
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Subtask progress */}
      {task.subtasks?.length > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1" style={{ color: '#566082' }}>
            <span>Subtasks</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: '#2a3250' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #3b6dfb, #7c3aed)' }} />
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
          <div className="flex items-center gap-1 text-xs" style={{ color: '#566082' }}>
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
          style={{ background: '#2a3250', color: '#566082' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,109,251,0.15)'; e.currentTarget.style.color = '#3b6dfb'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#2a3250'; e.currentTarget.style.color = '#566082'; }}
        >
          <ChevronRight size={12} /> Move Forward
        </button>
      )}
    </div>
  );
}
