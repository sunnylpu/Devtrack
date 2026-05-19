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
      toast.success('Account created! Welcome to DevTrack Pro');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page-purple">
      <div className="auth-shell animate-fade-in">
        <div className="auth-brand">
          <div className="auth-logo">
            <Zap size={22} color="white" />
          </div>
          <h1>DevTrack <span className="gradient-text">Pro</span></h1>
        </div>

        <div className="auth-card">
          <div className="auth-heading auth-heading-row">
            <UserPlus size={20} />
            <div>
              <h2>Create account</h2>
              <p>Start with a fresh DevTrack Pro account.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {[
              { id: 'register-name', label: 'Full name', value: name, setter: setName, type: 'text', placeholder: 'Sunny Tyagi', autoComplete: 'name' },
              { id: 'register-email', label: 'Email address', value: email, setter: setEmail, type: 'email', placeholder: 'you@example.com', autoComplete: 'email' },
            ].map(({ id, label, value, setter, type, placeholder, autoComplete }) => (
              <div className="auth-field" key={id}>
                <label htmlFor={id}>{label}</label>
                <input
                  id={id}
                  type={type}
                  value={value}
                  onChange={e => setter(e.target.value)}
                  placeholder={placeholder}
                  autoComplete={autoComplete}
                />
              </div>
            ))}

            <div className="auth-field">
              <label htmlFor="register-password">Password</label>
              <div className="auth-password">
                <input
                  id="register-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="auth-submit"
            >
              {isLoading
                ? <span className="auth-spinner" />
                : <><ArrowRight size={16} /> Create Account</>
              }
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
