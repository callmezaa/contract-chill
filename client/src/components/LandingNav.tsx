import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useSpring, useReducedMotion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Button } from '@/components/motion/button';
import { useTheme } from '../context/ThemeContext';

const navLinks = [
  { href: '#how-it-works', labelKey: 'common.nav.howItWorks' },
  { href: '#benefits', labelKey: 'common.nav.benefits' },
  { href: '#personas', labelKey: 'common.nav.personas' },
  { href: '#faq', labelKey: 'common.nav.faq' },
];

const pillSpring = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 34,
  mass: 0.9,
};

export const LandingNav = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const reduceMotion = useReducedMotion();

  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('#how-it-works');
  const sheetRef = useRef<HTMLDivElement>(null);

  const resolvedTheme = theme !== 'system' ? theme : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const logoSrc = resolvedTheme === 'dark' ? '/logo/brandLogo_white.png' : '/logo/brandLogo_black.png';

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, reduceMotion ? { duration: 0 } : { stiffness: 120, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = navLinks
      .map((link) => document.getElementById(link.href.slice(1)))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(`#${entry.target.id}`);
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const scrollTo = useCallback(
    (href: string) => {
      setIsOpen(false);
      if (href.startsWith('#')) {
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    },
    [reduceMotion]
  );

  return (
    <>
      <nav
        className={`sticky top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-300 ${
          scrolled
            ? 'bg-background/80 backdrop-blur-xl border-border shadow-[0_1px_0_rgba(0,0,0,0.04)]'
            : 'bg-transparent border-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-[68px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.img
              src={logoSrc}
              alt="ContractChill Logo"
              className="w-8 h-8 rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-200"
              whileHover={reduceMotion ? undefined : { scale: 1.05, rotate: -1.5 }}
              whileTap={reduceMotion ? undefined : { scale: 0.95 }}
            />
            <span className="font-display text-lg font-medium tracking-[-0.01em]">{t('common.appName')}</span>
          </Link>

          <div className="hidden md:flex items-center gap-1 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    if (reduceMotion) return;
                    e.preventDefault();
                    scrollTo(link.href);
                  }}
                  className="relative px-4 py-2 text-sm font-medium transition-colors text-text-muted hover:text-text"
                >
                  {isActive && (
                    <motion.span
                      layoutId="landing-nav-pill"
                      className="absolute inset-0 rounded-full bg-surface-2"
                      transition={reduceMotion ? { duration: 0 } : pillSpring}
                    />
                  )}
                  <span className="relative z-10">{t(link.labelKey)}</span>
                </a>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-text-muted hover:text-text hover:bg-surface rounded-lg transition-colors"
            >
              {t('common.buttons.login')}
            </Link>
            <div className="hidden sm:block w-[1px] h-5 bg-border" />
            <div className="hidden md:block">
              <Button variant="primary" size="sm" onClick={() => navigate('/login')} className="group">
                {t('common.buttons.getStarted')}
                <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </Button>
            </div>

            <button
              className="md:hidden p-2 -mr-2 text-text-muted hover:text-text hover:bg-surface rounded-lg transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? t('common.buttons.closeMenu') : t('common.buttons.openMenu')}
              aria-expanded={isOpen}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isOpen ? (
                  <motion.span
                    key="x"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.15 }}
                    className="block"
                  >
                    <X className="w-5 h-5" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ opacity: 0, rotate: 90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -90 }}
                    transition={{ duration: 0.15 }}
                    className="block"
                  >
                    <Menu className="w-5 h-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        <motion.div
          className="absolute bottom-[-1px] left-0 right-0 h-[2px] origin-left bg-primary/40"
          style={{ scaleX: progress }}
        />
      </nav>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.aside
              key="sheet"
              ref={sheetRef}
              initial={reduceMotion ? { opacity: 0 } : { x: '100%' }}
              animate={reduceMotion ? { opacity: 1 } : { x: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { x: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 40 }}
              className="fixed right-0 top-0 z-50 h-full w-[300px] max-w-[85vw] bg-surface border-l border-border shadow-2xl md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between h-[68px] px-5 border-b border-border shrink-0">
                <div className="flex items-center gap-2.5">
                  <img src={logoSrc} alt="ContractChill Logo" className="w-8 h-8 rounded-lg shadow-sm" />
                  <span className="font-display text-lg font-medium tracking-[-0.01em]">{t('common.appName')}</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 -mr-2 text-text-muted hover:text-text hover:bg-surface rounded-lg transition-colors"
                  aria-label={t('common.buttons.closeMenu')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="flex flex-col gap-1">
                  {navLinks.map((link, i) => (
                    <motion.a
                      key={link.href}
                      href={link.href}
                      onClick={(e) => {
                        if (reduceMotion) return;
                        e.preventDefault();
                        scrollTo(link.href);
                      }}
                      initial={reduceMotion ? undefined : { opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: reduceMotion ? 0 : 0.05 + i * 0.05, duration: 0.25 }}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-[15px] font-semibold transition-colors ${
                        activeSection === link.href ? 'bg-surface-2 text-text' : 'text-text-muted hover:text-text hover:bg-surface'
                      }`}
                    >
                      {t(link.labelKey)}
                      <ArrowRight className={`w-4 h-4 ${activeSection === link.href ? 'text-text' : 'text-text-subtle'}`} />
                    </motion.a>
                  ))}
                </div>

                <div className="h-[1px] bg-border my-4" />

                <motion.div
                  initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reduceMotion ? 0 : 0.3, duration: 0.25 }}
                  className="flex flex-col gap-3"
                >
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="text-[15px] font-semibold text-text hover:text-text transition-colors text-center py-2"
                  >
                    {t('common.buttons.loginToAccount')}
                  </Link>
                  <Button variant="primary" size="md" onClick={() => navigate('/login')} className="w-full group">
                    {t('common.buttons.getStartedFree')}
                    <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Button>
                </motion.div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
