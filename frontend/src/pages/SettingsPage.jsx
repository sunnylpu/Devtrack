import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services';
import { User, Bell, Moon, Sun, Lock, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [pomodoroWork, setPomodoroWork] = useState(user?.preferences?.pomodoroWork || 25);
  const [pomodoroBreak, setPomodoroBreak] = useState(user?.preferences?.pomodoroBreak || 5);
  const [pomodoroLong, setPomodoroLong] = useState(user?.preferences?.pomodoroLongBreak || 15);
  const [theme, setTheme] = useState(user?.preferences?.theme === 'light' ? 'light' : 'dark');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');

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

  const handleProfileSave = () => {
    profileMutation.mutate({
      name,
      preferences: { theme, pomodoroWork, pomodoroBreak, pomodoroLongBreak: pomodoroLong },
    });
  };

  const handleThemeChange = (nextTheme) => {
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  };

  const inputStyle = {
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    width: '100%',
    padding: '10px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    outline: 'none',
  };

  const Section = ({ icon: Icon, title, children }) => (
    <div className="rounded-2xl p-6 mb-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2 mb-5">
        <Icon size={16} style={{ color: 'var(--accent)' }} />
        <h3 className="font-semibold" style={{ color: 'var(--text)' }}>{title}</h3>
      </div>
      {children}
    </div>
  );

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-8" style={{ color: 'var(--text)' }}>Settings</h1>

      {/* Profile */}
      <Section icon={User} title="Profile">
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))', color: 'white' }}
          >
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold" style={{ color: 'var(--text)' }}>{user?.name}</p>
            <p className="text-sm" style={{ color: 'var(--subtle)' }}>{user?.email}</p>
            <span
              className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
              {user?.role?.replace('_', ' ')}
            </span>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>Full Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>
      </Section>

      <Section icon={theme === 'dark' ? Moon : Sun} title="Appearance">
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'dark', label: 'Dark', Icon: Moon },
            { value: 'light', label: 'Light', Icon: Sun },
          ].map(({ value, label, Icon }) => {
            const active = theme === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => handleThemeChange(value)}
                className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all"
                style={{
                  background: active ? 'var(--accent-soft)' : 'var(--surface-2)',
                  border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                  color: active ? 'var(--accent)' : 'var(--muted)',
                }}
              >
                <Icon size={16} />
                {label}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Pomodoro settings */}
      <Section icon={Bell} title="Pomodoro Timer">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Work (min)', value: pomodoroWork, setter: setPomodoroWork, min: 5, max: 90 },
            { label: 'Short Break', value: pomodoroBreak, setter: setPomodoroBreak, min: 1, max: 30 },
            { label: 'Long Break', value: pomodoroLong, setter: setPomodoroLong, min: 5, max: 60 },
          ].map(({ label, value, setter, min, max }) => (
            <div key={label}>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--muted)' }}>{label}</label>
              <input
                type="number"
                value={value}
                onChange={e => setter(parseInt(e.target.value) || min)}
                min={min}
                max={max}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* Save profile button */}
      <button
        onClick={handleProfileSave}
        disabled={profileMutation.isPending}
        className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm mb-5"
        style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))', color: 'white' }}
      >
        <Save size={16} />
        {profileMutation.isPending ? 'Saving...' : 'Save Changes'}
      </button>

      {/* Change Password */}
      <Section icon={Lock} title="Change Password">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>Current Password</label>
            <input
              type="password"
              value={currentPass}
              onChange={e => setCurrentPass(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>New Password</label>
            <input
              type="password"
              value={newPass}
              onChange={e => setNewPass(e.target.value)}
              placeholder="Min. 6 characters"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <button
            onClick={() => passwordMutation.mutate({ currentPassword: currentPass, newPassword: newPass })}
            disabled={!currentPass || !newPass || passwordMutation.isPending}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--muted)',
              opacity: (!currentPass || !newPass) ? 0.5 : 1,
            }}
          >
            {passwordMutation.isPending ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </Section>
    </div>
  );
}
