export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="text-center py-16 animate-fade-in">
      {Icon && (
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent-soft)' }}
        >
          <Icon size={36} style={{ color: 'var(--border)' }} />
        </div>
      )}
      <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>{title}</h3>
      {description && (
        <p className="text-sm max-w-sm mx-auto mb-6" style={{ color: 'var(--subtle)' }}>{description}</p>
      )}
      {action}
    </div>
  );
}
