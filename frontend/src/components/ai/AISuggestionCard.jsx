import { Sparkles } from 'lucide-react';

export default function AISuggestionCard({ suggestion, onAccept }) {
  const priorityColors = {
    high: 'var(--danger)',
    medium: 'var(--warning)',
    low: 'var(--success)',
  };
  const priorityBg = {
    high: 'rgba(239,68,68,0.12)',
    medium: 'rgba(245,158,11,0.12)',
    low: 'rgba(34,197,94,0.12)',
  };

  return (
    <div
      className="rounded-xl p-4 card-hover group"
      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: 'rgba(167,139,250,0.15)' }}
        >
          <Sparkles size={14} style={{ color: 'var(--accent)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>
            {suggestion.title}
          </h4>
          {suggestion.reason && (
            <p className="text-xs mb-2" style={{ color: 'var(--subtle)' }}>
              {suggestion.reason}
            </p>
          )}
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
              style={{
                background: priorityBg[suggestion.priority] || 'rgba(245,158,11,0.12)',
                color: priorityColors[suggestion.priority] || 'var(--warning)',
              }}
            >
              {suggestion.priority}
            </span>
            {onAccept && (
              <button
                onClick={() => onAccept(suggestion)}
                className="text-xs px-2 py-0.5 rounded-lg font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
              >
                + Add as task
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
