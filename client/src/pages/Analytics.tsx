import { motion } from 'motion/react';
import { useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { Loader } from '@/components/motion/loader';
import { NumberTicker } from '@/components/motion/number-ticker';
import { DonutChart } from '@/components/charts/DonutChart';
import { BarChart } from '@/components/charts/BarChart';
import { AreaChart } from '@/components/charts/AreaChart';
import { TopRedFlags } from '@/components/charts/TopRedFlags';
import { RiskScoreMeter } from '@/components/RiskScoreMeter';
import { BarChart3, TrendingUp, Shield, AlertTriangle } from 'lucide-react';
import { EASE_OUT } from '@/lib/ease';

export const Analytics = () => {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const { data, isLoading } = useAnalyticsData();

  useDocumentTitle(`${t('analytics.title')} - ContractChill`);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader variant="bars" size={32} />
      </div>
    );
  }

  if (!data || data.totalAnalyses === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
        <div className="w-20 h-20 rounded-2xl bg-surface flex items-center justify-center border border-border shadow-sm">
          <BarChart3 className="w-10 h-10 text-text-subtle/60" />
        </div>
        <div>
          <h2 className="font-display font-bold text-xl text-text">{t('analytics.emptyTitle')}</h2>
          <p className="text-sm text-text-muted mt-1 max-w-xs">{t('analytics.emptyDescription')}</p>
        </div>
      </div>
    );
  }

  const stagger = (i: number) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 16 },
    animate: reduce ? { opacity: 1 } : { opacity: 1, y: 0 },
    transition: reduce ? { duration: 0 } : { duration: 0.5, ease: EASE_OUT, delay: i * 0.1 },
  });

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl">
      {/* Header */}
      <motion.div {...stagger(0)}>
        <h1 className="text-3xl sm:text-4xl font-display font-semibold tracking-[-0.05em] text-text">
          {t('analytics.title')}
        </h1>
        <p className="text-text-muted text-sm mt-1">{t('analytics.subtitle')}</p>
      </motion.div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Analyses */}
        <motion.div {...stagger(1)} className="bg-surface rounded-2xl border border-border shadow-sm p-6 flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <span className="text-3xl font-display font-bold tracking-[-0.06em] text-text">
            <NumberTicker value={data.totalAnalyses} duration={1.5} />
          </span>
          <span className="text-xs text-text-subtle">{t('analytics.totalAnalyses')}</span>
        </motion.div>

        {/* Average Risk Score */}
        <motion.div {...stagger(2)} className="bg-surface rounded-2xl border border-border shadow-sm p-6 flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <RiskScoreMeter score={data.avgRiskScore} />
          <span className="text-xs text-text-subtle">{t('analytics.avgRiskScore')}</span>
        </motion.div>

        {/* Safe Rate */}
        <motion.div {...stagger(3)} className="bg-surface rounded-2xl border border-border shadow-sm p-6 flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-green-500" />
          </div>
          <span className="text-3xl font-display font-bold tracking-[-0.06em] text-text">
            <NumberTicker value={data.safeRate} duration={1.5} />%
          </span>
          <span className="text-xs text-text-subtle">{t('analytics.safeRate')}</span>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <motion.div {...stagger(4)} className="bg-surface rounded-2xl border border-border shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-4 h-4 text-text-subtle" />
            <h2 className="text-sm font-semibold text-text">{t('analytics.riskDistribution')}</h2>
          </div>
          <DonutChart
            high={data.riskDistribution.high}
            medium={data.riskDistribution.medium}
            safe={data.riskDistribution.safe}
          />
        </motion.div>

        {/* Persona Popularity */}
        <motion.div {...stagger(5)} className="bg-surface rounded-2xl border border-border shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-4 h-4 text-text-subtle" />
            <h2 className="text-sm font-semibold text-text">{t('analytics.personaPopularity')}</h2>
          </div>
          <BarChart data={data.personaPopularity} />
        </motion.div>
      </div>

      {/* Activity Timeline */}
      <motion.div {...stagger(6)} className="bg-surface rounded-2xl border border-border shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-4 h-4 text-text-subtle" />
          <h2 className="text-sm font-semibold text-text">{t('analytics.activityTimeline')}</h2>
        </div>
        <AreaChart data={data.activityTimeline} />
      </motion.div>

      {/* Top Red Flags */}
      <motion.div {...stagger(7)} className="bg-surface rounded-2xl border border-border shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <AlertTriangle className="w-4 h-4 text-text-subtle" />
          <h2 className="text-sm font-semibold text-text">{t('analytics.topRedFlags')}</h2>
        </div>
        <TopRedFlags data={data.topRedFlags} />
      </motion.div>
    </div>
  );
};
