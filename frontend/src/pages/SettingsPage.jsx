import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services';
import { User, Moon, Sun, Lock, Save, Timer, Shield, Check } from 'lucide-react';
import toast from 'react-hot-toast';

function Section({ icon: Icon, title, subtitle, children, action }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--accent-soft)' }}
          >
            <Icon size={15} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{title}</h3>
            {subtitle && <p className="text-xs" style={{ color: 'var(--subtle)' }}>{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-2 tracking-wide" style={{ color: 'var(--muted)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function StyledInput({ ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      style={{
        background: 'var(--surface-2)',
        border: `1px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
        boxShadow: focused ? '0 0 0 3px var(--accent-soft)' : 'none',
        color: 'var(--text)',
        width: '100%',
        padding: '10px 14px',
        borderRadius: '12px',
        fontSize: '14px',
        outline: 'none',
        transition: 'all 0.2s ease',
      }}
      onFocus={e => { setFocused(true); props.onFocus?.(e); }}
      onBlur={e => { setFocused(false); props.onBlur?.(e); }}
    />
  );
}

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [name, setName]             = useState(user?.name || '');
  const [pomodoroWork, setPomWork]  = useState(user?.preferences?.pomodoroWork || 25);
  const [pomodoroBreak, setPomBreak]= useState(user?.preferences?.pomodoroBreak || 5);
  const [pomodoroLong, setPomLong]  = useState(user?.preferences?.pomodoroLongBreak || 15);
  const [theme, setTheme]           = useState(user?.preferences?.theme === 'light' ? 'light' : 'dark');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass]       = useState('');

  const profileMutation = useMutation({
    mutationFn: (data) => authService.updateProfile(data),
    onSuccess: (res) => {
      updateUser({ name, preferences: res.data.data.user.preferences });
      toast.success('Profile updated!');
    },
    onError: () => toast.error('Update failed'),
  });

  const passwordMutation = useMutation({
    mutationFn: (data) => authService.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed!');
      setCurrentPass('');
      setNewPass('');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const handleThemeChange = (nextTheme) => {
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  };

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--subtle)' }}>Manage your account and preferences</p>
      </div>

      <div className="space-y-5">

        {/* ── Profile ── */}
        <Section
          icon={User}
          title="Profile"
          subtitle="Your personal information"
          action={
            <button
              onClick={() => profileMutation.mutate({ name, preferences: { theme, pomodoroWork, pomodoroBreak, pomodoroLongBreak: pomodoroLong } })}
              disabled={profileMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))', color: 'white', boxShadow: '0 4px 14px var(--accent-panel)' }}
            >
              {profileMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={14} />
              )}
              {profileMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          }
        >
          {/* Avatar Row */}
          <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl" style={{ background: 'var(--surface-2)' }}>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))', color: 'white', boxShadow: '0 4px 16px var(--accent-panel)' }}
            >
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold" style={{ color: 'var(--text)' }}>{user?.name}</p>
              <p className="text-sm" style={{ color: 'var(--subtle)' }}>{user?.email}</p>
              <span
                className="inline-block text-xs px-2.5 py-0.5 rounded-full mt-1.5 font-semibold"
                style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
              >
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
          </div>

          <Field label="FULL NAME">
            <StyledInput value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
          </Field>
        </Section>

        {/* ── Appearance ── */}
        <Section icon={theme === 'dark' ? Moon : Sun} title="Appearance" subtitle="Customize the look and feel">
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'dark', label: 'Dark Mode', Icon: Moon, desc: 'Easy on the eyes' },
              { value: 'light', label: 'Light Mode', Icon: Sun, desc: 'Clean and bright' },
            ].map(({ value, label, Icon, desc }) => {
              const active = theme === value;
              return (
                <button
                  key={value}
                  onClick={() => handleThemeChange(value)}
                  className="flex items-center gap-3 p-4 rounded-2xl text-left transition-all"
                  style={{
                    background: active ? 'var(--accent-soft)' : 'var(--surface-2)',
                    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: active ? 'var(--accent-panel)' : 'var(--surface-3)' }}
                  >
                    <Icon size={16} style={{ color: active ? 'var(--accent)' : 'var(--muted)' }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold" style={{ color: active ? 'var(--accent)' : 'var(--text)' }}>{label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--subtle)' }}>{desc}</p>
                  </div>
                  {active && (
                    <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--accent)' }}>
                      <Check size={11} style={{ color: 'white' }} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Section>

        {/* ── Pomodoro ── */}
        <Section icon={Timer} title="Pomodoro Timer" subtitle="Customize your focus intervals">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'WORK (MIN)', value: pomodoroWork, setter: setPomWork, min: 5, max: 90, color: '#8b5cf6' },
              { label: 'SHORT BREAK', value: pomodoroBreak, setter: setPomBreak, min: 1, max: 30, color: '#22c55e' },
              { label: 'LONG BREAK', value: pomodoroLong, setter: setPomLong, min: 5, max: 60, color: '#f59e0b' },
            ].map(({ label, value, setter, min, max, color }) => (
              <div key={label}>
                <label className="block text-xs font-semibold mb-2 tracking-wide" style={{ color: 'var(--muted)' }}>{label}</label>
                <div className="relative">
                  <input
                    type="number"
                    value={value}
                    onChange={e => setter(parseInt(e.target.value) || min)}
                    min={min}
                    max={max}
                    style={{
                      background: 'var(--surface-2)',
                      border: `1px solid var(--border)`,
                      color: 'var(--text)',
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      fontSize: '18px',
                      fontWeight: '700',
                      outline: 'none',
                      textAlign: 'center',
                    }}
                    onFocus={e => { e.target.style.borderColor = color; e.target.style.boxShadow = `0 0 0 3px ${color}22`; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                  />
                  <div className="w-full h-1 rounded-full mt-2" style={{ background: `${color}33` }}>
                    <div className="h-full rounded-full" style={{ width: `${((value - min) / (max - min)) * 100}%`, background: color, transition: 'width 0.3s ease' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Security ── */}
        <Section icon={Lock} title="Security" subtitle="Change your account password">
          <div className="space-y-4">
            <Field label="CURRENT PASSWORD">
              <StyledInput
                type="password"
                value={currentPass}
                onChange={e => setCurrentPass(e.target.value)}
                placeholder="Enter current password"
              />
            </Field>
            <Field label="NEW PASSWORD">
              <StyledInput
                type="password"
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                placeholder="Min. 6 characters"
              />
            </Field>
            <button
              onClick={() => passwordMutation.mutate({ currentPassword: currentPass, newPassword: newPass })}
              disabled={!currentPass || !newPass || passwordMutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
              style={{
                background: currentPass && newPass
                  ? 'linear-gradient(135deg, var(--accent), var(--accent-strong))'
                  : 'var(--surface-2)',
                color: currentPass && newPass ? 'white' : 'var(--muted)',
                border: currentPass && newPass ? 'none' : '1px solid var(--border)',
                boxShadow: currentPass && newPass ? '0 4px 14px var(--accent-panel)' : 'none',
              }}
            >
              <Shield size={14} />
              {passwordMutation.isPending ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </Section>

      </div>
    </div>
  );
}
