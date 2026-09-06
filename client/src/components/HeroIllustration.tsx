import { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
  useTransform,
} from 'motion/react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Coffee,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: 0.15 + i * 0.1, type: 'spring' as const, duration: 0.7, bounce: 0 },
  }),
};

/**
 * Brand illustration for the hero: a composed stack of the product's own UI —
 * an annotated contract, the AI summary card, a risk chip, and a persona bubble.
 * Layers idle-float and drift subtly with the pointer.
 */
export const HeroIllustration = () => {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });

  const docX = useTransform(sx, (v) => v * 6);
  const docY = useTransform(sy, (v) => v * 6);
  const chipAX = useTransform(sx, (v) => v * 14);
  const chipAY = useTransform(sy, (v) => v * 14);
  const chipBX = useTransform(sx, (v) => v * 20);
  const chipBY = useTransform(sy, (v) => v * 20);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handlePointerLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const float = (duration: number, delay = 0) =>
    reduceMotion
      ? {}
      : {
          animate: { y: [0, -8, 0] },
          transition: { duration, delay, repeat: Infinity, ease: 'easeInOut' as const },
        };

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative h-[380px] sm:h-[440px] lg:h-[500px] select-none"
      aria-hidden="true"
    >
      {/* ── Document card (main layer) ── */}
      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="show"
        style={{ x: docX, y: docY }}
        className="absolute left-1/2 lg:left-[54%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-[78%] sm:w-[72%] max-w-[320px] z-10"
      >
        <motion.div {...float(6)}>
          <div className="bg-card border border-border rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_48px_-24px_rgba(0,0,0,0.16)] p-5 rotate-1">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground font-mono">freelance_contract.pdf</span>
            </div>

            <div className="pt-4 space-y-2.5">
              <div className="h-2 bg-accent rounded-full w-full" />
              <div className="h-2 bg-accent rounded-full w-5/6" />
              <div className="h-2 bg-accent rounded-full w-full" />

              {/* Flagged clause */}
              <div className="relative rounded-md bg-destructive/8 border border-destructive/16 px-3 py-2.5 group/flag cursor-default">
                <motion.span
                  className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-destructive ring-2 ring-card"
                  {...float(4, 0.5)}
                />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-destructive">{t('landing.preview.highRiskClause')}</span>
                  <span className="text-[9px] font-mono text-destructive/80 tabular-nums">§7.2</span>
                </div>
                <div className="mt-1.5 space-y-1">
                  <div className="h-1.5 bg-destructive/16 rounded-full w-full" />
                  <div className="h-1.5 bg-destructive/16 rounded-full w-2/3" />
                </div>
              </div>

              <div className="h-2 bg-accent rounded-full w-3/4" />

              {/* Clean clause */}
              <div className="rounded-md bg-success/8 border border-success/16 px-3 py-2.5">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3 h-3 text-success" />
                  <span className="text-[10px] font-bold text-success">{t('landing.preview.aiSummary')}</span>
                </div>
                <div className="mt-1.5 space-y-1">
                  <div className="h-1.5 bg-success/16 rounded-full w-full" />
                  <div className="h-1.5 bg-success/16 rounded-full w-4/5" />
                </div>
              </div>

              <div className="h-2 bg-accent rounded-full w-full" />
              <div className="h-2 bg-accent rounded-full w-2/3" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ── AI Summary card (top right) ── */}
      <motion.div
        custom={1}
        variants={fadeUp}
        initial="hidden"
        animate="show"
        style={{ x: chipAX, y: chipAY }}
        className="absolute right-0 sm:-right-2 top-4 sm:top-8 w-[170px] sm:w-[190px]"
      >
        <motion.div {...float(7, 0.8)}>
          <div className="bg-card border border-border rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_40px_-16px_rgba(0,0,0,0.16)] p-3.5 -rotate-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="size-6 rounded-md bg-primary flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
              </span>
              <span className="text-xs font-semibold text-foreground">{t('landing.preview.aiSummary')}</span>
            </div>
            <div className="space-y-1.5">
              <div className="h-1.5 bg-accent rounded-full w-full" />
              <div className="h-1.5 bg-accent rounded-full w-3/4" />
            </div>
            <span className="inline-flex mt-2.5 text-[9px] font-mono font-medium text-muted-foreground bg-accent rounded-sm px-1.5 py-0.5 tabular-nums">
              {t('landing.preview.completedInSeconds')}
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Red flags chip (bottom left) ── */}
      <motion.div
        custom={2}
        variants={fadeUp}
        initial="hidden"
        animate="show"
        style={{ x: chipBX, y: chipBY }}
        className="absolute left-0 sm:-left-3 bottom-10 sm:bottom-16 z-20"
      >
        <motion.div {...float(5.5, 1.2)}>
          <div className="flex items-center gap-2.5 bg-card border border-border rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_40px_-16px_rgba(0,0,0,0.16)] px-3.5 py-3 rotate-1">
            <span className="size-7 rounded-lg bg-destructive/8 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
            </span>
            <div>
              <p className="text-xs font-bold text-foreground">{t('landing.preview.redFlagsFound')}</p>
              <p className="text-[10px] text-muted-foreground">{t('landing.preview.reviewBeforeSigning')}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Persona bubble (top left) ── */}
      <motion.div
        custom={3}
        variants={fadeUp}
        initial="hidden"
        animate="show"
        style={{ x: chipBX, y: chipAY }}
        className="absolute left-2 sm:left-4 top-6 sm:top-8 z-20"
      >
        <motion.div {...float(6.5, 0.2)}>
          <div className="flex items-center gap-2.5 bg-card border border-border rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_40px_-16px_rgba(0,0,0,0.16)] px-3 py-2.5 -rotate-1">
            <span className="size-7 rounded-full bg-secondary border border-border flex items-center justify-center">
              <Coffee className="w-3.5 h-3.5 text-muted-foreground" />
            </span>
            <div>
              <p className="text-xs font-semibold text-foreground">{t('landing.personas.chillFriend.name')}</p>
              <p className="text-[10px] italic text-muted-foreground">{t('landing.personas.chillFriend.tone')}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
