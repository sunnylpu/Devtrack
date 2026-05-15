import { Sparkles } from 'lucide-react';

export default function AISuggestionCard({ suggestion, onAccept }) {
  const priorityColors = {
    high: '#f87171',
    medium: '#facc15',
    low: '#4ade80',
  };

  return (
    <div
      className="rounded-xl p-4 card-hover group"
      style={{ background: '#1c2236', border: '1px solid #2a3250' }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: 'rgba(167,139,250,0.15)' }}
        >
          <Sparkles size={14} style={{ color: '#a78bfa' }} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold mb-1" style={{ color: '#e2e8f0' }}>
            {suggestion.title}
          </h4>
          {suggestion.reason && (
            <p className="text-xs mb-2" style={{ color: '#566082' }}>
              {suggestion.reason}
            </p>
          )}
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
              style={{
                background: `${priorityColors[suggestion.priority] || '#facc15'}20`,
                color: priorityColors[suggestion.priority] || '#facc15',
              }}
            >
              {suggestion.priority}
            </span>
            {onAccept && (
              <button
                onClick={() => onAccept(suggestion)}
                className="text-xs px-2 py-0.5 rounded-lg font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(59,109,251,0.15)', color: '#3b6dfb' }}
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
