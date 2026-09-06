import { Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Button } from '@/components/coss/button';
import { Input } from '@/components/motion/input';
import { AuthLayout } from '../components/AuthLayout';
import { useTranslation } from 'react-i18next';

const fieldClasses = { field: 'rounded-lg h-10' };

export const LoginPage = () => {
  const { loginWithGoogle, loginWithEmail, resetPassword, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useDocumentTitle('Sign In - ContractChill');

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') return;
      setError(err.message || t('auth.login.errors.googleFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await loginWithEmail(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(t('auth.login.errors.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError(t('auth.login.errors.enterEmailFirst'));
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await resetPassword(email);
      toast.success(t('auth.login.resetLinkSent'), { description: t('auth.login.resetLinkSentDesc') });
    } catch (err: any) {
      setError(err.message || t('auth.login.errors.resetLinkFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t('auth.login.title')}
      subtitle={t('auth.login.subtitle')}
      footer={
        <span>
          {t('auth.login.noAccount')}{' '}
          <Link to="/register" className="font-semibold text-foreground underline-offset-4 hover:underline">
            {t('auth.login.signUpLink')}
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
          <span className="px-4 text-xs font-medium text-muted-foreground bg-card">{t('auth.login.orContinueWithEmail')}</span>
        </div>
      </div>

      {error && (
        <div className="border border-destructive/16 rounded-lg p-2.5 flex items-start gap-2 mb-4 bg-destructive/8">
          <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed font-medium text-destructive-foreground">{error}</p>
        </div>
      )}

      <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
        <Input
          type="email"
          value={email}
          onChange={(value) => setEmail(value)}
          placeholder={t('auth.login.emailPlaceholder')}
          classNames={fieldClasses}
        />

        <Input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(value) => setPassword(value)}
          placeholder={t('auth.login.passwordPlaceholder')}
          classNames={fieldClasses}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={t('auth.login.passwordPlaceholder')}
              className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />

        <div className="flex justify-end -mt-1">
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={loading}
            className="text-xs font-semibold text-foreground underline-offset-4 hover:underline transition-colors disabled:opacity-50"
          >
            {t('common.buttons.forgotPassword')}
          </button>
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="w-full mt-1"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('auth.login.signingIn')}
            </>
          ) : (
            t('common.buttons.signIn')
          )}
        </Button>
      </form>
    </AuthLayout>
  );
};
