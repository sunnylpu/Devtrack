import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services';
import NotificationBell from '../ui/NotificationBell';
import {
  LayoutDashboard, CheckSquare, FileText, Github, Timer, Target,
  Settings, LogOut, Zap, ChevronLeft, ChevronRight, Menu, Code2, Moon, Sun
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
  const { user, logout, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const currentTheme = user?.preferences?.theme === 'light' ? 'light' : 'dark';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleTheme = async () => {
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    const preferences = { ...(user?.preferences || {}), theme: nextTheme };
    updateUser({ preferences });
    document.documentElement.dataset.theme = nextTheme;
    try {
      await authService.updateProfile({ preferences });
    } catch {
      // Theme should still change immediately even if saving fails.
    }
  };

  return (
    <div className="flex h-screen" style={{ background: 'var(--bg)' }}>
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
        style={{ background: 'var(--sidebar)', borderColor: 'var(--border)' }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-5 h-16 border-b flex-shrink-0"
          style={{ borderColor: 'var(--border)' }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))', boxShadow: '0 0 20px var(--accent-panel)' }}
          >
            <Zap size={18} color="white" />
          </div>
          {!collapsed && (
            <span className="text-base font-bold animate-fade-in" style={{ color: 'var(--text)' }}>
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
                  background: isActive ? 'var(--accent-soft)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--muted)',
                })}
              >
                {({ isActive }) => (
                  <>
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        background: isActive ? 'var(--accent-panel)' : 'transparent',
                      }}
                    >
                      <Icon size={18} />
                    </div>
                    {!collapsed && <span>{label}</span>}
                    {isActive && !collapsed && (
                      <div
                        className="ml-auto w-1.5 h-1.5 rounded-full"
                        style={{ background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User section */}
        <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-3" style={{ background: 'var(--surface)' }}>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))', color: 'white' }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{user?.name || 'Developer'}</p>
                <p className="text-xs truncate" style={{ color: 'var(--subtle)' }}>{user?.email || ''}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full transition-all"
            style={{ color: 'var(--danger)' }}
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
          style={{ borderColor: 'var(--border)', color: 'var(--subtle)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--subtle)'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header
          className="flex items-center justify-between px-6 h-16 border-b flex-shrink-0"
          style={{ background: 'var(--sidebar)', borderColor: 'var(--border)' }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg"
            style={{ color: 'var(--subtle)' }}
          >
            <Menu size={20} />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
              style={{ background: 'var(--surface)', color: 'var(--muted)', border: '1px solid var(--border)' }}
              aria-label={`Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {currentTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <NotificationBell />
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))', color: 'white' }}
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
