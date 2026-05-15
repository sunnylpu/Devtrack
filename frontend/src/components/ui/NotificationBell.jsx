import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../../services';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import { useRealTimeNotifications } from '../../hooks/useSocket';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getAll({ limit: 10 }).then(r => r.data.data),
    refetchInterval: 30000, // poll every 30s
  });

  // Real-time: invalidate on new notification
  useRealTimeNotifications(() => {
    queryClient.invalidateQueries(['notifications']);
  });

  const markReadMutation = useMutation({
    mutationFn: notificationService.markRead,
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  });

  const markAllReadMutation = useMutation({
    mutationFn: notificationService.markAllRead,
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  });

  const deleteMutation = useMutation({
    mutationFn: notificationService.delete,
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  });

  const notifications = notifData?.notifications || [];
  const unreadCount = notifications.filter(n => !n.read).length;

  const TYPE_ICONS = {
    task: '✅',
    reminder: '⏰',
    achievement: '🏆',
    ai: '🤖',
    system: '🔔',
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl transition-all"
        style={{ background: open ? 'rgba(59,109,251,0.15)' : 'transparent' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,109,251,0.15)'}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'transparent'; }}
      >
        <Bell size={20} style={{ color: unreadCount > 0 ? '#3b6dfb' : '#566082' }} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: '#f87171', color: 'white', fontSize: '10px' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Panel */}
          <div
            className="absolute right-0 top-12 w-96 rounded-2xl z-50 shadow-2xl overflow-hidden animate-fade-in"
            style={{ background: '#141827', border: '1px solid #2a3250' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#2a3250' }}>
              <div className="flex items-center gap-2">
                <Bell size={16} style={{ color: '#3b6dfb' }} />
                <h3 className="font-semibold text-sm" style={{ color: '#e2e8f0' }}>
                  Notifications {unreadCount > 0 && <span style={{ color: '#3b6dfb' }}>({unreadCount})</span>}
                </h3>
              </div>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllReadMutation.mutate()}
                    className="text-xs px-2 py-1 rounded-lg flex items-center gap-1"
                    style={{ color: '#3b6dfb', background: 'rgba(59,109,251,0.1)' }}
                  >
                    <CheckCheck size={12} /> All read
                  </button>
                )}
                <button onClick={() => setOpen(false)} style={{ color: '#566082' }}>
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Notification list */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-10">
                  <Bell size={32} style={{ color: '#2a3250', margin: '0 auto 8px' }} />
                  <p className="text-sm" style={{ color: '#566082' }}>No notifications</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n._id}
                    className="flex gap-3 px-4 py-3 border-b transition-all cursor-pointer"
                    style={{
                      borderColor: '#1c2236',
                      background: n.read ? 'transparent' : 'rgba(59,109,251,0.05)',
                      borderLeft: n.read ? 'none' : '3px solid #3b6dfb',
                    }}
                  >
                    <span className="text-lg flex-shrink-0 mt-0.5">
                      {TYPE_ICONS[n.type] || '🔔'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: '#e2e8f0' }}>{n.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#566082' }}>{n.message}</p>
                      <p className="text-xs mt-1" style={{ color: '#3d4568' }}>
                        {format(new Date(n.createdAt), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      {!n.read && (
                        <button
                          onClick={(e) => { e.stopPropagation(); markReadMutation.mutate(n._id); }}
                          className="p-1 rounded hover:bg-green-500/10"
                          title="Mark as read"
                        >
                          <Check size={12} style={{ color: '#4ade80' }} />
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(n._id); }}
                        className="p-1 rounded hover:bg-red-500/10"
                        title="Delete"
                      >
                        <Trash2 size={12} style={{ color: '#566082' }} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
