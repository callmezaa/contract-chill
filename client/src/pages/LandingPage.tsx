import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, ArrowRight, CheckCircle,
  FileText, Brain, Clock, Star, ChevronRight,
  AlertTriangle, TrendingUp, Lock, ArrowUp,
  Coffee, Scale, Briefcase, Palette
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MiniDemo } from '../components/MiniDemo';
import { LandingNav } from '../components/LandingNav';
import { SectionHeader } from '../components/SectionHeader';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { HeroIllustration } from '../components/HeroIllustration';
import { Button } from '@/components/coss/button';
import { Card } from '@/components/coss/card';
import { Badge } from '@/components/coss/badge';
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from '@/components/coss/accordion';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  }
};

const stagger = {
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.08 } }
};

export const LandingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [hoveredPersona, setHoveredPersona] = useState<number | null>(null);
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
    { icon: <CheckCircle className="w-3.5 h-3.5" />, text: t('landing.hero.trustBadges.noCreditCard') },
    { icon: <FileText className="w-3.5 h-3.5" />, text: t('landing.hero.trustBadges.pdfDocxSupport') },
    { icon: <Clock className="w-3.5 h-3.5" />, text: t('landing.hero.trustBadges.resultsInSeconds') },
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
      icon: <FileText className="w-4 h-4 text-foreground" />,
      title: t('landing.howItWorks.steps.0.title'),
      desc: t('landing.howItWorks.steps.0.desc')
    },
    {
      step: '02',
      icon: <Brain className="w-4 h-4 text-foreground" />,
      title: t('landing.howItWorks.steps.1.title'),
      desc: t('landing.howItWorks.steps.1.desc')
    },
    {
      step: '03',
      icon: <CheckCircle className="w-4 h-4 text-foreground" />,
      title: t('landing.howItWorks.steps.2.title'),
      desc: t('landing.howItWorks.steps.2.desc')
    }
  ];

  const personas = [
    {
      Icon: Scale,
      name: t('landing.personas.angryLawyer.name'),
      tone: t('landing.personas.angryLawyer.tone'),
      badgeVariant: 'error' as const,
      desc: t('landing.personas.angryLawyer.desc'),
      preview: t('landing.personas.angryLawyer.preview')
    },
    {
      Icon: Coffee,
      name: t('landing.personas.chillFriend.name'),
      tone: t('landing.personas.chillFriend.tone'),
      badgeVariant: 'secondary' as const,
      desc: t('landing.personas.chillFriend.desc'),
      preview: t('landing.personas.chillFriend.preview')
    },
    {
      Icon: Briefcase,
      name: t('landing.personas.corporateMentor.name'),
      tone: t('landing.personas.corporateMentor.tone'),
      badgeVariant: 'outline' as const,
      desc: t('landing.personas.corporateMentor.desc'),
      preview: t('landing.personas.corporateMentor.preview')
    },
    {
      Icon: Palette,
      name: t('landing.personas.freelancerSenior.name'),
      tone: t('landing.personas.freelancerSenior.tone'),
      badgeVariant: 'warning' as const,
      desc: t('landing.personas.freelancerSenior.desc'),
      preview: t('landing.personas.freelancerSenior.preview')
    },
  ];

  const testimonials = t('landing.testimonials.items', { returnObjects: true }) as Array<{ quote: string; name: string; role: string }>;

  const faqs = t('landing.faq.items', { returnObjects: true }) as Array<{ q: string; a: string }>;

  const [featuredTestimonial, ...restTestimonials] = testimonials;


  return (
    <div className="min-h-screen bg-secondary flex flex-col font-sans overflow-hidden text-foreground">

      {/* ── HERO CONTAINER — nav + hero in one rounded frame ── */}
      <section className="px-3 sm:px-5 pt-3 sm:pt-5">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-[1216px] mx-auto bg-card border border-border rounded-3xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_64px_-32px_rgba(0,0,0,0.16)]"
        >
          <LandingNav />

          <div className="max-w-6xl mx-auto px-6 md:px-10 pt-8 md:pt-12 pb-12 md:pb-16 grid lg:grid-cols-[1.04fr_0.96fr] gap-12 lg:gap-10 items-center">
            {/* Left: copy */}
            <motion.div
              initial="hidden" animate="show" variants={stagger}
              className="flex flex-col items-start gap-7"
            >
              {/* Title */}
              <motion.h1
                variants={fadeUp}
                className="text-[2.35rem] leading-[1.08] sm:text-5xl sm:leading-[1.06] md:text-[3.5rem] md:leading-[1.04] font-display font-bold text-foreground tracking-[-0.03em] max-w-xl [text-wrap:balance]"
              >
                {heroTitle.prefix && `${heroTitle.prefix} `}
                {heroTitle.highlight},{' '}
                {heroTitle.suffix}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                variants={fadeUp}
                className="text-muted-foreground text-base md:text-lg max-w-lg leading-relaxed [text-wrap:pretty]"
              >
                {t('landing.hero.subtitle')}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                variants={fadeUp}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-1"
              >
                <Button size="xl" onClick={() => navigate('/login')}>
                  {t('common.buttons.startWithContract')} <ArrowRight />
                </Button>
                <Button variant="outline" size="xl" onClick={() => {
                  document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }}>
                  {t('common.buttons.seeHowItWorks')}
                </Button>
              </motion.div>

              {/* Trust Badges */}
              <motion.div
                variants={fadeUp}
                className="flex flex-wrap gap-x-5 gap-y-2.5 mt-1"
              >
                {trustBadges.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <span className="text-foreground">{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: brand illustration */}
            <HeroIllustration />
          </div>
        </motion.div>
      </section>

      {/* ── SOCIAL PROOF STATS ──────────────────────────────── */}
      <section>
        <div className="max-w-6xl mx-auto px-6 pt-14">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border border-y border-border">
            {stats.map((stat) => (
              <div key={stat.label} className="py-10 text-center">
                <p className="text-2xl md:text-3xl font-mono font-medium text-foreground tracking-tight tabular-nums">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE MINI DEMO ───────────────────────────── */}
      <div className="bg-card transition-colors duration-500">
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
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <span className="font-mono text-xs tracking-widest">{item.step}</span>
                <span className="w-8 h-px bg-border" aria-hidden="true" />
                {item.icon}
              </div>
              <h3 className="font-display font-semibold text-foreground text-xl tracking-[-0.02em]">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[42ch]">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────── */}
      <section id="benefits" className="bg-card transition-colors duration-500">
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
              className="md:col-span-2 lg:col-span-2"
            >
              <Card className="h-full p-8 hover:shadow-xs hover:-translate-y-0.5 transition-[box-shadow,transform] duration-200 group overflow-hidden relative flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 z-10 flex flex-col">
                  <div className="flex items-center gap-2.5 mb-5">
                    <AlertTriangle className="text-destructive w-5 h-5" />
                    <h3 className="text-xl font-display font-semibold text-foreground tracking-[-0.02em]">{t('landing.features.redFlagDetection.title')}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t('landing.features.redFlagDetection.desc')}</p>
                </div>
                {/* Mini UI Illustration */}
                <div className="flex-1 w-full bg-secondary rounded-lg border border-border p-5 transform group-hover:-translate-y-1.5 group-hover:-translate-x-1.5 transition-transform duration-500 relative hidden sm:block">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-destructive" />
                    <div className="h-2 w-24 bg-border rounded-full" />
                  </div>
                  <div className="p-3 bg-destructive/8 border border-destructive/16 rounded-lg">
                    <p className="text-[10px] text-destructive font-bold mb-2">High Risk: IP Ownership</p>
                    <div className="h-1.5 w-full bg-destructive/16 rounded-full mb-1.5" />
                    <div className="h-1.5 w-4/5 bg-destructive/16 rounded-full mb-1.5" />
                    <div className="h-1.5 w-2/3 bg-destructive/16 rounded-full" />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Card 2: Smart Summarization (Small) */}
            <motion.div variants={fadeUp}>
              <Card className="h-full p-8 hover:shadow-xs hover:-translate-y-0.5 transition-[box-shadow,transform] duration-200 flex flex-col group">
                <Brain className="text-muted-foreground w-5 h-5 mb-auto" />
                <h3 className="text-lg font-display font-semibold text-foreground mb-2 mt-8 tracking-[-0.02em]">{t('landing.features.smartSummarization.title')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('landing.features.smartSummarization.desc')}</p>
              </Card>
            </motion.div>

            {/* Card 3: Negotiation Tips (Small) */}
            <motion.div variants={fadeUp}>
              <Card className="h-full p-8 hover:shadow-xs hover:-translate-y-0.5 transition-[box-shadow,transform] duration-200 flex flex-col group">
                <TrendingUp className="text-success w-5 h-5 mb-auto" />
                <h3 className="text-lg font-display font-semibold text-foreground mb-2 mt-8 tracking-[-0.02em]">{t('landing.features.negotiationTips.title')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('landing.features.negotiationTips.desc')}</p>
              </Card>
            </motion.div>

            {/* Card 4: Secure & Private (Small) */}
            <motion.div variants={fadeUp}>
              <Card className="h-full p-8 hover:shadow-xs hover:-translate-y-0.5 transition-[box-shadow,transform] duration-200 flex flex-col group">
                <Lock className="text-muted-foreground w-5 h-5 mb-auto" />
                <h3 className="text-lg font-display font-semibold text-foreground mb-2 mt-8 tracking-[-0.02em]">{t('landing.features.securePrivate.title')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('landing.features.securePrivate.desc')}</p>
              </Card>
            </motion.div>

            {/* Card 5: PDF Viewer (Large) */}
            <motion.div
              variants={fadeUp}
              className="md:col-span-2 lg:col-span-2"
            >
              <Card className="h-full p-8 hover:shadow-xs hover:-translate-y-0.5 transition-[box-shadow,transform] duration-200 group overflow-hidden relative flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 z-10 flex flex-col">
                  <div className="flex items-center gap-2.5 mb-5">
                    <FileText className="text-foreground w-5 h-5" />
                    <h3 className="text-xl font-display font-semibold text-foreground tracking-[-0.02em]">{t('landing.features.sideBySideAnalysis.title')}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t('landing.features.sideBySideAnalysis.desc')}</p>
                </div>
                {/* Mini UI Illustration */}
                <div className="flex-1 w-full bg-secondary rounded-lg border border-border flex overflow-hidden transform group-hover:scale-[1.03] transition-transform duration-500 h-36 hidden sm:flex">
                  <div className="flex-1 p-4 border-r border-border flex flex-col gap-2.5 bg-card/60">
                    <div className="h-2 w-1/2 bg-border rounded-full mb-1" />
                    <div className="h-1.5 w-full bg-border/60 rounded-full" />
                    <div className="h-1.5 w-full bg-border/60 rounded-full" />
                    <div className="h-1.5 w-3/4 bg-border/60 rounded-full" />
                    <div className="h-1.5 w-full bg-border/60 rounded-full mt-2" />
                    <div className="h-1.5 w-5/6 bg-border/60 rounded-full" />
                  </div>
                  <div className="flex-1 p-4 flex flex-col gap-3">
                    <div className="h-2 w-1/3 bg-foreground/24 rounded-full" />
                    <div className="p-2.5 bg-card rounded-lg border border-border shadow-xs">
                      <div className="h-1.5 w-full bg-foreground/16 rounded-full mb-2" />
                      <div className="h-1.5 w-2/3 bg-foreground/16 rounded-full" />
                    </div>
                    <div className="h-1.5 w-1/2 bg-success/24 rounded-full mt-1" />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Card 6: Analysis History (Small) */}
            <motion.div variants={fadeUp}>
              <Card className="h-full p-8 hover:shadow-xs hover:-translate-y-0.5 transition-[box-shadow,transform] duration-200 flex flex-col group">
                <Clock className="text-warning w-5 h-5 mb-auto" />
                <h3 className="text-lg font-display font-semibold text-foreground mb-2 mt-8 tracking-[-0.02em]">{t('landing.features.analysisHistory.title')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('landing.features.analysisHistory.desc')}</p>
              </Card>
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
              className="relative"
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
                className="absolute -top-14 left-0 right-0 bg-popover border border-border shadow-md rounded-xl p-3 z-20 pointer-events-none"
              >
                <p className="text-[11px] font-medium text-foreground italic h-8 leading-relaxed">
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
                <div className="absolute -bottom-1.5 left-8 w-3 h-3 bg-popover border-b border-r border-border transform rotate-45" />
              </motion.div>

              <Card className="h-full p-6 flex flex-col gap-3 hover:shadow-xs hover:-translate-y-0.5 transition-[box-shadow,transform] duration-200 cursor-default">
                <p.Icon className="w-5 h-5 text-muted-foreground" />
                <div>
                  <h3 className="font-display font-semibold text-foreground text-base tracking-[-0.02em]">{p.name}</h3>
                  <Badge variant={p.badgeVariant} className="mt-1.5">{p.tone}</Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────── */}
      <section className="bg-card transition-colors duration-500">
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
              <blockquote className="font-display font-semibold text-2xl md:text-[2rem] md:leading-[1.3] text-foreground tracking-[-0.02em] [text-wrap:balance]">
                “{featuredTestimonial.quote}”
              </blockquote>
              <figcaption className="mt-5 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{featuredTestimonial.name}</span>
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
              >
                <Card className="h-full p-6 flex flex-col gap-4">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 text-warning fill-warning" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">"{item.quote}"</p>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.role}</p>
                  </div>
                </Card>
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

          <Accordion multiple={false} defaultValue={['0']}>
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={String(i)}>
                <AccordionTrigger className="text-[15px] py-5">{faq.q}</AccordionTrigger>
                <AccordionPanel className="pb-6">{faq.a}</AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ── FINAL CTA — rounded frame bookend ───────────────── */}
      <section className="px-3 sm:px-5 pt-6 pb-16 sm:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-[1216px] mx-auto bg-card border border-border rounded-3xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_64px_-32px_rgba(0,0,0,0.16)] px-6 py-20 md:py-28 text-center"
        >
          {/* Soft light pooling behind the content */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-0 -translate-x-1/2 w-[640px] h-[320px] rounded-full bg-secondary blur-[100px] opacity-80 pointer-events-none"
          />

          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="relative flex flex-col items-center gap-6 max-w-2xl mx-auto"
          >
            <motion.div variants={fadeUp}>
              <img src="/logo/brandLogo_black.png" alt="ContractChill Logo" className="w-14 h-14 rounded-xl shadow-xs" />
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-display font-bold tracking-[-0.03em] text-foreground leading-[1.08] [text-wrap:balance]">
              {t('landing.finalCta.title')}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-lg max-w-xl [text-wrap:pretty]">
              {t('landing.finalCta.subtitle')}
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
              <Button size="xl" className="group" onClick={() => navigate('/login')}>
                {t('landing.finalCta.button')}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </motion.div>
            <motion.p variants={fadeUp} className="text-xs text-muted-foreground">
              {t('landing.finalCta.disclaimer')}
            </motion.p>
          </motion.div>
        </motion.div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="bg-card border-t border-border transition-colors duration-500">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="flex flex-col md:flex-row justify-between gap-10 mb-12">
            {/* Brand */}
            <div className="flex flex-col gap-4 max-w-xs">
              <div className="flex items-center gap-2">
                <img src="/logo/brandLogo_black.png" alt="ContractChill Logo" className="w-7 h-7 rounded-md" />
                <span className="font-display font-semibold text-foreground text-lg tracking-[-0.02em]">{t('common.appName')}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('landing.footer.description')}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="w-3 h-3" />
                <span>{t('landing.footer.privacyNote')}</span>
              </div>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
              <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold text-foreground">{t('landing.footer.product')}</p>
                <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">{t('common.nav.howItWorks')}</a>
               <a href="#benefits" className="text-muted-foreground hover:text-foreground transition-colors">{t('common.nav.benefits')}</a>
                <a href="#personas" className="text-muted-foreground hover:text-foreground transition-colors">{t('common.nav.personas')}</a>
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold text-foreground">{t('landing.footer.useCases')}</p>
                <span className="text-muted-foreground">{t('landing.footer.freelancers')}</span>
                <span className="text-muted-foreground">{t('landing.footer.founders')}</span>
                <span className="text-muted-foreground">{t('landing.footer.creators')}</span>
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold text-foreground">{t('landing.footer.legal')}</p>
                <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">{t('landing.footer.privacyPolicy')}</Link>
                <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">{t('landing.footer.termsOfService')}</Link>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              {t('landing.footer.copyright', { year: new Date().getFullYear() })}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{t('landing.footer.poweredBy')}</span>
              <Badge variant="secondary">
                <Sparkles className="w-3 h-3" />
                {t('landing.footer.googleGemini')}
              </Badge>
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
             className="fixed bottom-8 right-8 z-50 size-11 flex items-center justify-center rounded-full bg-popover border border-border text-foreground hover:bg-accent shadow-xs transition-[background-color,transform] active:scale-[0.96]"
            title={t('landing.footer.backToTop')}
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
