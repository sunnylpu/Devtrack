import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Eye, EyeOff, Zap, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('All fields required');
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back! 🚀');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0a0c18' }}>
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(59,109,251,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #3b6dfb, #7c3aed)', boxShadow: '0 0 30px rgba(59,109,251,0.4)' }}
          >
            <Zap size={22} color="white" />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#e2e8f0' }}>DevTrack <span className="gradient-text">Pro</span></h1>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{ background: '#141827', border: '1px solid #2a3250' }}>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#e2e8f0' }}>Welcome back</h2>
          <p className="mb-8 text-sm" style={{ color: '#566082' }}>Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sunny@devtrack.com"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                style={{
                  background: '#1c2236',
                  border: '1px solid #2a3250',
                  color: '#e2e8f0',
                }}
                onFocus={e => e.target.style.borderColor = '#3b6dfb'}
                onBlur={e => e.target.style.borderColor = '#2a3250'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-all duration-200"
                  style={{
                    background: '#1c2236',
                    border: '1px solid #2a3250',
                    color: '#e2e8f0',
                  }}
                  onFocus={e => e.target.style.borderColor = '#3b6dfb'}
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
                background: 'linear-gradient(135deg, #3b6dfb, #7c3aed)',
                color: 'white',
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: '#566082' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#3b6dfb' }} className="font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
