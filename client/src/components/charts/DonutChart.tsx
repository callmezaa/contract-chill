import { motion, useReducedMotion, useInView } from 'motion/react';
import { useRef } from 'react';
import { EASE_OUT } from '@/lib/ease';
import { useTranslation } from 'react-i18next';

interface DonutChartProps {
  high: number;
  medium: number;
  safe: number;
}

const COLORS = {
  high: { stroke: '#ef4444', bg: 'bg-red-500/10', text: 'text-red-500' },
  medium: { stroke: '#f59e0b', bg: 'bg-amber-500/10', text: 'text-amber-500' },
  safe: { stroke: '#22c55e', bg: 'bg-green-500/10', text: 'text-green-500' },
};

export function DonutChart({ high, medium, safe }: DonutChartProps) {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });

  const total = high + medium + safe;
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-text-subtle text-sm">
        {t('analytics.noData')}
      </div>
    );
  }

  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  const highPct = high / total;
  const mediumPct = medium / total;
  const safePct = safe / total;

  const highLen = highPct * circumference;
  const mediumLen = mediumPct * circumference;
  const safeLen = safePct * circumference;

  // Starting offsets (rotate clockwise from top)
  const highOffset = 0;
  const mediumOffset = highLen;
  const safeOffset = highLen + mediumLen;

  const segments = [
    { key: 'high', len: highLen, offset: highOffset, ...COLORS.high },
    { key: 'medium', len: mediumLen, offset: mediumOffset, ...COLORS.medium },
    { key: 'safe', len: safeLen, offset: safeOffset, ...COLORS.safe },
  ];

  return (
    <div ref={ref} className="flex flex-col items-center gap-4">
      <div className="relative">
        <svg width="180" height="180" viewBox="0 0 180 180">
          {/* Background circle */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="24"
            className="text-surface-2"
          />

          {/* Animated segments */}
          {segments.map(({ key, len, offset, stroke }) => (
            <motion.circle
              key={key}
              cx="90"
              cy="90"
              r={radius}
              fill="none"
              stroke={stroke}
              strokeWidth="24"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
              initial={reduce ? { strokeDashoffset: circumference - len } : { strokeDashoffset: circumference }}
              animate={isInView ? { strokeDashoffset: circumference - len } : {}}
              transition={reduce ? { duration: 0 } : { duration: 1.5, ease: EASE_OUT, delay: 0.2 }}
              transform={`rotate(-90 90 90)`}
              style={{ offset: `${offset}px` }}
            />
          ))}

          {/* Center text */}
          <text
            x="90"
            y="85"
            textAnchor="middle"
            className="fill-text font-display font-bold text-3xl"
            style={{ fontSize: '36px' }}
          >
            {total}
          </text>
          <text
            x="90"
            y="108"
            textAnchor="middle"
            className="fill-text-subtle text-xs"
            style={{ fontSize: '11px' }}
          >
            {t('analytics.totalFlags')}
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs">
        {[
          { key: 'high', count: high, label: t('analytics.highRisk'), ...COLORS.high },
          { key: 'medium', count: medium, label: t('analytics.mediumRisk'), ...COLORS.medium },
          { key: 'safe', count: safe, label: t('analytics.safeRisk'), ...COLORS.safe },
        ].map(({ key, count, label, bg, text }) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${bg}`} />
            <span className={`font-semibold ${text}`}>{count}</span>
            <span className="text-text-subtle">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
