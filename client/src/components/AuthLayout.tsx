import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import { useTheme } from '../context/ThemeContext';
import { HeroIllustration } from './HeroIllustration';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

const stagger = {
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

/**
 * Shared auth shell: one rounded app-frame split into a form column (left)
 * and a brand panel (right) — same world as the landing hero.
 */
export const AuthLayout = ({ title, subtitle, children, footer }: AuthLayoutProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const resolvedTheme = theme !== 'system' ? theme : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const logoSrc = resolvedTheme === 'dark' ? '/logo/brandLogo_white.png' : '/logo/brandLogo_black.png';

  const featured = t('landing.testimonials.items', { returnObjects: true }) as Array<{ quote: string; name: string; role: string }>;
  const quote = featured[0];

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-3 sm:p-5 font-sans text-foreground">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl bg-card border border-border rounded-3xl shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_64px_-32px_rgba(0,0,0,0.16)] overflow-hidden grid lg:grid-cols-[1fr_1fr]"
      >
        {/* ── Left: form column ── */}
        <div className="flex flex-col p-6 sm:p-10 lg:p-12 min-h-[560px] lg:min-h-[680px]">
          <motion.div
            initial="hidden" animate="show" variants={stagger}
            className="flex flex-col flex-1"
          >
            <motion.div variants={fadeUp}>
              <Link to="/" className="inline-flex items-center gap-2.5 group w-fit" aria-label={t('common.appName')}>
                <img src={logoSrc} alt="" className="size-8 rounded-lg transition-transform duration-200 group-hover:scale-105" />
                <span className="font-display text-lg font-semibold tracking-[-0.02em]">{t('common.appName')}</span>
              </Link>
            </motion.div>

            <div className="my-auto py-10 w-full max-w-sm">
              <motion.h1
                variants={fadeUp}
                className="text-3xl md:text-4xl font-display font-bold tracking-[-0.03em] [text-wrap:balance]"
              >
                {title}
              </motion.h1>
              <motion.p variants={fadeUp} className="mt-2.5 text-sm md:text-[15px] text-muted-foreground leading-relaxed [text-wrap:pretty]">
                {subtitle}
              </motion.p>
              <motion.div variants={fadeUp} className="mt-8">
                {children}
              </motion.div>
            </div>

            <motion.div variants={fadeUp} className="mt-auto pt-6 text-xs text-muted-foreground">
              {footer}
            </motion.div>
          </motion.div>
        </div>

        {/* ── Right: brand panel ── */}
        <div className="hidden lg:flex relative flex-col items-center justify-center gap-6 bg-secondary/50 border-l border-border p-10 overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full bg-background blur-[90px] opacity-70 pointer-events-none"
          />
          <div className="relative w-full max-w-[430px] scale-[0.82] origin-center">
            <HeroIllustration />
          </div>
          {quote && (
            <motion.figure
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative max-w-sm text-center"
            >
              <blockquote className="font-display font-medium text-[15px] leading-relaxed text-foreground [text-wrap:pretty]">
                “{quote.quote}”
              </blockquote>
              <figcaption className="mt-3 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{quote.name}</span>
                {' · '}
                {quote.role}
              </figcaption>
            </motion.figure>
          )}
        </div>
      </motion.div>
    </div>
  );
};
