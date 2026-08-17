import { motion } from 'motion/react';

const stagger = {
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

interface SectionHeaderProps {
  label: string;
  title: string;
  subtitle?: string;
  className?: string;
}

export const SectionHeader = ({ label, title, subtitle, className = 'mb-16' }: SectionHeaderProps) => (
  <motion.div
    initial="hidden"
    whileInView="show"
    viewport={{ once: true }}
    variants={stagger}
    className={`flex flex-col items-center gap-3 text-center ${className}`}
  >
    <motion.p variants={fadeUp} className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
      {label}
    </motion.p>
    <motion.h2
      variants={fadeUp}
      className="text-3xl md:text-4xl font-display font-semibold tracking-[-0.05em] text-text [text-wrap:balance]"
    >
      {title}
    </motion.h2>
    {subtitle && (
      <motion.p variants={fadeUp} className="text-text-muted max-w-xl [text-wrap:pretty]">
        {subtitle}
      </motion.p>
    )}
  </motion.div>
);
