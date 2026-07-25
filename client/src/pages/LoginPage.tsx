import { Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Button } from '@/components/motion/button';
import { Input } from '@/components/motion/input';
import { useTranslation } from 'react-i18next';

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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm border border-border rounded-xl p-8 bg-surface">
        <h1 className="text-2xl font-semibold text-text text-center mb-2">{t('auth.login.title')}</h1>
        <p className="text-sm text-text-muted text-center mb-8">{t('auth.login.subtitle')}</p>

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
            <span className="px-4 text-xs font-medium text-text-muted bg-surface">{t('auth.login.orContinueWithEmail')}</span>
          </div>
        </div>

        {error && (
          <div className="border border-red-500/20 rounded-xl p-2.5 flex items-start gap-2 mb-4 bg-red-500/10">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed font-medium text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
          <Input
            type="email"
            value={email}
            onChange={(value) => setEmail(value)}
            placeholder={t('auth.login.emailPlaceholder')}
          />

          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(value) => setPassword(value)}
            placeholder={t('auth.login.passwordPlaceholder')}
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

          <div className="flex justify-end -mt-1">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={loading}
              className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
            >
              {t('common.buttons.forgotPassword')}
            </button>
          </div>

          <Button
            type="submit"
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

        <p className="text-center text-xs text-text-muted mt-6">
          {t('auth.login.noAccount')}{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">{t('auth.login.signUpLink')}</Link>
        </p>
      </div>
    </div>
  );
};
