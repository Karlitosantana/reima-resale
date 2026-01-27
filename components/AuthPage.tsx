import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';

type AuthMode = 'login' | 'signup' | 'forgot';

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});

  const { signIn, signUp, resetPassword } = useAuth();
  const toast = useToast();

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password strength validation
  const validatePassword = (password: string): { valid: boolean; message?: string } => {
    if (password.length < 8) {
      return { valid: false, message: 'Heslo musí mít alespoň 8 znaků' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Heslo musí obsahovat velké písmeno' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Heslo musí obsahovat malé písmeno' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Heslo musí obsahovat číslo' };
    }
    return { valid: true };
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
      } else if (mode === 'signup') {
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
          newErrors.password = passwordValidation.message;
        }
      }

      if (mode === 'signup') {
        if (!confirmPassword) {
          newErrors.confirmPassword = 'Potvrďte heslo';
        } else if (password !== confirmPassword) {
          newErrors.confirmPassword = 'Hesla se neshodují';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

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
          toast.success('Přihlášení úspěšné');
        }
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('Tento email je již registrován');
          } else {
            toast.error('Registrace selhala');
          }
        } else {
          toast.success('Registrace úspěšná! Zkontrolujte svůj email.');
          setMode('login');
        }
      } else if (mode === 'forgot') {
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
    setConfirmPassword('');
    setErrors({});
  };

  const switchMode = (newMode: AuthMode) => {
    resetForm();
    setMode(newMode);
  };

  return (
    <div className="min-h-screen bg-ios-gray dark:bg-black flex flex-col items-center justify-center px-5 py-10">
      {/* Logo / Brand */}
      <div className="mb-8 text-center animate-fade-in-up">
        <div className="w-20 h-20 bg-gradient-to-br from-ios-blue to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-float">
          <span className="text-3xl font-bold text-white">R</span>
        </div>
        <h1 className="text-2xl font-bold text-ios-text dark:text-white">Reima Resale</h1>
        <p className="text-ios-textSec text-sm mt-1">Sledování vašeho resale podnikání</p>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-sm bg-white dark:bg-[#1C1C1E] rounded-3xl shadow-ios-card p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
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
            {mode === 'signup' && 'Registrace'}
            {mode === 'forgot' && 'Obnovit heslo'}
          </h2>
          <p className="text-ios-textSec text-sm mt-1">
            {mode === 'login' && 'Přihlaste se do svého účtu'}
            {mode === 'signup' && 'Vytvořte si nový účet'}
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
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
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
              {mode === 'signup' && !errors.password && (
                <p className="text-ios-textSec text-xs mt-1.5">
                  Min. 8 znaků, velké a malé písmeno, číslo
                </p>
              )}
            </div>
          )}

          {/* Confirm Password */}
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-ios-textSec uppercase tracking-wider mb-2">
                Potvrdit heslo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-ios-textSec" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 ${
                    errors.confirmPassword ? 'border-ios-red' : 'border-transparent focus:border-ios-blue'
                  } focus:outline-none text-ios-text dark:text-white transition-colors`}
                  autoComplete="new-password"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-ios-red text-xs mt-1.5">{errors.confirmPassword}</p>
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
                ? 'bg-ios-blue/50 cursor-not-allowed'
                : 'bg-ios-blue hover:bg-blue-600 active:scale-[0.98] shadow-lg shadow-blue-500/30'
            }`}
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                {mode === 'login' && <LogIn size={20} />}
                {mode === 'signup' && <UserPlus size={20} />}
                {mode === 'forgot' && <Mail size={20} />}
              </>
            )}
            {mode === 'login' && 'Přihlásit se'}
            {mode === 'signup' && 'Registrovat'}
            {mode === 'forgot' && 'Odeslat email'}
          </button>
        </form>

        {/* Toggle Mode */}
        {mode !== 'forgot' && (
          <div className="mt-6 text-center">
            <p className="text-ios-textSec text-sm">
              {mode === 'login' ? 'Nemáte účet?' : 'Už máte účet?'}
              <button
                onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                className="text-ios-blue font-semibold ml-1 hover:opacity-70 transition-opacity"
              >
                {mode === 'login' ? 'Registrovat' : 'Přihlásit se'}
              </button>
            </p>
          </div>
        )}
      </div>

      {/* Security Note */}
      <p className="mt-6 text-ios-textSec text-xs text-center max-w-xs animate-fade-in" style={{ animationDelay: '0.2s' }}>
        Vaše data jsou šifrována a bezpečně uložena. Používáme nejnovější bezpečnostní standardy.
      </p>
    </div>
  );
};

export default AuthPage;
