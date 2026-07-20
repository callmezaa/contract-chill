import { motion } from 'framer-motion';
import { NumberTicker } from '@/components/motion/number-ticker';

interface RiskScoreMeterProps {
  score: number;
}

export const RiskScoreMeter = ({ score }: RiskScoreMeterProps) => {
  const radius = 40;
  const dashArray = Math.PI * radius;
  const dashOffset = dashArray - (dashArray * score) / 100;
  
  // Angle: 0% = -90deg (pointing left), 100% = 90deg (pointing right)
  const needleRotation = -90 + (score * 180) / 100;

  const getColorClass = (s: number) => {
    if (s < 30) return 'text-green-500';
    if (s < 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const getLabel = (s: number) => {
    if (s < 30) return 'Safe';
    if (s < 60) return 'Moderate';
    return 'High Risk';
  };

  const colorClass = getColorClass(score);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-surface rounded-2xl border border-border shadow-sm overflow-hidden relative">
      <div className="relative w-48 h-24 overflow-hidden">
        {/* Gauge background */}
        <svg className="w-48 h-48" viewBox="0 0 100 100">
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            className="text-surface-2"
          />
          <motion.path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            strokeWidth="12"
            strokeDasharray={dashArray}
            initial={{ strokeDashoffset: dashArray }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
            strokeLinecap="round"
            className={colorClass}
          />
        </svg>

        {/* Dynamic Analog Needle Sweep */}
        <motion.div
          initial={{ rotate: -90 }}
          animate={{ rotate: needleRotation }}
          transition={{
            type: 'spring',
            stiffness: 45,
            damping: 13,
            delay: 0.15
          }}
          style={{
            transformOrigin: 'bottom center',
          }}
          className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[3px] h-16 origin-bottom z-0 ${colorClass}`}
        >
          {/* Main Pointer shaft */}
          <div className="w-full h-full bg-gradient-to-t from-text via-text/90 to-primary rounded-t-full shadow-lg" />
          
          {/* Subtle neon glowing tip indicator */}
          <div 
            className={`absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full animate-pulse shadow-md ${colorClass}`}
          />
        </motion.div>

        {/* Center pivot dot */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-background border-4 border-text rounded-full z-10" />
      </div>

      <div className="mt-4 text-center z-10">
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
           className="text-4xl font-mono font-semibold tracking-[-0.06em] text-text"
        >
          <NumberTicker value={score} duration={2} />%
        </motion.span>
        <div className="flex flex-col items-center gap-1 mt-1">
           <p className="text-[10px] font-medium text-text-subtle tracking-[0.12em] uppercase">Overall risk score</p>
          <motion.p 
            className={`text-xs font-bold ${colorClass}`}
          >
            {getLabel(score)}
          </motion.p>
        </div>
      </div>

      {/* Subtle background glow */}
      <div 
        className={`absolute inset-0 opacity-5 pointer-events-none transition-colors duration-1000 ${colorClass}`}
      />
    </div>
  );
};
