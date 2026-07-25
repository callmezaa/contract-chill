import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, ArrowRight, CheckCircle,
  FileText, Brain, Clock, Star, ChevronRight,
  AlertTriangle, MessageSquare, TrendingUp, Lock, Menu, X, ArrowUp,
  Coffee, Scale, Briefcase, Palette, type LucideIcon
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MiniDemo } from '../components/MiniDemo';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Button } from '@/components/motion/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
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
  const [docTypeIndex, setDocTypeIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const docTypes = t('landing.hero.docTypes', { returnObjects: true }) as string[];
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

  useEffect(() => {
    const interval = setInterval(() => {
      setDocTypeIndex((prev) => (prev + 1) % docTypes.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [docTypes.length]);

  const navLinks = [
    { label: t('common.nav.howItWorks'), href: '#how-it-works' },
    { label: t('common.nav.benefits'), href: '#benefits' },
    { label: t('common.nav.personas'), href: '#personas' },
    { label: t('common.nav.faq'), href: '#faq' },
  ];

  const trustBadges = [
    { icon: <CheckCircle className="w-4 h-4" />, text: t('landing.hero.trustBadges.noCreditCard') },
    { icon: <FileText className="w-4 h-4" />, text: t('landing.hero.trustBadges.pdfDocxSupport') },
    { icon: <Clock className="w-4 h-4" />, text: t('landing.hero.trustBadges.resultsInSeconds') },
  ];

  const stats = [
    { value: '10,000+', label: t('landing.stats.contractsAnalyzed') },
    { value: '4', label: t('landing.stats.aiPersonas') },
    { value: '< 15s', label: t('landing.stats.averageAnalysisTime') },
    { value: '98%', label: t('landing.stats.userSatisfaction') },
  ];

  const howItWorksSteps = [
    {
      step: '01',
      icon: <FileText className="w-6 h-6 text-primary" />,
      title: t('landing.howItWorks.steps.0.title'),
      desc: t('landing.howItWorks.steps.0.desc')
    },
    {
      step: '02',
      icon: <Brain className="w-6 h-6 text-primary" />,
      title: t('landing.howItWorks.steps.1.title'),
      desc: t('landing.howItWorks.steps.1.desc')
    },
    {
      step: '03',
      icon: <CheckCircle className="w-6 h-6 text-primary" />,
      title: t('landing.howItWorks.steps.2.title'),
      desc: t('landing.howItWorks.steps.2.desc')
    }
  ];

  const personas = [
    {
      Icon: Scale,
      name: t('landing.personas.angryLawyer.name'),
      tone: t('landing.personas.angryLawyer.tone'),
      color: 'border-red-500/20 bg-red-500/5',
      badge: 'bg-red-500/10 text-red-500',
      desc: t('landing.personas.angryLawyer.desc'),
      preview: t('landing.personas.angryLawyer.preview')
    },
    {
      Icon: Coffee,
      name: t('landing.personas.chillFriend.name'),
      tone: t('landing.personas.chillFriend.tone'),
      color: 'border-primary/20 bg-primary/5',
      badge: 'bg-primary/10 text-primary',
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
      color: 'border-violet-500/20 bg-violet-500/5',
      badge: 'bg-violet-500/10 text-violet-500',
      desc: t('landing.personas.freelancerSenior.desc'),
      preview: t('landing.personas.freelancerSenior.preview')
    },
  ];

  const testimonials = t('landing.testimonials.items', { returnObjects: true }) as Array<{ quote: string; name: string; role: string }>;

  const faqs = t('landing.faq.items', { returnObjects: true }) as Array<{ q: string; a: string }>;


  return (
    <div className="min-h-screen bg-background flex flex-col font-sans overflow-hidden text-text">

      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-[68px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo/brandLogo_black.png" alt="ContractChill Logo" className="w-8 h-8 rounded-lg shadow-sm" />
            <span className="font-display text-lg font-semibold tracking-[-0.04em]">{t('common.appName')}</span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {navLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
              className="relative px-4 py-2 text-sm font-medium text-text-muted transition-colors group hover:text-text"
              >
                {link.label}
                <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-text-muted hover:text-text hover:bg-surface rounded-lg transition-all"
            >
              {t('common.buttons.login')}
            </Link>
            <div className="hidden sm:block w-[1px] h-5 bg-border" />
            <div className="hidden md:block">
              <Button variant="primary" size="sm" onClick={() => navigate('/login')}>
                {t('common.buttons.getStarted')} <ArrowRight />
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 -mr-2 text-text-muted hover:text-text hover:bg-surface rounded-lg transition-all"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border overflow-hidden bg-background"
            >
              <div className="px-6 py-5 flex flex-col gap-4">
                {navLinks.map(link => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      setIsMobileMenuOpen(false);
                      setTimeout(() => {
                        const element = document.querySelector(link.href);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        }
                      }, 100);
                    }}
                    className="text-[15px] font-semibold text-text hover:text-text transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
                
                <div className="h-[1px] bg-border my-2" />
                
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-[15px] font-semibold text-text hover:text-text transition-colors"
                >
                  {t('common.buttons.loginToAccount')}
                </Link>
                
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-text text-surface text-[15px] flex items-center justify-center gap-2 w-full py-3 mt-2 rounded-xl font-semibold"
                >
                  {t('common.buttons.getStartedFree')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-28 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial="hidden" animate="show" variants={stagger}
            className="flex flex-col items-center gap-7"
          >
            {/* Badge */}
            <motion.div 
              variants={fadeUp}
              className="px-3.5 py-1.5 rounded-full bg-surface border border-border flex items-center gap-2 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-[11px] font-medium text-text-muted tracking-wide">{t('landing.hero.badge')}</span>
            </motion.div>

            {/* Title */}
            <motion.h1 
              variants={fadeUp}
              className="text-4xl sm:text-5xl md:text-7xl font-display font-semibold text-text leading-[1.04] tracking-[-0.065em] max-w-4xl [text-wrap:balance]"
            >
              {t('landing.hero.titlePrefix')} <br className="sm:hidden" />
              <span className="relative inline-flex overflow-hidden align-bottom pb-1 text-text">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={docTypeIndex}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="whitespace-normal sm:whitespace-nowrap"
                  >
                    {docTypes[docTypeIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>, <br className="hidden md:block" />
              <span className="relative inline-block px-1 mt-2 md:mt-0">
                <span className="relative z-10 text-primary">{t('landing.hero.titleSuffix').split(' ')[0]}</span>
                <svg className="absolute w-full h-3 -bottom-0.5 left-0 z-0" viewBox="0 0 100 15" preserveAspectRatio="none">
                  <motion.path
                    d="M5 10 Q 50 2 95 10"
                    fill="transparent"
                    stroke="currentColor"
                    className="text-primary/40"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 1, ease: "easeInOut" }}
                  />
                </svg>
              </span> {t('landing.hero.titleSuffix').split(' ').slice(1).join(' ')}
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
              <Button variant="primary" size="lg" onClick={() => navigate('/login')}>
                {t('common.buttons.startWithContract')} <ArrowRight />
              </Button>
              <Button variant="outline" size="lg" onClick={() => {
                document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                {t('common.buttons.seeHowItWorks')}
              </Button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div 
              variants={fadeUp}
              className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-7"
            >
              {trustBadges.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-medium text-text">
                  <span className="text-primary">{item.icon}</span>
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
            {/* Background Soft Glow */}
            <div className="absolute inset-x-10 -bottom-8 h-24 bg-primary/15 blur-3xl rounded-full -z-10 opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
            
            {/* Main Preview Container */}
            <div className="relative bg-surface rounded-2xl shadow-[0_24px_80px_-32px_rgba(0,0,0,0.28)] border border-border overflow-hidden transform group-hover:-translate-y-2 transition-transform duration-500 ease-out">
              {/* Fake browser bar */}
              <div className="bg-surface-2/60 border-b border-border px-4 py-3 flex items-center gap-3">
                <div className="flex gap-1.5 opacity-50">
                  <div className="size-2.5 rounded-full bg-text-subtle" />
                  <div className="size-2.5 rounded-full bg-text-subtle" />
                  <div className="size-2.5 rounded-full bg-text-subtle" />
                </div>
                <div className="flex-1 bg-surface-2 rounded-md h-6 mx-4 flex items-center px-3">
                  <span className="text-xs text-text-subtle">contractchill.app/analyze</span>
                </div>
              </div>
              {/* Dashboard Preview */}
              <div className="p-4 sm:p-6 flex flex-col md:flex-row gap-4 min-h-[300px] bg-background/50">
                {/* Left: Fake PDF */}
                <div className="w-full md:flex-1 bg-surface rounded-xl border border-border p-4 flex flex-col gap-3 text-left relative group-pdf shadow-sm">
                  {/* Hotspot 1 */}
                  <div className="absolute top-[40%] left-[60%] z-10 cursor-pointer">
                    <div className="relative flex items-center justify-center">
                      <div className="absolute w-5 h-5 bg-primary/40 rounded-full animate-ping" />
                      <div className="relative w-2.5 h-2.5 bg-primary rounded-full" />
                      {/* Tooltip */}
                      <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-surface text-text text-[10px] py-1.5 px-3 rounded-lg opacity-0 group-hover/pdf:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm border border-border z-20">
                        {t('landing.preview.uploadTooltip')}
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-surface rotate-45 border-l border-t border-border" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <FileText className="w-4 h-4 text-text-muted" />
                    <span className="text-xs font-medium text-text-muted font-sans">freelance_contract.pdf</span>
                  </div>
                  {['w-full', 'w-[85%]', 'w-[95%]', 'w-[70%]', 'w-[90%]', 'w-[60%]', 'w-[80%]'].map((w, i) => (
                    <div key={i} className={`h-2 bg-surface-2 rounded-full ${w}`} />
                  ))}
                </div>
                {/* Right: Fake Analysis */}
                <div className="w-full md:w-64 flex flex-col gap-3">
                  <button onClick={() => setActivePreview('risk')} className={`p-3 rounded-xl border text-left relative group/alert transition-[transform,box-shadow,background-color] duration-200 ${activePreview === 'risk' ? 'bg-red-500/10 border-red-500/20 shadow-sm -translate-y-0.5' : 'bg-surface border-border hover:bg-surface-2'}`}>
                    {/* Hotspot 2 */}
                    <div className="absolute -top-1.5 -left-1.5 z-10 cursor-pointer">
                      <div className="relative flex items-center justify-center">
                        <div className="absolute w-4 h-4 bg-primary/40 rounded-full animate-ping" />
                        <div className="relative w-2 h-2 bg-primary rounded-full" />
                        {/* Tooltip */}
                        <div className="absolute top-5 -left-2 bg-surface text-text text-[10px] py-1.5 px-3 rounded-lg opacity-0 group-hover/alert:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm border border-border z-20">
                          {t('landing.preview.riskTooltip')}
                          <div className="absolute -top-1 left-3 w-2 h-2 bg-surface rotate-45 border-l border-t border-border" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                      <span className="text-[11px] font-bold text-red-700 font-sans">{t('landing.preview.highRiskClause')}</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-1.5 bg-red-200 rounded-full w-full" />
                      <div className="h-1.5 bg-red-200 rounded-full w-4/5" />
                    </div>
                  </button>
                  <button onClick={() => setActivePreview('summary')} className={`p-3 rounded-xl border text-left transition-[transform,box-shadow,background-color] duration-200 ${activePreview === 'summary' ? 'bg-green-500/10 border-green-500/20 shadow-sm -translate-y-0.5' : 'bg-surface border-border hover:bg-surface-2'}`}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-[11px] font-bold text-green-700 font-sans">{t('landing.preview.aiSummary')}</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-1.5 bg-green-200 rounded-full w-full" />
                      <div className="h-1.5 bg-green-200 rounded-full w-3/4" />
                      <div className="h-1.5 bg-green-200 rounded-full w-5/6" />
                    </div>
                  </button>
                  <button onClick={() => setActivePreview('tips')} className={`p-3 rounded-xl border text-left relative group/tips transition-[transform,box-shadow,background-color] duration-200 ${activePreview === 'tips' ? 'bg-primary/10 border-primary/20 shadow-sm -translate-y-0.5' : 'bg-surface border-border hover:bg-surface-2'}`}>
                    {/* Hotspot 3 */}
                    <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 z-10 cursor-pointer">
                      <div className="relative flex items-center justify-center">
                        <div className="absolute w-4 h-4 bg-primary/40 rounded-full animate-ping" />
                        <div className="relative w-2 h-2 bg-primary rounded-full" />
                        {/* Tooltip */}
                        <div className="absolute top-1/2 right-6 -translate-y-1/2 bg-surface text-text text-[10px] py-1.5 px-3 rounded-lg opacity-0 group-hover/tips:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm border border-border z-20">
                          {t('landing.preview.tipsTooltip')}
                          <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-surface rotate-45 border-l border-t border-border" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <MessageSquare className="w-3.5 h-3.5 text-text" />
                      <span className="text-[11px] font-bold text-text font-sans">{t('landing.preview.negotiationTips')}</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-1.5 bg-primary/20 rounded-full w-full" />
                      <div className="h-1.5 bg-primary/20 rounded-full w-2/3" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Floating badges */}
            <div className="absolute -left-8 top-1/3 hidden lg:flex items-center gap-2 bg-surface border border-border rounded-xl px-4 py-3 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-text">{t('landing.preview.redFlagsFound')}</p>
                <p className="text-[10px] text-text-subtle font-sans">{t('landing.preview.reviewBeforeSigning')}</p>
              </div>
            </div>
            <div className="absolute -right-8 top-1/2 hidden lg:flex items-center gap-2 bg-surface border border-border rounded-xl px-4 py-3 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-text">{t('landing.preview.analysisReady')}</p>
                <p className="text-[10px] text-text-subtle font-sans">{t('landing.preview.completedInSeconds')}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SOCIAL PROOF STATS ──────────────────────────────── */}
      <section className="bg-surface transition-colors duration-500">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-display font-bold text-text">{stat.value}</p>
                <p className="text-sm text-text-muted mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE MINI DEMO ───────────────────────────── */}
      <div className="bg-surface transition-colors duration-500">
        <div className="max-w-6xl mx-auto border-t border-border" />
        <MiniDemo />
      </div>

      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-24">
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
          className="flex flex-col items-center gap-4 text-center mb-16"
        >
          <motion.p variants={fadeUp} className="text-xs font-bold tracking-widest text-primary">{t('landing.howItWorks.sectionLabel')}</motion.p>
          <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-display font-semibold tracking-[-0.05em] text-text [text-wrap:balance]">{t('landing.howItWorks.title')}</motion.h2>
          <motion.p variants={fadeUp} className="text-text-muted max-w-xl">{t('landing.howItWorks.subtitle')}</motion.p>
        </motion.div>

        <motion.div 
          initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
        >
          {/* Connector lines */}
          <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-[1px] bg-gradient-to-r from-border via-primary/30 to-border z-0" />

          {howItWorksSteps.map((item, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="flex flex-col items-center text-center gap-4 z-10"
            >
              <div className="relative">
                <div className="size-20 rounded-2xl bg-surface border border-border flex items-center justify-center shadow-sm">
                  {item.icon}
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-[9px] font-bold text-white">{item.step}</span>
                </div>
              </div>
              <h3 className="font-display font-semibold text-text text-lg">{item.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed max-xs">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────── */}
       <section id="benefits" className="bg-surface transition-colors duration-500">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="flex flex-col items-center gap-4 text-center mb-16"
          >
            <motion.p variants={fadeUp} className="text-xs font-bold tracking-widest text-primary">{t('landing.features.sectionLabel')}</motion.p>
          <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-display font-semibold tracking-[-0.05em] text-text [text-wrap:balance]">{t('landing.features.title')}</motion.h2>
            <motion.p variants={fadeUp} className="text-text-muted max-w-xl">{t('landing.features.subtitle')}</motion.p>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:auto-rows-[280px]"
          >
            {/* Card 1: Red Flag (Large) */}
            <motion.div
              variants={fadeUp}
              className="md:col-span-2 lg:col-span-2 bg-surface rounded-2xl border border-border p-8 hover:shadow-sm hover:-translate-y-0.5 transition-[box-shadow,transform] duration-200 group overflow-hidden relative flex flex-col md:flex-row gap-8 items-center"
            >
              <div className="flex-1 z-10 flex flex-col">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-6">
                  <AlertTriangle className="text-amber-500 w-6 h-6" />
                </div>
              <h3 className="text-xl font-display font-semibold text-text mb-3">{t('landing.features.redFlagDetection.title')}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{t('landing.features.redFlagDetection.desc')}</p>
              </div>
              {/* Mini UI Illustration */}
              <div className="flex-1 w-full bg-surface rounded-xl border border-border p-5 transform group-hover:-translate-y-2 group-hover:-translate-x-2 transition-transform duration-500 relative hidden sm:block">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <div className="h-2 w-24 bg-surface-2 rounded-full" />
                </div>
                <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                  <p className="text-[10px] text-red-500 font-bold mb-2">High Risk: IP Ownership</p>
                  <div className="h-1.5 w-full bg-red-200/60 rounded-full mb-1.5" />
                  <div className="h-1.5 w-4/5 bg-red-200/60 rounded-full mb-1.5" />
                  <div className="h-1.5 w-2/3 bg-red-200/60 rounded-full" />
                </div>
              </div>
            </motion.div>

            {/* Card 2: Smart Summarization (Small) */}
            <motion.div variants={fadeUp} className="bg-surface rounded-2xl border border-border p-8 hover:shadow-sm hover:-translate-y-0.5 transition-[box-shadow,transform] duration-200 flex flex-col group">
              <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center mb-auto">
                <Brain className="text-violet-500 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-lg font-display font-bold text-text mb-2 mt-8">{t('landing.features.smartSummarization.title')}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{t('landing.features.smartSummarization.desc')}</p>
            </motion.div>

            {/* Card 3: Negotiation Tips (Small) */}
            <motion.div variants={fadeUp} className="bg-surface rounded-2xl border border-border p-8 hover:shadow-sm hover:-translate-y-0.5 transition-[box-shadow,transform] duration-200 flex flex-col group">
              <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center mb-auto">
                <TrendingUp className="text-green-500 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-lg font-display font-bold text-text mb-2 mt-8">{t('landing.features.negotiationTips.title')}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{t('landing.features.negotiationTips.desc')}</p>
            </motion.div>

            {/* Card 4: Secure & Private (Small) */}
            <motion.div variants={fadeUp} className="bg-surface rounded-2xl border border-border p-8 hover:shadow-sm hover:-translate-y-0.5 transition-[box-shadow,transform] duration-200 flex flex-col group">
              <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center mb-auto">
                <Lock className="text-text-muted w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-lg font-display font-bold text-text mb-2 mt-8">{t('landing.features.securePrivate.title')}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{t('landing.features.securePrivate.desc')}</p>
            </motion.div>

            {/* Card 5: PDF Viewer (Large) */}
            <motion.div
              variants={fadeUp}
              className="md:col-span-2 lg:col-span-2 bg-surface rounded-2xl border border-border p-8 hover:shadow-sm hover:-translate-y-0.5 transition-[box-shadow,transform] duration-200 group overflow-hidden relative flex flex-col md:flex-row gap-8 items-center"
            >
              <div className="flex-1 z-10 flex flex-col">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <FileText className="text-primary w-6 h-6" />
                </div>
                <h3 className="text-xl font-display font-bold text-text mb-3">{t('landing.features.sideBySideAnalysis.title')}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{t('landing.features.sideBySideAnalysis.desc')}</p>
              </div>
              {/* Mini UI Illustration */}
              <div className="flex-1 w-full bg-surface rounded-xl border border-border flex overflow-hidden transform group-hover:scale-105 transition-transform duration-500 h-36 hidden sm:flex">
                <div className="flex-1 p-4 border-r border-border flex flex-col gap-2.5 bg-surface/50">
                  <div className="h-2 w-1/2 bg-border rounded-full mb-1" />
                  <div className="h-1.5 w-full bg-border/60 rounded-full" />
                  <div className="h-1.5 w-full bg-border/60 rounded-full" />
                  <div className="h-1.5 w-3/4 bg-border/60 rounded-full" />
                  <div className="h-1.5 w-full bg-border/60 rounded-full mt-2" />
                  <div className="h-1.5 w-5/6 bg-border/60 rounded-full" />
                </div>
                <div className="flex-1 p-4 flex flex-col gap-3">
                  <div className="h-2 w-1/3 bg-primary/30 rounded-full" />
                  <div className="p-2.5 bg-primary/5 rounded-lg border border-primary/10">
                    <div className="h-1.5 w-full bg-primary/20 rounded-full mb-2" />
                    <div className="h-1.5 w-2/3 bg-primary/20 rounded-full" />
                  </div>
                  <div className="h-1.5 w-1/2 bg-green-500/20 rounded-full mt-1" />
                </div>
              </div>
            </motion.div>

            {/* Card 6: Analysis History (Small) */}
            <motion.div variants={fadeUp} className="bg-surface rounded-2xl border border-border p-8 hover:shadow-sm hover:-translate-y-0.5 transition-[box-shadow,transform] duration-200 flex flex-col group">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center mb-auto">
                <Clock className="text-orange-500 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-lg font-display font-bold text-text mb-2 mt-8">{t('landing.features.analysisHistory.title')}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{t('landing.features.analysisHistory.desc')}</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── AI PERSONAS ─────────────────────────────────────── */}
      <section id="personas" className="max-w-6xl mx-auto px-6 py-24">
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
          className="flex flex-col items-center gap-4 text-center mb-16"
        >
          <motion.p variants={fadeUp} className="text-xs font-bold tracking-widest text-primary">{t('landing.personas.sectionLabel')}</motion.p>
          <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-display font-semibold tracking-[-0.05em] text-text [text-wrap:balance]">{t('landing.personas.title')}</motion.h2>
          <motion.p variants={fadeUp} className="text-text-muted max-w-xl">{t('landing.personas.subtitle')}</motion.p>
        </motion.div>

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
              className={`relative rounded-2xl border ${p.color} p-5 flex flex-col gap-3 hover:shadow-sm hover:-translate-y-0.5 transition-[box-shadow,transform] duration-200 cursor-default`}
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
                <p className="text-[11px] font-medium text-text italic h-8 leading-relaxed">
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

              <div className="text-3xl"><p.Icon className="w-8 h-8" /></div>
              <div>
                <h3 className="font-display font-bold text-text text-base">{p.name}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.badge} tracking-wide`}>
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
        <div className="max-w-6xl mx-auto px-6 py-24">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="flex flex-col items-center gap-4 text-center mb-16"
          >
            <motion.p variants={fadeUp} className="text-xs font-bold tracking-widest text-primary">{t('landing.testimonials.sectionLabel')}</motion.p>
          <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-display font-semibold tracking-[-0.05em] text-text [text-wrap:balance]">{t('landing.testimonials.title')}</motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((item, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="show" viewport={{ once: true }}
                variants={fadeUp}
                transition={{ delay: i * 0.1 }}
                className="bg-surface rounded-2xl border border-border p-6 flex flex-col gap-4 shadow-sm"
              >
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
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
      <section id="faq" className="bg-surface transition-colors duration-500">
        <div className="max-w-3xl mx-auto px-6 py-24">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="flex flex-col items-center gap-4 text-center mb-12"
          >
            <motion.p variants={fadeUp} className="text-xs font-bold tracking-widest text-primary">{t('landing.faq.sectionLabel')}</motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-display font-semibold tracking-[-0.05em] text-text [text-wrap:balance]">{t('landing.faq.title')}</motion.h2>
          </motion.div>

          <Accordion items={faqs.map((faq, i) => ({ value: String(i), title: faq.q, content: faq.a }))} />
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
          className="flex flex-col items-center gap-6 max-w-2xl mx-auto"
        >
          <motion.div variants={fadeUp}>
            <img src="/logo/brandLogo_black.png" alt="ContractChill Logo" className="w-16 h-16 rounded-2xl shadow-sm" />
          </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-display font-semibold tracking-[-0.06em] text-text leading-tight [text-wrap:balance]">
            {t('landing.finalCta.title')}
          </motion.h2>
          <motion.p variants={fadeUp} className="text-text-muted text-lg">
            {t('landing.finalCta.subtitle')}
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
            <Link to="/login" className="bg-text text-surface flex items-center gap-2 group px-8 py-3 rounded-xl font-semibold">
              {t('landing.finalCta.button')}
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
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
                <span className="font-display font-bold text-text">{t('common.appName')}</span>
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
                <p className="text-xs font-bold tracking-widest text-text-subtle">{t('landing.footer.product')}</p>
                <a href="#how-it-works" className="text-text-muted hover:text-text transition-colors">{t('common.nav.howItWorks')}</a>
               <a href="#benefits" className="text-text-muted hover:text-text transition-colors">{t('common.nav.benefits')}</a>
                <a href="#personas" className="text-text-muted hover:text-text transition-colors">{t('common.nav.personas')}</a>
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-xs font-bold tracking-widest text-text-subtle">{t('landing.footer.useCases')}</p>
                <span className="text-text-muted">{t('landing.footer.freelancers')}</span>
                <span className="text-text-muted">{t('landing.footer.founders')}</span>
                <span className="text-text-muted">{t('landing.footer.creators')}</span>
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-xs font-bold tracking-widest text-text-subtle">{t('landing.footer.legal')}</p>
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
                <Sparkles className="w-3 h-3 text-primary" />
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
