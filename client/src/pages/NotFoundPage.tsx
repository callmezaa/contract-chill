import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const NotFoundPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${isDark ? 'bg-background' : 'bg-slate-50'}`}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`max-w-md w-full text-center p-8 sm:p-12 rounded-[2rem] border shadow-xl ${
          isDark ? 'bg-surface border-white/5 shadow-black/50' : 'bg-white border-slate-200 shadow-primary/5'
        }`}
      >
        <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 ${
          isDark ? 'bg-white/5 text-primary' : 'bg-primary/5 text-primary'
        }`}>
          <FileQuestion className="w-10 h-10" />
        </div>
        
        <h1 className="text-8xl font-display font-black text-text mb-2 tracking-tighter">404</h1>
        <h2 className="text-xl font-bold text-text mb-4">Page Not Found</h2>
        
        <p className="text-text-muted mb-8 text-[15px] leading-relaxed">
          Oops! It seems the contract you're looking for has a missing clause. The page you requested could not be found.
        </p>
        
        <Link 
          to="/"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-white font-bold text-[15px] hover:bg-indigo-600 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5"
        >
          <span>Return Home</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </div>
  );
};
