import { motion, useReducedMotion, useInView } from 'motion/react';
import { useRef } from 'react';
import { EASE_OUT } from '@/lib/ease';
import { AlertTriangle, Shield, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TopRedFlagsProps {
  data: { clause: string; risk: string; count: number }[];
}

const RISK_CONFIG = {
  High: {
    icon: AlertTriangle,
    bg: 'bg-red-500/10',
    text: 'text-red-500',
    border: 'border-red-500/20',
    label: 'highRisk',
  },
  Medium: {
    icon: Shield,
    bg: 'bg-amber-500/10',
    text: 'text-amber-500',
    border: 'border-amber-500/20',
    label: 'mediumRisk',
  },
  Safe: {
    icon: CheckCircle2,
    bg: 'bg-green-500/10',
    text: 'text-green-500',
    border: 'border-green-500/20',
    label: 'safeRisk',
  },
};

export function TopRedFlags({ data }: TopRedFlagsProps) {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-text-subtle text-sm">
        {t('analytics.noFlagsYet')}
      </div>
    );
  }

  return (
    <div ref={ref} className="flex flex-col gap-2">
      {data.map(({ clause, risk, count }, i) => {
        const config = RISK_CONFIG[risk as keyof typeof RISK_CONFIG] || RISK_CONFIG.Safe;
        const Icon = config.icon;

        return (
          <motion.div
            key={i}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: -10 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={reduce ? { duration: 0 } : { duration: 0.4, ease: EASE_OUT, delay: i * 0.08 }}
            className="flex items-start gap-3 p-3 rounded-xl bg-surface-2/50 border border-border/50"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${config.bg}`}>
              <Icon className={`w-4 h-4 ${config.text}`} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs text-text leading-relaxed line-clamp-2">{clause}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${config.bg} ${config.text}`}>
                  {t(`analytics.${config.label}`)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <span className="text-sm font-bold text-text">{count}</span>
              <span className="text-[10px] text-text-subtle">x</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
