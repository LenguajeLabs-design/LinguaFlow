import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, Lock, Eye, EyeOff, Loader2, Star } from 'lucide-react';
import { useAuthStore } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import appIcon from '/hangul-flow-icon.png';

interface AuthModalProps {
  defaultMode?: 'login' | 'signup';
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthModal({ defaultMode = 'login', onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, signup, isLoading } = useAuthStore();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (mode === 'signup' && password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      onSuccess?.();
      onClose();
    } catch (err: any) {
      const msg = err?.data?.error || err?.message || 'Something went wrong. Please try again.';
      setError(msg);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-card rounded-3xl shadow-2xl border border-border/60 overflow-hidden">

        {/* Gradient header bar */}
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, hsl(174,60%,52%), hsl(200,68%,58%), hsl(255,52%,66%), hsl(295,42%,67%))' }} />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="px-8 pt-8 pb-8">
          {/* Brand */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <img src={appIcon} alt="Hangul Flow" className="w-14 h-14 rounded-2xl shadow-lg" />
              <Star className="hf-sparkle absolute -top-1 -right-1 w-3 h-3 text-accent fill-accent" />
            </div>
            <h2 className="text-xl font-serif font-bold text-foreground">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1 text-center">
              {mode === 'login'
                ? 'Sign in to access your personal library'
                : 'Start your Korean reading journey'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-secondary/60 p-1 rounded-xl mb-6">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={cn(
                'flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                mode === 'login' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Sign in
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); }}
              className={cn(
                'flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                mode === 'signup' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Create account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                autoComplete="email"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/60 transition-all text-sm"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Password (min. 8 characters)' : 'Password'}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full pl-11 pr-12 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/60 transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-4 py-2.5 rounded-xl">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, hsl(174,62%,42%), hsl(200,68%,52%), hsl(255,52%,60%))' }}
            >
              {isLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> {mode === 'login' ? 'Signing in…' : 'Creating account…'}</>
                : mode === 'login' ? 'Sign in' : 'Create account'
              }
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Your passages and favorites are securely stored and accessible from any device.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
