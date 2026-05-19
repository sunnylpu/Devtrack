import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ title, message, onConfirm, onCancel, confirmText = 'Delete', dangerous = true }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-panel w-full max-w-sm text-center"
        onClick={e => e.stopPropagation()}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{
            background: dangerous ? 'rgba(248,113,113,0.1)' : 'var(--accent-soft)',
            border: `1px solid ${dangerous ? 'rgba(248,113,113,0.2)' : 'var(--accent-panel)'}`,
          }}
        >
          <AlertTriangle size={24} style={{ color: dangerous ? 'var(--danger)' : 'var(--accent)' }} />
        </div>
        <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>{title}</h3>
        <p className="text-sm mb-6" style={{ color: 'var(--subtle)' }}>{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--muted)' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: dangerous
                ? 'linear-gradient(135deg, var(--danger), #ef4444)'
                : 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
              color: 'white',
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
