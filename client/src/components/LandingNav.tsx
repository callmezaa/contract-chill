import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useSpring, useReducedMotion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Button } from '@/components/coss/button';
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
  const [floating, setFloating] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('#how-it-works');
  const sheetRef = useRef<HTMLDivElement>(null);

  const resolvedTheme = theme !== 'system' ? theme : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const logoSrc = resolvedTheme === 'dark' ? '/logo/brandLogo_white.png' : '/logo/brandLogo_black.png';

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, reduceMotion ? { duration: 0 } : { stiffness: 120, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const onScroll = () => setFloating(window.scrollY > 380);
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

  const brand = (compact = false) => (
    <Link to="/" className={`flex items-center gap-2.5 group ${compact ? 'px-1' : ''}`} aria-label={t('common.appName')}>
      <img
        src={logoSrc}
        alt=""
        className={`rounded-lg transition-transform duration-200 group-hover:scale-105 ${compact ? 'size-7' : 'size-8'}`}
      />
      <span className={`font-display font-semibold tracking-[-0.02em] text-foreground ${compact ? 'text-base' : 'text-lg'}`}>
        {t('common.appName')}
      </span>
    </Link>
  );

  const links = (compact = false) =>
    navLinks.map((link) => {
      const isActive = activeSection === link.href;
      return (
        <a
          key={`${compact}-${link.href}`}
          href={link.href}
          onClick={(e) => {
            if (reduceMotion) return;
            e.preventDefault();
            scrollTo(link.href);
          }}
          className={`relative rounded-full font-medium transition-colors ${
            isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
          } ${compact ? 'px-3 py-1.5 text-sm' : 'px-4 py-2 text-sm'}`}
        >
          {isActive && !compact && (
            <motion.span
              layoutId="landing-nav-pill"
              className="absolute inset-0 rounded-full bg-accent"
              transition={reduceMotion ? { duration: 0 } : pillSpring}
            />
          )}
          <span className="relative z-10">{t(link.labelKey)}</span>
        </a>
      );
    });

  const actions = (compact = false) => (
    <Button size={compact ? 'sm' : 'default'} onClick={() => navigate('/login')} className="group hidden md:inline-flex">
      {t('common.buttons.getStarted')}
      <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
    </Button>
  );

  const hamburger = (compact = false) => (
    <button
      className={`md:hidden p-2 -mr-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors ${compact ? '' : ''}`}
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
  );

  return (
    <>
      {/* ── Static nav — lives inside the hero container ── */}
      <nav className="relative z-30">
        <div className="max-w-6xl mx-auto px-6 md:px-10 h-[72px] flex items-center justify-between">
          {brand()}
          <div className="hidden md:flex items-center gap-0.5 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {links()}
          </div>
          <div className="flex items-center gap-2">
            {actions()}
            {hamburger()}
          </div>
        </div>
      </nav>

      {/* ── Floating pill — detaches after the hero ── */}
      <AnimatePresence initial={false}>
        {floating && !isOpen && (
          <motion.nav
            key="floating-nav"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.97 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.98 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0 }}
            className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[min(1152px,calc(100vw-24px))]"
          >
            <div className="relative h-14 bg-background/85 backdrop-blur-xl border border-border rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.16)] overflow-hidden">
              <div className="h-full px-4 flex items-center justify-between gap-3">
                {brand(true)}
                <div className="hidden md:flex items-center gap-0.5">{links(true)}</div>
                <div className="flex items-center gap-1.5">
                  {actions(true)}
                  {hamburger(true)}
                </div>
              </div>
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 origin-left bg-primary/50"
                style={{ scaleX: progress }}
              />
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

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
              className="fixed right-0 top-0 z-50 h-full w-[300px] max-w-[85vw] bg-card border-l border-border shadow-2xl md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between h-[68px] px-5 border-b border-border shrink-0">
                {brand()}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 -mr-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
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
                        activeSection === link.href ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
                      }`}
                    >
                      {t(link.labelKey)}
                      <ArrowRight className={`w-4 h-4 ${activeSection === link.href ? 'text-foreground' : 'text-muted-foreground'}`} />
                    </motion.a>
                  ))}
                </div>

                <div className="h-px bg-border my-4" />

                <motion.div
                  initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reduceMotion ? 0 : 0.3, duration: 0.25 }}
                  className="flex flex-col gap-3"
                >
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="text-[15px] font-semibold text-foreground transition-colors text-center py-2"
                  >
                    {t('common.buttons.loginToAccount')}
                  </Link>
                  <Button size="lg" onClick={() => navigate('/login')} className="w-full group">
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
