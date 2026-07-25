import { motion, useReducedMotion, useInView } from 'motion/react';
import { useRef } from 'react';
import { EASE_OUT } from '@/lib/ease';
import { Coffee, Scale, Briefcase, Shield, type LucideIcon } from 'lucide-react';

interface BarChartProps {
  data: { persona: string; count: number; percent: number }[];
}

const PERSONA_ICONS: Record<string, LucideIcon> = {
  'Chill Friend': Coffee,
  'Angry Lawyer': Scale,
  'Corporate Mentor': Briefcase,
  'Freelancer Senior': Shield,
};

const PERSONA_COLORS: Record<string, string> = {
  'Chill Friend': 'bg-emerald-500',
  'Angry Lawyer': 'bg-red-500',
  'Corporate Mentor': 'bg-blue-500',
  'Freelancer Senior': 'bg-amber-500',
};

const PERSONA_LABELS: Record<string, string> = {
  'Chill Friend': 'chillFriend',
  'Angry Lawyer': 'angryLawyer',
  'Corporate Mentor': 'corporateMentor',
  'Freelancer Senior': 'freelancerSenior',
};

export function BarChart({ data }: BarChartProps) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-text-subtle text-sm">
        No data yet
      </div>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <div ref={ref} className="flex flex-col gap-3">
      {data.map(({ persona, count, percent }, i) => {
        const Icon = PERSONA_ICONS[persona] || Shield;
        const color = PERSONA_COLORS[persona] || 'bg-gray-500';
        const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;

        return (
          <div key={persona} className="flex items-center gap-3">
            <div className="flex items-center gap-2 w-32 shrink-0">
              <Icon className="w-4 h-4 text-text-subtle" />
              <span className="text-xs text-text truncate">{persona}</span>
            </div>

            <div className="flex-1 h-6 bg-surface-2 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${color}`}
                initial={{ width: 0 }}
                animate={isInView ? { width: `${barWidth}%` } : {}}
                transition={reduce ? { duration: 0 } : { duration: 0.8, ease: EASE_OUT, delay: 0.1 + i * 0.1 }}
              />
            </div>

            <div className="flex items-center gap-1.5 w-16 shrink-0 justify-end">
              <span className="text-xs font-semibold text-text">{count}</span>
              <span className="text-[10px] text-text-subtle">({percent}%)</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
