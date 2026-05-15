import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import NotificationBell from '../ui/NotificationBell';
import {
  LayoutDashboard, CheckSquare, FileText, Github, Timer, Target,
  Settings, LogOut, Zap, ChevronLeft, ChevronRight, Menu, Code2
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/notes', label: 'Notes', icon: FileText },
  { path: '/github', label: 'GitHub', icon: Github },
  { path: '/leetcode', label: 'LeetCode', icon: Code2 },
  { path: '/focus', label: 'Focus', icon: Timer },
  { path: '/habits', label: 'Habits', icon: Target },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen" style={{ background: '#0a0c18' }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static z-40 top-0 left-0 h-full flex flex-col border-r transition-all duration-300 ease-in-out
          ${collapsed ? 'w-[72px]' : 'w-[260px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ background: '#0f1221', borderColor: '#1e2540' }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-5 h-16 border-b flex-shrink-0"
          style={{ borderColor: '#1e2540' }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #3b6dfb, #7c3aed)', boxShadow: '0 0 20px rgba(59,109,251,0.3)' }}
          >
            <Zap size={18} color="white" />
          </div>
          {!collapsed && (
            <span className="text-base font-bold animate-fade-in" style={{ color: '#e2e8f0' }}>
              DevTrack <span className="gradient-text">Pro</span>
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <div className="space-y-1">
            {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive ? '' : ''
                  }`
                }
                style={({ isActive }) => ({
                  background: isActive ? 'rgba(59,109,251,0.12)' : 'transparent',
                  color: isActive ? '#3b6dfb' : '#7880a4',
                })}
              >
                {({ isActive }) => (
                  <>
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        background: isActive ? 'rgba(59,109,251,0.2)' : 'transparent',
                      }}
                    >
                      <Icon size={18} />
                    </div>
                    {!collapsed && <span>{label}</span>}
                    {isActive && !collapsed && (
                      <div
                        className="ml-auto w-1.5 h-1.5 rounded-full"
                        style={{ background: '#3b6dfb', boxShadow: '0 0 8px #3b6dfb' }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User section */}
        <div className="px-3 py-4 border-t" style={{ borderColor: '#1e2540' }}>
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-3" style={{ background: '#141827' }}>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #3b6dfb, #7c3aed)', color: 'white' }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate" style={{ color: '#e2e8f0' }}>{user?.name || 'Developer'}</p>
                <p className="text-xs truncate" style={{ color: '#566082' }}>{user?.email || ''}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full transition-all"
            style={{ color: '#f87171' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center h-10 border-t transition-all"
          style={{ borderColor: '#1e2540', color: '#566082' }}
          onMouseEnter={e => e.currentTarget.style.color = '#3b6dfb'}
          onMouseLeave={e => e.currentTarget.style.color = '#566082'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header
          className="flex items-center justify-between px-6 h-16 border-b flex-shrink-0"
          style={{ background: '#0f1221', borderColor: '#1e2540' }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg"
            style={{ color: '#566082' }}
          >
            <Menu size={20} />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #3b6dfb, #7c3aed)', color: 'white' }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
