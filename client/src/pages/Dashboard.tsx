import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Clock, AlertTriangle, CheckCircle2, Loader2, FileText, ShieldCheck, ChevronRight,
  Coffee, Scale, Briefcase, Shield, Zap, MessageCircle,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { analyzeContract } from '../services/api';
import type { Persona } from '../types/analysis';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Button } from '@/components/motion/button';
import { NumberTicker } from '@/components/motion/number-ticker';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader } from '@/components/motion/loader';

const personas = [
  { id: 'Chill Friend',      desc: 'Casual & direct',    icon: Coffee,    preview: '"Hey, clause 4 is a red flag. I\'d push back on this before signing."'       },
  { id: 'Angry Lawyer',      desc: 'Strict & protective', icon: Scale,     preview: '"DO NOT SIGN THIS. They are trying to strip your IP rights completely!"'        },
  { id: 'Corporate Mentor',  desc: 'Strategic & formal',  icon: Briefcase, preview: '"From a strategic standpoint, clause 7 presents unacceptable liability exposure."' },
  { id: 'Freelancer Senior', desc: 'Payment focused',    icon: Shield,    preview: '"Watch out — no late payment penalty clause. That\'s how clients ghost you."'    },
];

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPersona, setSelectedPersona] = useState<Persona>('Chill Friend');
  const [hoveredPersona, setHoveredPersona] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  useDocumentTitle('Dashboard - ContractChill');

  const { data: history } = useQuery({
    queryKey: ['history-stats', user?.uid],
    queryFn: async () => {
      if (!user) return [];
      const q = query(
        collection(db, 'analyses'),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    enabled: !!user,
  });

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const response = await analyzeContract(file, selectedPersona);
      const { fileUrl, ...result } = response;
      const docRef = await addDoc(collection(db, 'analyses'), {
        userId: user?.uid,
        userName: user?.displayName,
        fileName: file.name,
        fileUrl,
        persona: selectedPersona,
        result,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, result, fileUrl };
    },
    onSuccess: async (data) => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        const prefs = docSnap.exists() ? docSnap.data().notifications : { analysis: true };
        if (prefs?.analysis) {
          toast.success('Analysis complete!', { description: 'Your contract has been scanned for risks.', duration: 5000 });
        }
      }
      navigate(`/analyze/${data.id}`, { state: { result: data.result, persona: selectedPersona, fileUrl: data.fileUrl } });
    },
  });

  const totalAnalyses = history?.length || 0;
  const redFlagsCount = history?.reduce((acc, curr: any) =>
    acc + (curr.result?.redFlags?.filter((rf: any) => rf.risk === 'High').length || 0), 0) || 0;
  const safeCount = history?.filter((item: any) =>
    !item.result?.redFlags?.some((rf: any) => rf.risk === 'High')).length || 0;

  const [loadingStep, setLoadingStep] = useState(0);
  const loadingMessages = [
    { title: "Extracting text...", desc: "Reading document content" },
    { title: "Sending to AI...", desc: "Securely transferring to Gemini" },
    { title: "Analyzing clauses...", desc: "Scanning for hidden risks" },
    { title: "Structuring report...", desc: "Formatting final insights" }
  ];

  useEffect(() => {
    if (mutation.isPending) {
      setLoadingStep(0);
      const interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [mutation.isPending]);

  const validateFile = (file: File) => {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      toast.error('File is too large', { description: 'Please upload a document smaller than 10MB.' });
      return false;
    }
    
    const allowedTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'text/plain'
    ];
    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowedExts = ['pdf', 'docx', 'txt'];

    if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext || '')) {
      toast.error('Unsupported file format', { description: 'We only support PDF, DOCX, and TXT files for now.' });
      return false;
    }

    return true;
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      mutation.mutate(file);
    } else if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset input so same file can be selected again if needed
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const safePercent = totalAnalyses > 0 ? Math.round((safeCount / totalAnalyses) * 100) : 0;

  const statCards = [
    {
      label: 'Total Analyses',
      value: totalAnalyses,
      suffix: '',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      label: 'Risks Found',
      value: redFlagsCount,
      suffix: redFlagsCount !== 1 ? 'risks' : 'risk',
      icon: <AlertTriangle className="w-4 h-4" />,
    },
    {
      label: 'Clean Contracts',
      value: safeCount,
      suffix: `${safePercent}% of total`,
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-6xl w-full">
      {/* ── Header ───────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-semibold tracking-[-0.04em] text-text">
            Good morning, {user?.displayName?.split(' ')[0]}
          </h1>
          <p className="text-text-muted text-sm mt-2">Understand your next contract before you sign.</p>
        </div>
      </motion.div>

      {/* ── Stat Cards (Bento Grid Row) ─────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((stat, i) => (
          <Card key={i} className="border-border bg-surface">
            <CardContent className="flex items-start gap-4 pt-[var(--card-spacing)]">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                {stat.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-muted">{stat.label}</p>
                <p className="text-2xl font-semibold text-text mt-0.5 tabular-nums">
                  {history ? (
                    <NumberTicker value={stat.value as number} />
                  ) : (
                    <Loader variant="spinner" size={20} />
                  )}
                </p>
                <p className="text-xs text-text-subtle mt-0.5">{stat.suffix}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Bento Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 items-start">

        {/* ── LEFT: Upload Zone ─────────────────────────── */}
        <motion.div
          id="tour-dropzone"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative border border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-[background-color,border-color,box-shadow] duration-200 min-h-[360px] border-border bg-surface hover:border-primary/30 hover:bg-surface-2/30"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
        >
          {/* Drag pulse overlay */}
          <AnimatePresence>
            {isDragging && (
              <motion.div
                key="pulse"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 bg-primary/5 rounded-3xl pointer-events-none"
              />
            )}
          </AnimatePresence>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.docx,.txt"
            title="Upload contract file"
          />

          {mutation.isPending ? (
            /* Loading state */
            <div className="flex flex-col items-center gap-5 relative z-10 py-12">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-primary/10">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
                <motion.div
                  className="absolute -inset-2 border-2 border-primary/20 rounded-3xl border-t-primary"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              </div>
              <div className="flex flex-col gap-1 h-[48px] justify-center items-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={loadingStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center gap-1"
                  >
                    <p className="font-bold text-text">{loadingMessages[loadingStep].title}</p>
                    <p className="text-xs text-text-muted">{loadingMessages[loadingStep].desc}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="w-48 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '90%' }}
                  transition={{ duration: 15, ease: 'linear' }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
            </div>
          ) : (
            /* Idle / drag state */
            <div className="flex flex-col items-center gap-5 relative z-10 py-12 px-8">
              {/* Levitating icon */}
              <motion.div
                animate={isDragging ? { scale: 1.15, y: -4 } : { y: [0, -6, 0] }}
                transition={isDragging ? {} : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center transition-colors duration-300 bg-primary/10 text-primary"
              >
                <Upload className="w-8 h-8" />
              </motion.div>

              <div className="flex flex-col gap-1.5">
                <p className="font-bold text-text text-base">
                  {isDragging ? 'Drop it here!' : 'Drop your contract here'}
                </p>
                <p className="text-xs text-text-muted">PDF, DOCX, or TXT — up to 10MB</p>
              </div>

              <Button
                variant="primary"
                size="md"
                disabled={isDragging}
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              >
                Browse Files
              </Button>

              {/* Empty State callout — only for new users */}
              {history && history.length === 0 && !isDragging && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col items-center gap-3 pt-2 w-full max-w-xs"
                >
                  {/* Divider */}
                  <div className="flex items-center gap-3 w-full">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-[10px] text-text-subtle font-bold tracking-widest">your first contract awaits</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  {/* Benefit pills */}
                  <div className="flex flex-wrap justify-center gap-2">
                    {([
                      { Icon: Zap, text: 'results in seconds' },
                      { Icon: Shield, text: 'flags hidden risks' },
                      { Icon: MessageCircle, text: 'plain-english summary' },
                    ]).map((b) => (
                      <span
                        key={b.text}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border bg-surface border-border text-text-muted"
                      >
                        <b.Icon className="w-3 h-3" />
                        {b.text}
                      </span>
                    ))}
                  </div>

                  {/* Social proof */}
                  <p className="text-[10px] text-text-subtle text-center leading-relaxed">
                    Trusted by <span className="font-bold text-text">2,400+</span> freelancers & founders to catch what lawyers miss.
                  </p>
                </motion.div>
              )}
            </div>
          )}

          {/* Error banner */}
          {mutation.isError && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-5 left-5 right-5 flex items-start gap-2 text-red-500 text-xs bg-red-50 border border-red-100 px-4 py-2.5 rounded-xl text-left shadow-sm z-20"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                {(mutation.error as any)?.response?.data?.error || mutation.error?.message || 'Analisis gagal. Silakan periksa dokumen Anda dan coba lagi.'}
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* ── RIGHT COLUMN ─────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* AI Persona selector */}
          <motion.div
            id="tour-persona"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
                   className="rounded-2xl border p-4 flex flex-col gap-3 bg-surface border-border shadow-sm"
          >
            <div>
              <p className="text-xs font-bold text-text-subtle tracking-wide">AI advisor persona</p>
              <p className="text-[10px] text-text-subtle/60 mt-0.5">Choose who analyzes your contract</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {personas.map((persona) => {
                const isActive = selectedPersona === persona.id;
                return (
                  <motion.button
                    key={persona.id}
                    whileTap={{ scale: 0.97 }}
                    onHoverStart={() => setHoveredPersona(persona.id)}
                    onHoverEnd={() => setHoveredPersona(null)}
                    onClick={() => setSelectedPersona(persona.id as Persona)}
                   className="relative flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-[background-color,border-color,box-shadow,transform] duration-150 border-border bg-surface hover:border-primary/20 hover:bg-primary/3"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="persona-ring"
                        className="absolute inset-0 rounded-xl border-2 border-primary/50"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <persona.icon className="w-5 h-5 text-primary" />
                    <p className={`text-[11px] font-bold leading-tight ${isActive ? 'text-primary' : 'text-text'}`}>
                      {persona.id}
                    </p>
                    <p className="text-[9px] text-text-subtle font-medium leading-tight">{persona.desc}</p>
                  </motion.button>
                );
              })}
            </div>

            {/* Live persona preview */}
            <AnimatePresence mode="wait">
              {hoveredPersona && (() => {
                const p = personas.find(x => x.id === hoveredPersona);
                if (!p) return null;
                return (
                  <motion.div
                    key={hoveredPersona}
                    initial={{ opacity: 0, y: -4, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -4, height: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <div className="flex gap-2.5 p-3 rounded-xl border bg-primary/3 border-primary/10">
                      {(() => {
                        const Icon = personas.find(x => x.id === p.id)?.icon;
                        return Icon ? <Icon className="w-4 h-4 shrink-0 mt-0.5" /> : null;
                      })()}
                      <p className="text-[11px] text-text-muted leading-relaxed font-medium italic">
                        {p.preview}
                      </p>
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </motion.div>

          {/* Legal disclaimer */}

          {/* Legal disclaimer */}
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl border text-[10px] text-text-subtle font-medium leading-relaxed bg-surface border-border">
            <ShieldCheck className="w-3.5 h-3.5 text-primary/50 shrink-0 mt-0.5" />
            <span>AI analysis is for informational purposes only and does not constitute professional legal advice.</span>
          </div>
        </div>
      </div>

      {/* ── Recent Activity ──────────────────────────────── */}
      {history && history.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-3"
        >
          {/* Section header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-text-muted" />
              <span className="text-sm font-bold text-text">recent activity</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/history')}
            >
              view all
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Cards */}
          <div className="flex flex-col gap-2">
            {[...history]
              .sort((a: any, b: any) => {
                const aTime = a.createdAt?.seconds ?? 0;
                const bTime = b.createdAt?.seconds ?? 0;
                return bTime - aTime;
              })
              .slice(0, 3)
              .map((item: any, i: number) => {
                const hasHighRisk = item.result?.redFlags?.some((rf: any) => rf.risk === 'High');
                const highRiskCount = item.result?.redFlags?.filter((rf: any) => rf.risk === 'High').length ?? 0;
                const PersonaIcon = personas.find(x => x.id === item.persona)?.icon || Shield;
                const date = item.createdAt?.seconds
                  ? new Date(item.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : 'just now';

                return (
                  <motion.button
                    key={item.id || i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => navigate(`/analyze/${item.id}`, { state: { result: item.result, persona: item.persona, fileUrl: item.fileUrl } })}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border text-left transition-all duration-200 group bg-surface border-border hover:border-border"
                  >
                    {/* File icon */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      hasHighRisk ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                    }`}>
                      <FileText className="w-4 h-4" />
                    </div>

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text truncate">
                        {item.fileName || 'Unnamed contract'}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-text-subtle font-medium inline-flex items-center gap-1">
                            <PersonaIcon className="w-3 h-3" /> {item.persona}
                          </span>
                        <span className="text-[10px] text-text-subtle/50">·</span>
                        <span className="text-[10px] text-text-subtle font-medium">{date}</span>
                      </div>
                    </div>

                    {/* Risk badge */}
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                      hasHighRisk
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-green-500/10 text-green-600'
                    }`}>
                      {hasHighRisk ? (
                        <><AlertTriangle className="w-3 h-3" /> {highRiskCount} risk{highRiskCount > 1 ? 's' : ''}</>
                      ) : (
                        <><CheckCircle2 className="w-3 h-3" /> clean</>
                      )}
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-4 h-4 text-text-subtle shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </motion.button>
                );
              })}
          </div>
        </motion.div>
      )}
    </div>
  );
};
