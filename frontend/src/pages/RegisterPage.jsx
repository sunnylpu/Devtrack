import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Eye, EyeOff, Zap, ArrowRight, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return toast.error('All fields required');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    setIsLoading(true);
    try {
      await register(name, email, password);
      toast.success('Account created! Welcome to DevTrack Pro 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    background: '#1c2236', border: '1px solid #2a3250', color: '#e2e8f0',
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0a0c18' }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(124,58,237,0.08) 0%, transparent 70%)' }}
      />

      <div className="w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-10">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #3b6dfb, #7c3aed)', boxShadow: '0 0 30px rgba(124,58,237,0.4)' }}
          >
            <Zap size={22} color="white" />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#e2e8f0' }}>DevTrack <span className="gradient-text">Pro</span></h1>
          </div>
        </div>

        <div className="rounded-2xl p-8" style={{ background: '#141827', border: '1px solid #2a3250' }}>
          <div className="flex items-center gap-2 mb-2">
            <UserPlus size={20} style={{ color: '#7c3aed' }} />
            <h2 className="text-2xl font-bold" style={{ color: '#e2e8f0' }}>Create account</h2>
          </div>
          <p className="mb-8 text-sm" style={{ color: '#566082' }}>Join the developer productivity revolution</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { label: 'Full Name', value: name, setter: setName, type: 'text', placeholder: 'Sunny Tyagi' },
              { label: 'Email address', value: email, setter: setEmail, type: 'email', placeholder: 'sunny@devtrack.com' },
            ].map(({ label, value, setter, type, placeholder }) => (
              <div key={label}>
                <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>{label}</label>
                <input
                  type={type}
                  value={value}
                  onChange={e => setter(e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#7c3aed'}
                  onBlur={e => e.target.style.borderColor = '#2a3250'}
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-all duration-200"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#7c3aed'}
                  onBlur={e => e.target.style.borderColor = '#2a3250'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#566082' }}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #3b6dfb)',
                color: 'white',
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><ArrowRight size={16} /> Create Account</>
              }
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: '#566082' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#7c3aed' }} className="font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
