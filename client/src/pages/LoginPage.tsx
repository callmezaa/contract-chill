import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'sonner';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const LoginPage = () => {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword, user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDark = theme === 'dark';

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
      // User closed the popup — not an error, just reset silently
      if (err.code === 'auth/popup-closed-by-user') return;
      setError(err.message || 'Google sign-in failed. Please try again.');
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
      setError('invalid email or password. please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await resetPassword(email);
      toast.success('Reset link sent!', { description: 'Check your email for the password reset link.' });
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex w-full items-center justify-center p-4 lg:p-6 ${isDark ? 'bg-background' : 'bg-background'}`}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`w-full max-w-[960px] flex rounded-2xl overflow-hidden border ${isDark ? 'bg-surface border-white/10 shadow-black/30' : 'bg-surface border-border shadow-xl shadow-black/[0.04]'}`}
      >
        {/* Left Side Branding */}
         <div className="hidden lg:flex w-[42%] bg-primary p-8 xl:p-12 flex-col relative overflow-hidden text-white justify-between">
           {/* Decorative abstract elements */}
           <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-white/10 rounded-full blur-3xl pointer-events-none" />
           <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-white/10 rounded-full blur-3xl pointer-events-none" />
           
           <div className="flex items-center gap-3 relative z-10">
             <img src="/logo.png" alt="Contract Chill Logo" className="w-9 h-9 object-contain drop-shadow-md" />
             <span className="font-display font-bold text-lg tracking-tight">Contract Chill</span>
           </div>

           <div className="relative z-10 mt-6 xl:mt-0">
             <h2 className="text-3xl xl:text-4xl font-display font-bold mb-3 leading-tight">
               AI-Powered Legal Analysis For Modern Teams.
             </h2>
             <p className="text-indigo-100/90 text-[14px] xl:text-[15px] leading-relaxed max-w-sm">
               Instantly review, identify risks, and understand complex contracts with our advanced AI legal assistant.
             </p>
           </div>
           
           <div className="flex items-center justify-center w-full mt-4">
              <motion.img 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                src="/3d_character_fix.png" 
                alt="Contract Chill 3D Character" 
                className="w-full max-w-[280px] xl:max-w-[340px] h-auto object-contain drop-shadow-2xl hover:scale-[1.02] transition-transform duration-500"
              />
           </div>
        </div>

        {/* Right Side Form */}
        <div className="w-full lg:w-[58%] p-6 sm:p-10 xl:p-14 flex flex-col justify-center relative">
          

          <div className="mb-5">
             <h1 className="text-2xl sm:text-3xl font-display font-semibold tracking-[-0.04em] text-text mb-1">Welcome back</h1>
            <p className="text-[13px] sm:text-[14px] text-text-muted">Sign in to access your analyses.</p>
          </div>

          <div className="mb-5">
            <button 
              type="button"
              onClick={handleGoogleLogin} 
              disabled={loading} 
               className={`w-full py-3 px-4 rounded-xl border flex items-center justify-center gap-2.5 transition-[background-color,border-color,transform] duration-150 font-medium text-[14px] sm:text-[15px] ${isDark ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white' : 'border-border bg-surface hover:bg-surface-2 text-text shadow-sm'}`}
            >
               <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
               <span>Continue with Google</span>
            </button>
          </div>

          <div className="relative mb-5">
             <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}></div>
             </div>
             <div className="relative flex justify-center text-sm">
                <span className={`px-4 text-[12px] sm:text-[13px] font-medium text-text-muted ${isDark ? 'bg-surface' : 'bg-white'}`}>Or continue with email</span>
             </div>
          </div>

          {error && (
            <div className={`border rounded-xl p-2.5 flex items-start gap-2 mb-4 ${
              isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-100'
            }`}>
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className={`text-[12px] leading-relaxed font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="flex flex-col gap-6">
            <div className="relative group">
              <input
                type="email"
                id="email"
                required
                placeholder=" "
                className={`peer w-full h-[36px] bg-transparent border-b outline-none transition-all duration-300 text-[14px] font-medium ${
                  isDark ? 'border-white/10 focus:border-primary text-white' : 'border-slate-200 focus:border-primary text-slate-900'
                }`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label 
                htmlFor="email"
                className="absolute left-0 -top-4 text-[12px] sm:text-[13px] font-medium text-text-muted transition-all duration-300 pointer-events-none
                           peer-placeholder-shown:top-1.5 peer-placeholder-shown:text-[14px] peer-placeholder-shown:font-normal
                           peer-focus:-top-4 peer-focus:text-[12px] peer-focus:font-medium peer-focus:text-primary"
              >
                Email Address
              </label>
            </div>

            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                required
                placeholder=" "
                className={`peer w-full h-[36px] bg-transparent border-b outline-none transition-all duration-300 text-[14px] font-medium pr-8 ${
                  isDark ? 'border-white/10 focus:border-primary text-white' : 'border-slate-200 focus:border-primary text-slate-900'
                }`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label 
                htmlFor="password"
                className="absolute left-0 -top-4 text-[12px] sm:text-[13px] font-medium text-text-muted transition-all duration-300 pointer-events-none
                           peer-placeholder-shown:top-1.5 peer-placeholder-shown:text-[14px] peer-placeholder-shown:font-normal
                           peer-focus:-top-4 peer-focus:text-[12px] peer-focus:font-medium peer-focus:text-primary"
              >
                Password
              </label>
              
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1.5 text-text-muted hover:text-primary transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>

            <div className="flex justify-between items-center -mt-1">
              <div className="flex items-center gap-2">
                 <input type="checkbox" id="remember" className={`w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary ${isDark ? 'bg-surface border-white/20' : 'bg-white'}`} />
                 <label htmlFor="remember" className="text-[12px] sm:text-[13px] text-text-muted cursor-pointer select-none">Remember me</label>
              </div>
              <button type="button" onClick={handleForgotPassword} disabled={loading} className="text-[12px] sm:text-[13px] font-semibold text-primary hover:text-indigo-500 transition-colors disabled:opacity-50">
                Forgot Password?
              </button>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
               className="w-full py-3 mt-1 rounded-xl bg-primary text-white font-medium text-[14px] sm:text-[15px] flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-50 shadow-sm shadow-primary/25"
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div key="loading" className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </motion.div>
                ) : (
                  <motion.span key="idle">Sign In</motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </form>

          <p className="text-center text-[13px] text-text-muted mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">Sign Up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
