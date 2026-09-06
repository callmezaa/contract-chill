import { Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Button } from '@/components/coss/button';
import { Input } from '@/components/motion/input';
import { AuthLayout } from '../components/AuthLayout';
import { useTranslation } from 'react-i18next';

const fieldClasses = { field: 'rounded-lg h-10' };

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
    if (strengthScore < index + 1) return 'bg-accent';
    if (strengthScore <= 1) return 'bg-destructive';
    if (strengthScore === 2) return 'bg-warning';
    if (strengthScore === 3) return 'bg-info';
    return 'bg-success';
  };

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

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
    <AuthLayout
      title={t('auth.register.title')}
      subtitle={t('auth.register.subtitle')}
      footer={
        <span>
          {t('auth.register.alreadyHaveAccount')}{' '}
          <Link to="/login" className="font-semibold text-foreground underline-offset-4 hover:underline">
            {t('auth.register.signInLink')}
          </Link>
        </span>
      }
    >
      <Button
        variant="secondary"
        size="lg"
        className="w-full mb-5"
        onClick={handleGoogleLogin}
        disabled={loading}
      >
        <img src="https://www.google.com/favicon.ico" alt="" className="w-4 h-4" />
        {t('common.buttons.continueWithGoogle')}
      </Button>

      <div className="relative mb-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 text-xs font-medium text-muted-foreground bg-card">{t('auth.register.orSignUpWithEmail')}</span>
        </div>
      </div>

      {error && (
        <div className="border border-destructive/16 rounded-lg p-2.5 flex items-start gap-2 mb-4 bg-destructive/8">
          <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed font-medium text-destructive-foreground">{error}</p>
        </div>
      )}

      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        <Input
          type="text"
          value={name}
          onChange={(value) => setName(value)}
          placeholder={t('auth.register.namePlaceholder')}
          classNames={fieldClasses}
        />

        <Input
          type="email"
          value={email}
          onChange={(value) => setEmail(value)}
          placeholder={t('auth.register.emailPlaceholder')}
          classNames={fieldClasses}
        />

        <Input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(value) => setPassword(value)}
          placeholder={t('auth.register.passwordPlaceholder')}
          classNames={fieldClasses}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
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
          size="lg"
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
    </AuthLayout>
  );
};
