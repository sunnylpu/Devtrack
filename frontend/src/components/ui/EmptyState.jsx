export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="text-center py-16 animate-fade-in">
      {Icon && (
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(59,109,251,0.06)', border: '1px solid rgba(59,109,251,0.1)' }}
        >
          <Icon size={36} style={{ color: '#2a3250' }} />
        </div>
      )}
      <h3 className="text-lg font-bold mb-2" style={{ color: '#e2e8f0' }}>{title}</h3>
      {description && (
        <p className="text-sm max-w-sm mx-auto mb-6" style={{ color: '#566082' }}>{description}</p>
      )}
      {action}
    </div>
  );
}
