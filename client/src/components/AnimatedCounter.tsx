import { useEffect, useState } from 'react';
import { animate } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
}

export const AnimatedCounter = ({ value, duration = 1.5 }: AnimatedCounterProps) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: duration,
      ease: 'easeOut',
      onUpdate(currentValue) {
        setDisplayValue(Math.round(currentValue));
      },
    });

    return () => controls.stop();
  }, [value, duration]);

  return <span>{displayValue}</span>;
};
