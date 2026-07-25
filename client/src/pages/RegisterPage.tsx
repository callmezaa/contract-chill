import { Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Button } from '@/components/motion/button';
import { Input } from '@/components/motion/input';
import { useTranslation } from 'react-i18next';

export const RegisterPage = () => {
  const { registerWithEmail, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useDocumentTitle('Create Account - ContractChill');

  const calculateStrength = (pass: string) => {
    let score = 0;
    if (!pass) return score;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;
    return Math.min(4, score);
  };

  const strengthScore = calculateStrength(password);
  const getStrengthColor = (index: number) => {
    if (strengthScore < index + 1) return 'bg-border';
    if (strengthScore <= 1) return 'bg-red-500';
    if (strengthScore === 2) return 'bg-yellow-500';
    if (strengthScore === 3) return 'bg-blue-500';
    return 'bg-green-500';
  };

  if (user) {
    navigate('/dashboard');
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError(t('auth.register.errors.passwordTooShort'));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await registerWithEmail(email, password, name);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || t('auth.register.errors.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || t('auth.register.errors.googleFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm border border-border rounded-xl p-8 bg-surface">
        <h1 className="text-2xl font-semibold text-text text-center mb-2">{t('auth.register.title')}</h1>
        <p className="text-sm text-text-muted text-center mb-8">{t('auth.register.subtitle')}</p>

        <Button
          variant="secondary"
          className="w-full mb-5"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
          {t('common.buttons.continueWithGoogle')}
        </Button>

        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 text-xs font-medium text-text-muted bg-surface">{t('auth.register.orSignUpWithEmail')}</span>
          </div>
        </div>

        {error && (
          <div className="border border-red-500/20 rounded-xl p-2.5 flex items-start gap-2 mb-4 bg-red-500/10">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed font-medium text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <Input
            type="text"
            value={name}
            onChange={(value) => setName(value)}
            placeholder={t('auth.register.namePlaceholder')}
          />

          <Input
            type="email"
            value={email}
            onChange={(value) => setEmail(value)}
            placeholder={t('auth.register.emailPlaceholder')}
          />

          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(value) => setPassword(value)}
            placeholder={t('auth.register.passwordPlaceholder')}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-text-muted hover:text-primary transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          {password.length > 0 && (
            <div className="flex gap-1.5 px-1 -mt-2">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`h-1 rounded-full flex-1 transition-colors duration-500 ${getStrengthColor(index)}`}
                />
              ))}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-1"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('auth.register.creating')}
              </>
            ) : (
              t('common.buttons.signUp')
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-text-muted mt-6">
          {t('auth.register.alreadyHaveAccount')}{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">{t('auth.register.signInLink')}</Link>
        </p>
      </div>
    </div>
  );
};
