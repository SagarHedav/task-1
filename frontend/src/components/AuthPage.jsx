import { useState } from 'react';
import { loginUser, registerUser } from '../api/auth';

export default function AuthPage({ onLogin, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const res = isLogin 
        ? await loginUser(formData) 
        : await registerUser(formData);
      
      localStorage.setItem('taskflow_token', res.data.token);
      onLogin(res.data.user);
    } catch (err) {
      setError(err?.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-surface-container-lowest)]/80 backdrop-blur-md p-4">
      
      {/* Background Liquid Orbs for Modal Depth */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="liquid-orb w-[500px] h-[500px] bg-[var(--color-orb-1)]/10 -top-20 -left-20"></div>
        <div className="liquid-orb w-[600px] h-[600px] bg-[var(--color-orb-2)]/10 -bottom-40 -right-20"></div>
        <div className="liquid-orb w-[300px] h-[300px] bg-[var(--color-orb-3)]/10 top-1/2 left-1/4"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[var(--color-surface-container)]/60 backdrop-blur-3xl p-10 rounded-2xl shadow-[0_20px_40px_rgba(186,158,255,0.08)] ghost-border flex flex-col gap-8">
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-[var(--color-outline)] hover:text-[var(--color-on-surface)] transition bg-[var(--color-surface-container-high)]/40 hover:bg-[var(--color-surface-bright)] rounded-full"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>

          <div className="flex flex-col gap-2">
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-[var(--color-on-surface)]">
              {isLogin ? 'Welcome back' : 'Create Workspace'}
            </h1>
            <p className="text-[var(--color-on-surface-variant)] font-body text-sm">
              {isLogin ? 'Enter your credentials to access your workspace.' : 'Sign up to sync your tasks across all devices.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-label uppercase tracking-widest text-[var(--color-on-surface-variant)]/80 px-2">
                Username
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-outline-variant)] group-focus-within:text-[var(--color-primary)] transition-colors">person</span>
                <input 
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full h-14 bg-[var(--color-surface-container-lowest)]/40 rounded-md ghost-border pl-12 pr-4 text-[var(--color-on-surface)] placeholder:text-[var(--color-outline)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/10 transition-all border-none font-body" 
                  placeholder="Enter username" 
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center px-2">
                <label className="text-xs font-label uppercase tracking-widest text-[var(--color-on-surface-variant)]/80">
                  Password
                </label>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-outline-variant)] group-focus-within:text-[var(--color-primary)] transition-colors">lock</span>
                <input 
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full h-14 bg-[var(--color-surface-container-lowest)]/40 rounded-md ghost-border pl-12 pr-12 text-[var(--color-on-surface)] placeholder:text-[var(--color-outline)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/10 transition-all border-none font-body" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            {error && (
              <p className="text-[var(--color-error)] text-xs font-medium bg-[var(--color-error-container)]/20 border border-[var(--color-error-dim)]/30 rounded-md py-2 px-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                {error}
              </p>
            )}

            <div className="pt-4">
              <button 
                type="submit"
                disabled={loading}
                className="w-full h-14 flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dim)] text-[var(--color-on-primary)] font-headline font-semibold rounded-full shadow-[0_10px_25px_rgba(132,85,239,0.3)] hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50"
              >
                {loading && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
                {isLogin ? 'Sign In to Workspace' : 'Create Account'}
              </button>
            </div>
          </form>

          <p className="text-center text-sm font-body text-[var(--color-on-surface-variant)] mt-2">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              type="button"
              className="text-[var(--color-secondary-dim)] font-medium hover:underline underline-offset-4 decoration-[var(--color-secondary-dim)]/30"
            >
              {isLogin ? 'Create Workspace' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
