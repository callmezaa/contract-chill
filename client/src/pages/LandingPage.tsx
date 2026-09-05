import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, ArrowRight, CheckCircle,
  FileText, Brain, Clock, Star, ChevronRight,
  AlertTriangle, MessageSquare, TrendingUp, Lock, ArrowUp,
  Coffee, Scale, Briefcase, Palette
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MiniDemo } from '../components/MiniDemo';
import { LandingNav } from '../components/LandingNav';
import { SectionHeader } from '../components/SectionHeader';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Button } from '@/components/motion/button';
import { Accordion } from '../components/ui/accordion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  }
};

const stagger = {
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } }
};

export const LandingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [hoveredPersona, setHoveredPersona] = useState<number | null>(null);
  const [activePreview, setActivePreview] = useState<'risk' | 'summary' | 'tips'>('risk');
  const heroTitle = t('landing.hero.heroTitle', { returnObjects: true }) as { prefix?: string; highlight: string; suffix: string };
  const [showBackToTop, setShowBackToTop] = useState(false);

  useDocumentTitle(t('landing.title'));

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const trustBadges = [
    { icon: <CheckCircle className="w-4 h-4" />, text: t('landing.hero.trustBadges.noCreditCard') },
    { icon: <FileText className="w-4 h-4" />, text: t('landing.hero.trustBadges.pdfDocxSupport') },
    { icon: <Clock className="w-4 h-4" />, text: t('landing.hero.trustBadges.resultsInSeconds') },
  ];

  const stats = [
    { value: 'PDF · DOCX', label: t('landing.stats.formatsSupported') },
    { value: '4', label: t('landing.stats.aiPersonas') },
    { value: '< 15s', label: t('landing.stats.averageAnalysisTime') },
    { value: 'EN · ID', label: t('landing.stats.bilingual') },
  ];

  const howItWorksSteps = [
    {
      step: '01',
      icon: <FileText className="w-5 h-5 text-text-muted" />,
      title: t('landing.howItWorks.steps.0.title'),
      desc: t('landing.howItWorks.steps.0.desc')
    },
    {
      step: '02',
      icon: <Brain className="w-5 h-5 text-text-muted" />,
      title: t('landing.howItWorks.steps.1.title'),
      desc: t('landing.howItWorks.steps.1.desc')
    },
    {
      step: '03',
      icon: <CheckCircle className="w-5 h-5 text-text-muted" />,
      title: t('landing.howItWorks.steps.2.title'),
      desc: t('landing.howItWorks.steps.2.desc')
    }
  ];

  const personas = [
    {
      Icon: Scale,
      name: t('landing.personas.angryLawyer.name'),
      tone: t('landing.personas.angryLawyer.tone'),
      color: 'border-danger/20 bg-danger/5',
      badge: 'bg-danger/10 text-danger',
      desc: t('landing.personas.angryLawyer.desc'),
      preview: t('landing.personas.angryLawyer.preview')
    },
    {
      Icon: Coffee,
      name: t('landing.personas.chillFriend.name'),
      tone: t('landing.personas.chillFriend.tone'),
      color: 'border-brand/25 bg-brand-wash',
      badge: 'bg-brand/10 text-brand',
      desc: t('landing.personas.chillFriend.desc'),
      preview: t('landing.personas.chillFriend.preview')
    },
    {
      Icon: Briefcase,
      name: t('landing.personas.corporateMentor.name'),
      tone: t('landing.personas.corporateMentor.tone'),
      color: 'border-border bg-surface',
      badge: 'bg-surface-2 text-text-muted',
      desc: t('landing.personas.corporateMentor.desc'),
      preview: t('landing.personas.corporateMentor.preview')
    },
    {
      Icon: Palette,
      name: t('landing.personas.freelancerSenior.name'),
      tone: t('landing.personas.freelancerSenior.tone'),
      color: 'border-warning/20 bg-warning/5',
      badge: 'bg-warning/10 text-warning',
      desc: t('landing.personas.freelancerSenior.desc'),
      preview: t('landing.personas.freelancerSenior.preview')
    },
  ];

  const testimonials = t('landing.testimonials.items', { returnObjects: true }) as Array<{ quote: string; name: string; role: string }>;

  const faqs = t('landing.faq.items', { returnObjects: true }) as Array<{ q: string; a: string }>;

  const [featuredTestimonial, ...restTestimonials] = testimonials;


  return (
    <div className="min-h-screen bg-background flex flex-col font-sans overflow-hidden text-text">

      {/* ── NAV ─────────────────────────────────────────────── */}
      <LandingNav />

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-24 overflow-hidden">
        {/* Soft warm light behind the product */}
        <div aria-hidden="true" className="absolute left-1/2 top-24 -translate-x-1/2 w-[900px] h-[480px] rounded-full bg-brand/8 blur-[120px] opacity-70 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial="hidden" animate="show" variants={stagger}
            className="flex flex-col items-center gap-7"
          >
            {/* Title */}
            <motion.h1
              variants={fadeUp}
              className="text-[2.6rem] leading-[1.08] sm:text-6xl sm:leading-[1.06] md:text-[4.6rem] md:leading-[1.04] font-display font-medium text-text tracking-[-0.02em] max-w-4xl [text-wrap:balance]"
            >
              {heroTitle.prefix && `${heroTitle.prefix} `}
              <span className="relative inline-block px-2 pb-2 -mb-2 align-bottom">
                <motion.span
                  aria-hidden="true"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.55, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-x-0 bottom-1.5 top-[58%] origin-left rounded-[2px] bg-brand-wash"
                />
                <motion.em
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="relative z-10 italic whitespace-normal sm:whitespace-nowrap"
                >
                  {heroTitle.highlight}
                </motion.em>
              </span>,{' '}
              {heroTitle.suffix}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              className="text-text-muted text-base md:text-lg max-w-xl leading-relaxed [text-wrap:pretty]"
            >
              {t('landing.hero.subtitle')}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row items-center gap-3 mt-5"
            >
              <Button
                variant="primary" size="lg" backing={false} raised={false}
                className="rounded-lg hover:bg-primary/85"
                onClick={() => navigate('/login')}
              >
                {t('common.buttons.startWithContract')} <ArrowRight />
              </Button>
              <Button
                variant="outline" size="lg" backing={false} raised={false}
                className="rounded-lg bg-surface hover:bg-surface-2"
                onClick={() => {
                  document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {t('common.buttons.seeHowItWorks')}
              </Button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              variants={fadeUp}
              className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-7"
            >
              {trustBadges.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-medium text-text-muted">
                  <span className="text-brand">{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Product Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="relative mt-16 md:mt-20 max-w-5xl mx-auto group cursor-default"
          >
            {/* Main Preview Container */}
            <div className="relative bg-surface rounded-xl shadow-[0_32px_80px_-40px_rgba(27,27,24,0.35)] border border-border overflow-hidden transform group-hover:-translate-y-1.5 transition-transform duration-500 ease-out">
              {/* Fake browser bar */}
              <div className="bg-surface-2/60 border-b border-border px-4 py-3 flex items-center gap-3">
                <div className="flex gap-1.5 opacity-50">
                  <div className="size-2.5 rounded-full bg-text-subtle" />
                  <div className="size-2.5 rounded-full bg-text-subtle" />
                  <div className="size-2.5 rounded-full bg-text-subtle" />
                </div>
                <div className="flex-1 bg-surface rounded-md h-6 mx-4 flex items-center px-3">
                  <span className="text-xs text-text-subtle font-mono">contractchill.app/analyze</span>
                </div>
              </div>
              {/* Dashboard Preview */}
              <div className="p-4 sm:p-6 flex flex-col md:flex-row gap-4 min-h-[300px] bg-background/50">
                {/* Left: Fake PDF */}
                <div className="w-full md:flex-1 bg-surface rounded-lg border border-border p-4 flex flex-col gap-3 text-left relative shadow-sm">
                  {/* Hotspot 1 */}
                  <div className="absolute top-[40%] left-[60%] z-10 cursor-pointer">
                    <div className="relative flex items-center justify-center">
                      <div className="absolute w-5 h-5 bg-brand/40 rounded-full animate-ping" />
                      <div className="relative w-2.5 h-2.5 bg-brand rounded-full" />
                      {/* Tooltip */}
                      <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-surface text-text text-[10px] py-1.5 px-3 rounded-lg opacity-0 group-hover/pdf:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm border border-border z-20">
                        {t('landing.preview.uploadTooltip')}
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-surface rotate-45 border-l border-t border-border" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <FileText className="w-4 h-4 text-text-muted" />
                    <span className="text-xs font-medium text-text-muted font-mono">freelance_contract.pdf</span>
                  </div>
                  {['w-full', 'w-[85%]', 'w-[95%]', 'w-[70%]', 'w-[90%]', 'w-[60%]', 'w-[80%]'].map((w, i) => (
                    <div key={i} className={`h-2 bg-surface-2 rounded-full ${w}`} />
                  ))}
                </div>
                {/* Right: Fake Analysis */}
                <div className="w-full md:w-64 flex flex-col gap-3">
                  <button onClick={() => setActivePreview('risk')} className={`p-3 rounded-lg border text-left relative group/alert transition-[transform,box-shadow,background-color] duration-200 ${activePreview === 'risk' ? 'bg-danger/10 border-danger/20 shadow-sm -translate-y-0.5' : 'bg-surface border-border hover:bg-surface-2'}`}>
                    {/* Hotspot 2 */}
                    <div className="absolute -top-1.5 -left-1.5 z-10 cursor-pointer">
                      <div className="relative flex items-center justify-center">
                        <div className="absolute w-4 h-4 bg-brand/40 rounded-full animate-ping" />
                        <div className="relative w-2 h-2 bg-brand rounded-full" />
                        {/* Tooltip */}
                        <div className="absolute top-5 -left-2 bg-surface text-text text-[10px] py-1.5 px-3 rounded-lg opacity-0 group-hover/alert:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm border border-border z-20">
                          {t('landing.preview.riskTooltip')}
                          <div className="absolute -top-1 left-3 w-2 h-2 bg-surface rotate-45 border-l border-t border-border" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-danger" />
                      <span className="text-[11px] font-bold text-danger">{t('landing.preview.highRiskClause')}</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-1.5 bg-danger/15 rounded-full w-full" />
                      <div className="h-1.5 bg-danger/15 rounded-full w-4/5" />
                    </div>
                  </button>
                  <button onClick={() => setActivePreview('summary')} className={`p-3 rounded-lg border text-left transition-colors duration-200 ${activePreview === 'summary' ? 'bg-success/10 border-success/20 shadow-sm -translate-y-0.5' : 'bg-surface border-border hover:bg-surface-2'}`}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <CheckCircle className="w-3.5 h-3.5 text-success" />
                      <span className="text-[11px] font-bold text-success">{t('landing.preview.aiSummary')}</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-1.5 bg-success/15 rounded-full w-full" />
                      <div className="h-1.5 bg-success/15 rounded-full w-3/4" />
                      <div className="h-1.5 bg-success/15 rounded-full w-5/6" />
                    </div>
                  </button>
                  <button onClick={() => setActivePreview('tips')} className={`p-3 rounded-lg border text-left relative group/tips transition-[transform,box-shadow,background-color] duration-200 ${activePreview === 'tips' ? 'bg-brand/10 border-brand/20 shadow-sm -translate-y-0.5' : 'bg-surface border-border hover:bg-surface-2'}`}>
                    {/* Hotspot 3 */}
                    <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 z-10 cursor-pointer">
                      <div className="relative flex items-center justify-center">
                        <div className="absolute w-4 h-4 bg-brand/40 rounded-full animate-ping" />
                        <div className="relative w-2 h-2 bg-brand rounded-full" />
                        {/* Tooltip */}
                        <div className="absolute top-1/2 right-6 -translate-y-1/2 bg-surface text-text text-[10px] py-1.5 px-3 rounded-lg opacity-0 group-hover/tips:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm border border-border z-20">
                          {t('landing.preview.tipsTooltip')}
                          <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-surface rotate-45 border-l border-t border-border" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <MessageSquare className="w-3.5 h-3.5 text-text" />
                      <span className="text-[11px] font-bold text-text">{t('landing.preview.negotiationTips')}</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-1.5 bg-brand/20 rounded-full w-full" />
                      <div className="h-1.5 bg-brand/20 rounded-full w-2/3" />
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -left-8 top-1/3 hidden lg:flex items-center gap-2 bg-surface border border-border rounded-xl px-4 py-3 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-danger" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-text">{t('landing.preview.redFlagsFound')}</p>
                <p className="text-[10px] text-text-subtle">{t('landing.preview.reviewBeforeSigning')}</p>
              </div>
            </div>
            <div className="absolute -right-8 top-1/2 hidden lg:flex items-center gap-2 bg-surface border border-border rounded-xl px-4 py-3 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-success" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-text">{t('landing.preview.analysisReady')}</p>
                <p className="text-[10px] text-text-subtle">{t('landing.preview.completedInSeconds')}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SOCIAL PROOF STATS ──────────────────────────────── */}
      <section>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border border-y border-border">
            {stats.map((stat) => (
              <div key={stat.label} className="py-10 text-center">
                <p className="text-3xl font-display font-medium text-text tracking-[-0.01em]">{stat.value}</p>
                <p className="text-xs text-text-muted mt-1.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE MINI DEMO ───────────────────────────── */}
      <div className="bg-surface transition-colors duration-500">
        <MiniDemo />
      </div>

      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-28">
        <SectionHeader
          title={t('landing.howItWorks.title')}
          subtitle={t('landing.howItWorks.subtitle')}
        />

        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8"
        >
          {howItWorksSteps.map((item, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="flex flex-col items-center text-center gap-3"
            >
              <div className="flex items-center gap-2.5 text-text-subtle">
                <span className="font-mono text-xs tracking-widest">{item.step}</span>
                <span className="w-8 h-px bg-border" aria-hidden="true" />
                {item.icon}
              </div>
              <h3 className="font-display font-medium text-text text-xl">{item.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed max-w-[42ch]">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────── */}
      <section id="benefits" className="bg-surface transition-colors duration-500">
        <div className="max-w-6xl mx-auto px-6 py-28">
          <SectionHeader
            title={t('landing.features.title')}
            subtitle={t('landing.features.subtitle')}
          />

          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 lg:auto-rows-[280px]"
          >
            {/* Card 1: Red Flag (Large) */}
            <motion.div
              variants={fadeUp}
              className="md:col-span-2 lg:col-span-2 bg-surface rounded-xl border border-border p-8 hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-[box-shadow,transform] duration-200 group overflow-hidden relative flex flex-col md:flex-row gap-8 items-center"
            >
              <div className="flex-1 z-10 flex flex-col">
                <div className="flex items-center gap-2.5 mb-5">
                  <AlertTriangle className="text-danger w-5 h-5" />
                  <h3 className="text-xl font-display font-medium text-text">{t('landing.features.redFlagDetection.title')}</h3>
                </div>
                <p className="text-sm text-text-muted leading-relaxed">{t('landing.features.redFlagDetection.desc')}</p>
              </div>
              {/* Mini UI Illustration */}
              <div className="flex-1 w-full bg-surface-2/60 rounded-lg border border-border p-5 transform group-hover:-translate-y-1.5 group-hover:-translate-x-1.5 transition-transform duration-500 relative hidden sm:block">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <div className="h-2 w-24 bg-border rounded-full" />
                </div>
                <div className="p-3 bg-danger/5 border border-danger/10 rounded-lg">
                  <p className="text-[10px] text-danger font-bold mb-2">High Risk: IP Ownership</p>
                  <div className="h-1.5 w-full bg-danger/15 rounded-full mb-1.5" />
                  <div className="h-1.5 w-4/5 bg-danger/15 rounded-full mb-1.5" />
                  <div className="h-1.5 w-2/3 bg-danger/15 rounded-full" />
                </div>
              </div>
            </motion.div>

            {/* Card 2: Smart Summarization (Small) */}
            <motion.div variants={fadeUp} className="bg-surface rounded-xl border border-border p-8 hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-[box-shadow,transform] duration-200 flex flex-col group">
              <Brain className="text-text-muted w-5 h-5 mb-auto" />
              <h3 className="text-lg font-display font-medium text-text mb-2 mt-8">{t('landing.features.smartSummarization.title')}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{t('landing.features.smartSummarization.desc')}</p>
            </motion.div>

            {/* Card 3: Negotiation Tips (Small) */}
            <motion.div variants={fadeUp} className="bg-surface rounded-xl border border-border p-8 hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-[box-shadow,transform] duration-200 flex flex-col group">
              <TrendingUp className="text-success w-5 h-5 mb-auto" />
              <h3 className="text-lg font-display font-medium text-text mb-2 mt-8">{t('landing.features.negotiationTips.title')}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{t('landing.features.negotiationTips.desc')}</p>
            </motion.div>

            {/* Card 4: Secure & Private (Small) */}
            <motion.div variants={fadeUp} className="bg-surface rounded-xl border border-border p-8 hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-[box-shadow,transform] duration-200 flex flex-col group">
              <Lock className="text-text-muted w-5 h-5 mb-auto" />
              <h3 className="text-lg font-display font-medium text-text mb-2 mt-8">{t('landing.features.securePrivate.title')}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{t('landing.features.securePrivate.desc')}</p>
            </motion.div>

            {/* Card 5: PDF Viewer (Large) */}
            <motion.div
              variants={fadeUp}
              className="md:col-span-2 lg:col-span-2 bg-surface rounded-xl border border-border p-8 hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-[box-shadow,transform] duration-200 group overflow-hidden relative flex flex-col md:flex-row gap-8 items-center"
            >
              <div className="flex-1 z-10 flex flex-col">
                <div className="flex items-center gap-2.5 mb-5">
                  <FileText className="text-brand w-5 h-5" />
                  <h3 className="text-xl font-display font-medium text-text">{t('landing.features.sideBySideAnalysis.title')}</h3>
                </div>
                <p className="text-sm text-text-muted leading-relaxed">{t('landing.features.sideBySideAnalysis.desc')}</p>
              </div>
              {/* Mini UI Illustration */}
              <div className="flex-1 w-full bg-surface-2/60 rounded-lg border border-border flex overflow-hidden transform group-hover:scale-[1.03] transition-transform duration-500 h-36 hidden sm:flex">
                <div className="flex-1 p-4 border-r border-border flex flex-col gap-2.5 bg-surface/50">
                  <div className="h-2 w-1/2 bg-border rounded-full mb-1" />
                  <div className="h-1.5 w-full bg-border/60 rounded-full" />
                  <div className="h-1.5 w-full bg-border/60 rounded-full" />
                  <div className="h-1.5 w-3/4 bg-border/60 rounded-full" />
                  <div className="h-1.5 w-full bg-border/60 rounded-full mt-2" />
                  <div className="h-1.5 w-5/6 bg-border/60 rounded-full" />
                </div>
                <div className="flex-1 p-4 flex flex-col gap-3">
                  <div className="h-2 w-1/3 bg-brand/30 rounded-full" />
                  <div className="p-2.5 bg-brand-wash rounded-lg border border-brand/10">
                    <div className="h-1.5 w-full bg-brand/20 rounded-full mb-2" />
                    <div className="h-1.5 w-2/3 bg-brand/20 rounded-full" />
                  </div>
                  <div className="h-1.5 w-1/2 bg-success/20 rounded-full mt-1" />
                </div>
              </div>
            </motion.div>

            {/* Card 6: Analysis History (Small) */}
            <motion.div variants={fadeUp} className="bg-surface rounded-xl border border-border p-8 hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-[box-shadow,transform] duration-200 flex flex-col group">
              <Clock className="text-warning w-5 h-5 mb-auto" />
              <h3 className="text-lg font-display font-medium text-text mb-2 mt-8">{t('landing.features.analysisHistory.title')}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{t('landing.features.analysisHistory.desc')}</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── AI PERSONAS ─────────────────────────────────────── */}
      <section id="personas" className="max-w-6xl mx-auto px-6 py-28">
        <SectionHeader
          title={t('landing.personas.title')}
          subtitle={t('landing.personas.subtitle')}
        />

        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {personas.map((p, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              onMouseEnter={() => setHoveredPersona(i)}
              onMouseLeave={() => setHoveredPersona(null)}
              className={`relative rounded-xl border ${p.color} p-6 flex flex-col gap-3 hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-[box-shadow,transform] duration-200 cursor-default`}
            >
              {/* Speech Bubble */}
              <motion.div
                initial={false}
                animate={{
                  opacity: hoveredPersona === i ? 1 : 0,
                  y: hoveredPersona === i ? 0 : 10,
                  scale: hoveredPersona === i ? 1 : 0.95
                }}
                transition={{ duration: 0.2 }}
                className="absolute -top-14 left-0 right-0 bg-surface border border-border shadow-sm rounded-xl p-3 z-20 pointer-events-none"
              >
                <p className="text-[11px] font-medium text-text italic font-display h-8 leading-relaxed">
                  {p.preview.split("").map((char, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: hoveredPersona === i ? 1 : 0 }}
                      transition={{ delay: hoveredPersona === i ? index * 0.03 : 0, duration: 0.1 }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </p>
                <div className="absolute -bottom-1.5 left-8 w-3 h-3 bg-surface border-b border-r border-border transform rotate-45" />
              </motion.div>

              <p.Icon className="w-6 h-6 text-text-muted" />
              <div>
                <h3 className="font-display font-medium text-text text-base">{p.name}</h3>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.badge} tracking-wide`}>
                  {p.tone}
                </span>
              </div>
              <p className="text-sm text-text-muted leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────── */}
      <section className="bg-surface transition-colors duration-500">
        <div className="max-w-6xl mx-auto px-6 py-28">
          <SectionHeader
            title={t('landing.testimonials.title')}
          />

          {featuredTestimonial && (
            <motion.figure
              initial="hidden" whileInView="show" viewport={{ once: true }}
              variants={fadeUp}
              className="max-w-3xl mx-auto text-center mb-16"
            >
              <blockquote className="font-display italic font-medium text-2xl md:text-[2rem] md:leading-[1.35] text-text tracking-[-0.01em] [text-wrap:balance]">
                “{featuredTestimonial.quote}”
              </blockquote>
              <figcaption className="mt-5 text-sm text-text-muted">
                <span className="font-semibold text-text">{featuredTestimonial.name}</span>
                {' · '}
                {featuredTestimonial.role}
              </figcaption>
            </motion.figure>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {restTestimonials.map((item, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="show" viewport={{ once: true }}
                variants={fadeUp}
                transition={{ delay: i * 0.1 }}
                className="bg-surface rounded-xl border border-border p-6 flex flex-col gap-4"
              >
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 text-warning fill-warning" />
                  ))}
                </div>
                <p className="text-sm text-text-muted leading-relaxed flex-1">"{item.quote}"</p>
                <div>
                  <p className="text-sm font-semibold text-text">{item.name}</p>
                  <p className="text-xs text-text-subtle">{item.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section id="faq">
        <div className="max-w-3xl mx-auto px-6 py-28">
          <SectionHeader
            title={t('landing.faq.title')}
            className="mb-12"
          />

          <Accordion items={faqs.map((faq, i) => ({ value: String(i), title: faq.q, content: faq.a }))} />
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-28 text-center">
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
          className="flex flex-col items-center gap-6 max-w-2xl mx-auto"
        >
          <motion.div variants={fadeUp}>
            <img src="/logo/brandLogo_black.png" alt="ContractChill Logo" className="w-14 h-14 rounded-xl shadow-sm" />
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-display font-medium tracking-[-0.02em] text-text leading-[1.1] [text-wrap:balance]">
            {t('landing.finalCta.title')}
          </motion.h2>
          <motion.p variants={fadeUp} className="text-text-muted text-lg max-w-xl [text-wrap:pretty]">
            {t('landing.finalCta.subtitle')}
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
            <Button variant="primary" size="lg" backing={false} raised={false} className="group rounded-lg hover:bg-primary/85" onClick={() => navigate('/login')}>
              {t('landing.finalCta.button')}
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
          <motion.p variants={fadeUp} className="text-xs text-text-subtle">
            {t('landing.finalCta.disclaimer')}
          </motion.p>
        </motion.div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="bg-surface transition-colors duration-500">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="flex flex-col md:flex-row justify-between gap-10 mb-12">
            {/* Brand */}
            <div className="flex flex-col gap-4 max-w-xs">
              <div className="flex items-center gap-2">
                <img src="/logo/brandLogo_black.png" alt="ContractChill Logo" className="w-7 h-7 rounded-md" />
                <span className="font-display font-medium text-text text-lg">{t('common.appName')}</span>
              </div>
              <p className="text-sm text-text-muted leading-relaxed">
                {t('landing.footer.description')}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-text-subtle">
                <Lock className="w-3 h-3" />
                <span>{t('landing.footer.privacyNote')}</span>
              </div>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
              <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold text-text-muted">{t('landing.footer.product')}</p>
                <a href="#how-it-works" className="text-text-muted hover:text-text transition-colors">{t('common.nav.howItWorks')}</a>
               <a href="#benefits" className="text-text-muted hover:text-text transition-colors">{t('common.nav.benefits')}</a>
                <a href="#personas" className="text-text-muted hover:text-text transition-colors">{t('common.nav.personas')}</a>
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold text-text-muted">{t('landing.footer.useCases')}</p>
                <span className="text-text-muted">{t('landing.footer.freelancers')}</span>
                <span className="text-text-muted">{t('landing.footer.founders')}</span>
                <span className="text-text-muted">{t('landing.footer.creators')}</span>
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold text-text-muted">{t('landing.footer.legal')}</p>
                <Link to="/privacy" className="text-text-muted hover:text-text transition-colors">{t('landing.footer.privacyPolicy')}</Link>
                <Link to="/terms" className="text-text-muted hover:text-text transition-colors">{t('landing.footer.termsOfService')}</Link>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-text-subtle">
              {t('landing.footer.copyright', { year: new Date().getFullYear() })}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-subtle">{t('landing.footer.poweredBy')}</span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface border border-border">
                <Sparkles className="w-3 h-3 text-brand" />
                <span className="text-[11px] font-semibold text-text">{t('landing.footer.googleGemini')}</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            whileHover={{ y: -4, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToTop}
             aria-label={t('landing.footer.backToTop')}
             className="fixed bottom-8 right-8 z-50 size-11 flex items-center justify-center rounded-full bg-surface border border-border text-text hover:bg-surface-2 shadow-sm transition-[background-color,transform] active:scale-[0.96]"
            title={t('landing.footer.backToTop')}
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
