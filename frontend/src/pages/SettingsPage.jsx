import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services';
import { User, Bell, Moon, Lock, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [pomodoroWork, setPomodoroWork] = useState(user?.preferences?.pomodoroWork || 25);
  const [pomodoroBreak, setPomodoroBreak] = useState(user?.preferences?.pomodoroBreak || 5);
  const [pomodoroLong, setPomodoroLong] = useState(user?.preferences?.pomodoroLongBreak || 15);
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
      preferences: { pomodoroWork, pomodoroBreak, pomodoroLongBreak: pomodoroLong },
    });
  };

  const inputStyle = {
    background: '#1c2236',
    border: '1px solid #2a3250',
    color: '#e2e8f0',
    width: '100%',
    padding: '10px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    outline: 'none',
  };

  const Section = ({ icon: Icon, title, children }) => (
    <div className="rounded-2xl p-6 mb-5" style={{ background: '#141827', border: '1px solid #2a3250' }}>
      <div className="flex items-center gap-2 mb-5">
        <Icon size={16} style={{ color: '#3b6dfb' }} />
        <h3 className="font-semibold" style={{ color: '#e2e8f0' }}>{title}</h3>
      </div>
      {children}
    </div>
  );

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-8" style={{ color: '#e2e8f0' }}>Settings</h1>

      {/* Profile */}
      <Section icon={User} title="Profile">
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
            style={{ background: 'linear-gradient(135deg, #3b6dfb, #7c3aed)', color: 'white' }}
          >
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold" style={{ color: '#e2e8f0' }}>{user?.name}</p>
            <p className="text-sm" style={{ color: '#566082' }}>{user?.email}</p>
            <span
              className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
              style={{ background: 'rgba(59,109,251,0.15)', color: '#3b6dfb' }}
            >
              {user?.role?.replace('_', ' ')}
            </span>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>Full Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#3b6dfb'}
              onBlur={e => e.target.style.borderColor = '#2a3250'}
            />
          </div>
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
              <label className="block text-xs font-medium mb-2" style={{ color: '#94a3b8' }}>{label}</label>
              <input
                type="number"
                value={value}
                onChange={e => setter(parseInt(e.target.value) || min)}
                min={min}
                max={max}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#3b6dfb'}
                onBlur={e => e.target.style.borderColor = '#2a3250'}
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
        style={{ background: 'linear-gradient(135deg, #3b6dfb, #7c3aed)', color: 'white' }}
      >
        <Save size={16} />
        {profileMutation.isPending ? 'Saving...' : 'Save Changes'}
      </button>

      {/* Change Password */}
      <Section icon={Lock} title="Change Password">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>Current Password</label>
            <input
              type="password"
              value={currentPass}
              onChange={e => setCurrentPass(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#3b6dfb'}
              onBlur={e => e.target.style.borderColor = '#2a3250'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>New Password</label>
            <input
              type="password"
              value={newPass}
              onChange={e => setNewPass(e.target.value)}
              placeholder="Min. 6 characters"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#3b6dfb'}
              onBlur={e => e.target.style.borderColor = '#2a3250'}
            />
          </div>
          <button
            onClick={() => passwordMutation.mutate({ currentPassword: currentPass, newPassword: newPass })}
            disabled={!currentPass || !newPass || passwordMutation.isPending}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: '#1c2236',
              border: '1px solid #2a3250',
              color: '#94a3b8',
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
