import { motion, useReducedMotion, useInView } from 'motion/react';
import { useRef } from 'react';
import { EASE_OUT } from '@/lib/ease';

interface AreaChartProps {
  data: { week: string; count: number }[];
}

export function AreaChart({ data }: AreaChartProps) {
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

  const maxCount = Math.max(...data.map(d => d.count), 1);
  const width = 600;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate points
  const points = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * chartWidth,
    y: padding.top + chartHeight - (d.count / maxCount) * chartHeight,
    ...d,
  }));

  // Create smooth path using cardinal spline
  const pathD = points.reduce((acc, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prev = points[i - 1];
    const cpx = (prev.x + point.x) / 2;
    return `${acc} C ${cpx} ${prev.y}, ${cpx} ${point.y}, ${point.x} ${point.y}`;
  }, '');

  // Area path (close to bottom)
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

  // Y-axis labels
  const yLabels = [0, Math.ceil(maxCount / 2), maxCount];

  return (
    <div ref={ref} className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {yLabels.map((label, i) => {
          const y = padding.top + chartHeight - (label / maxCount) * chartHeight;
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="currentColor"
                className="text-border"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-text-subtle"
                style={{ fontSize: '10px' }}
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* X-axis labels */}
        {points.map((point, i) => (
          <text
            key={i}
            x={point.x}
            y={height - 8}
            textAnchor="middle"
            className="fill-text-subtle"
            style={{ fontSize: '10px' }}
          >
            {point.week}
          </text>
        ))}

        {/* Gradient fill */}
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="currentColor" className="text-primary" stopOpacity="0.2" />
            <stop offset="100%" stopColor="currentColor" className="text-primary" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <motion.path
          d={areaD}
          fill="url(#areaGradient)"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={reduce ? { duration: 0 } : { duration: 1, ease: EASE_OUT }}
        />

        {/* Line path */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="currentColor"
          className="text-primary"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : {}}
          transition={reduce ? { duration: 0 } : { duration: 1.5, ease: EASE_OUT }}
        />

        {/* Data points */}
        {points.map((point, i) => (
          <motion.circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="currentColor"
            className="text-primary"
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={reduce ? { duration: 0 } : { duration: 0.3, delay: 0.5 + i * 0.05 }}
          />
        ))}
      </svg>
    </div>
  );
}
