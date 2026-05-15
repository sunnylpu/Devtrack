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
            background: dangerous ? 'rgba(248,113,113,0.1)' : 'rgba(59,109,251,0.1)',
            border: `1px solid ${dangerous ? 'rgba(248,113,113,0.2)' : 'rgba(59,109,251,0.2)'}`,
          }}
        >
          <AlertTriangle size={24} style={{ color: dangerous ? '#f87171' : '#3b6dfb' }} />
        </div>
        <h3 className="text-lg font-bold mb-2" style={{ color: '#e2e8f0' }}>{title}</h3>
        <p className="text-sm mb-6" style={{ color: '#566082' }}>{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: '#1c2236', border: '1px solid #2a3250', color: '#94a3b8' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: dangerous
                ? 'linear-gradient(135deg, #f87171, #ef4444)'
                : 'linear-gradient(135deg, #3b6dfb, #7c3aed)',
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
