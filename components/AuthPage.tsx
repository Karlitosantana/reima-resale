import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowLeft, Loader2, Snowflake } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';

type AuthMode = 'login' | 'forgot';

// Allowed admin user
const ALLOWED_EMAIL = 'karpenet@me.com';

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { signIn, resetPassword } = useAuth();
  const toast = useToast();

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = 'Email je povinný';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Neplatný formát emailu';
    }

    if (mode !== 'forgot') {
      if (!password) {
        newErrors.password = 'Heslo je povinné';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Check if user is allowed (admin only)
    if (mode === 'login' && email.trim().toLowerCase() !== ALLOWED_EMAIL) {
      toast.error('Přístup pouze pro administrátora');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Nesprávný email nebo heslo');
          } else if (error.message.includes('Email not confirmed')) {
            toast.warning('Potvrďte svůj email před přihlášením');
          } else {
            toast.error('Přihlášení selhalo');
          }
        } else {
          toast.success('Vítejte zpět!');
        }
      } else if (mode === 'forgot') {
        // Only allow password reset for admin
        if (email.trim().toLowerCase() !== ALLOWED_EMAIL) {
          toast.error('Přístup pouze pro administrátora');
          setIsLoading(false);
          return;
        }
        const { error } = await resetPassword(email);
        if (error) {
          toast.error('Nepodařilo se odeslat email');
        } else {
          toast.success('Email pro obnovení hesla odeslán');
          setMode('login');
        }
      }
    } catch (error) {
      toast.error('Něco se pokazilo');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setErrors({});
  };

  const switchMode = (newMode: AuthMode) => {
    resetForm();
    setMode(newMode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-purple-950 flex flex-col items-center justify-center px-5 py-10">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-400/20 to-orange-300/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-300/10 rounded-full blur-3xl" />
      </div>

      {/* Logo / Brand */}
      <div className="mb-8 text-center animate-fade-in-up relative z-10">
        {/* Main Logo Container */}
        <div className="relative mx-auto mb-6 w-28 h-28">
          {/* Outer glow rings */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-red-500 via-orange-400 to-yellow-400 opacity-30 blur-xl animate-pulse" />
          <div className="absolute inset-2 rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-400 to-teal-400 opacity-20 blur-lg animate-pulse" style={{ animationDelay: '0.5s' }} />

          {/* Main icon container */}
          <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-red-500 via-rose-500 to-orange-500 p-[3px] shadow-2xl shadow-red-500/30 animate-float">
            <div className="w-full h-full rounded-[21px] bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center overflow-hidden">
              {/* Inner colorful pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-500 via-transparent to-blue-500" />
              </div>

              {/* Snowflake icon with gradient */}
              <div className="relative">
                <Snowflake
                  size={48}
                  className="text-transparent"
                  style={{
                    stroke: 'url(#snowflake-gradient)',
                    strokeWidth: 2
                  }}
                />
                {/* SVG gradient definition */}
                <svg width="0" height="0" className="absolute">
                  <defs>
                    <linearGradient id="snowflake-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="50%" stopColor="#f97316" />
                      <stop offset="100%" stopColor="#eab308" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Fallback colored snowflake */}
                <Snowflake
                  size={48}
                  className="absolute inset-0 text-red-500"
                  strokeWidth={2}
                />
              </div>
            </div>
          </div>

          {/* Floating decorative snowflakes */}
          <div className="absolute -top-2 -right-2 animate-bounce" style={{ animationDelay: '0.2s' }}>
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg">
              <Snowflake size={12} className="text-white" />
            </div>
          </div>
          <div className="absolute -bottom-1 -left-3 animate-bounce" style={{ animationDelay: '0.5s' }}>
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
              <Snowflake size={10} className="text-white" />
            </div>
          </div>
          <div className="absolute top-1/2 -right-4 animate-bounce" style={{ animationDelay: '0.8s' }}>
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg">
              <Snowflake size={8} className="text-white" />
            </div>
          </div>
        </div>

        {/* Brand text */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-gray-400 tracking-[0.25em] uppercase">Kids Wear Tracker</p>
          <h1 className="text-3xl font-black tracking-tight">
            <span className="text-gray-900 dark:text-white">REIMA</span>
            <span className="ml-2 text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500">Resale</span>
          </h1>
          <p className="text-ios-textSec text-sm mt-2">Váš osobní resale asistent</p>
        </div>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-sm bg-white/80 dark:bg-[#1C1C1E]/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/10 p-6 animate-fade-in-up relative z-10 border border-white/50 dark:border-white/10" style={{ animationDelay: '0.1s' }}>
        {/* Header */}
        <div className="mb-6">
          {mode === 'forgot' && (
            <button
              onClick={() => switchMode('login')}
              className="flex items-center text-ios-blue text-sm font-medium mb-4 hover:opacity-70 transition-opacity"
            >
              <ArrowLeft size={18} className="mr-1" />
              Zpět
            </button>
          )}
          <h2 className="text-xl font-bold text-ios-text dark:text-white">
            {mode === 'login' && 'Přihlášení'}
            {mode === 'forgot' && 'Obnovit heslo'}
          </h2>
          <p className="text-ios-textSec text-sm mt-1">
            {mode === 'login' && 'Vítejte zpět! Přihlaste se prosím.'}
            {mode === 'forgot' && 'Zadejte email pro obnovení hesla'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-ios-textSec uppercase tracking-wider mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail size={18} className="text-ios-textSec" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                placeholder="vas@email.cz"
                className={`w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 ${
                  errors.email ? 'border-ios-red' : 'border-transparent focus:border-ios-blue'
                } focus:outline-none text-ios-text dark:text-white transition-colors`}
                autoComplete="email"
                autoCapitalize="none"
              />
            </div>
            {errors.email && (
              <p className="text-ios-red text-xs mt-1.5">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          {mode !== 'forgot' && (
            <div>
              <label className="block text-xs font-semibold text-ios-textSec uppercase tracking-wider mb-2">
                Heslo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-ios-textSec" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-12 py-3.5 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 ${
                    errors.password ? 'border-ios-red' : 'border-transparent focus:border-ios-blue'
                  } focus:outline-none text-ios-text dark:text-white transition-colors`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-ios-textSec hover:text-ios-text transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-ios-red text-xs mt-1.5">{errors.password}</p>
              )}
            </div>
          )}

          {/* Forgot Password Link */}
          {mode === 'login' && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => switchMode('forgot')}
                className="text-ios-blue text-sm font-medium hover:opacity-70 transition-opacity"
              >
                Zapomněli jste heslo?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200 ${
              isLoading
                ? 'bg-gradient-to-r from-red-400 to-orange-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 hover:from-red-600 hover:via-orange-600 hover:to-yellow-600 active:scale-[0.98] shadow-lg shadow-orange-500/30'
            }`}
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                {mode === 'login' && <LogIn size={20} />}
                {mode === 'forgot' && <Mail size={20} />}
              </>
            )}
            {mode === 'login' && 'Přihlásit se'}
            {mode === 'forgot' && 'Odeslat email'}
          </button>
        </form>
      </div>

      {/* Security Note */}
      <div className="mt-8 text-center animate-fade-in relative z-10" style={{ animationDelay: '0.2s' }}>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/30 dark:border-gray-700/30">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse" />
          <p className="text-ios-textSec text-xs">
            Zabezpečeno šifrováním
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
