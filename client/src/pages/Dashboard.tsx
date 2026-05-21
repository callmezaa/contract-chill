import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Clock, AlertTriangle, CheckCircle2, Loader2, FileText, ShieldCheck, ChevronRight
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { analyzeContract } from '../services/api';
import type { Persona } from '../types/analysis';
import { db, storage } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'sonner';
import { OnboardingTour } from '../components/OnboardingTour';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { AnimatedCounter } from '../components/AnimatedCounter';

const personas = [
  { id: 'Chill Friend',      icon: '☕', desc: 'Casual & direct',    preview: '"Hey, clause 4 is a red flag. I\'d push back on this before signing."'       },
  { id: 'Angry Lawyer',      icon: '⚖️', desc: 'Strict & protective', preview: '"DO NOT SIGN THIS. They are trying to strip your IP rights completely!"'        },
  { id: 'Corporate Mentor',  icon: '💼', desc: 'Strategic & formal',  preview: '"From a strategic standpoint, clause 7 presents unacceptable liability exposure."' },
  { id: 'Freelancer Senior', icon: '🛡️', desc: 'Payment focused',    preview: '"Watch out — no late payment penalty clause. That\'s how clients ghost you."'    },
];

export const Dashboard = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const isDark = theme === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPersona, setSelectedPersona] = useState<Persona>('Chill Friend');
  const [hoveredPersona, setHoveredPersona] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [mouseCoords, setMouseCoords] = useState<{ x: number; y: number; index: number | null }>({ x: 0, y: 0, index: null });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMouseCoords({ x, y, index });
  };

  const handleMouseLeave = () => {
    setMouseCoords({ x: 0, y: 0, index: null });
  };

  useDocumentTitle('Dashboard - ContractChill');

  useEffect(() => {
    const checkTour = async () => {
      if (!user) return;
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists() || !docSnap.data().onboardingCompleted) {
        const timer = setTimeout(() => setShowTour(true), 1000);
        return () => clearTimeout(timer);
      }
    };
    checkTour();
  }, [user]);

  const completeTour = async () => {
    setShowTour(false);
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), { onboardingCompleted: true }, { merge: true });
        toast.success("You're all set!", { description: "You've completed the tour. Let's analyze some contracts!" });
      } catch (err) {
        console.error('Error saving tour status:', err);
      }
    }
  };

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
      const storageRef = ref(storage, `contracts/${user?.uid}/${Date.now()}_${file.name}`);
      const uploadResult = await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(uploadResult.ref);
      const result = await analyzeContract(file, selectedPersona);
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

  const stats = [
    {
      label: 'red flags found',
      icon: <AlertTriangle className="w-4 h-4" />,
      value: redFlagsCount,
      context: totalAnalyses > 0 ? `from ${totalAnalyses} ${totalAnalyses === 1 ? 'analysis' : 'analyses'}` : 'no data yet',
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      glowColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.06)',
    },
    {
      label: 'clean contracts',
      icon: <CheckCircle2 className="w-4 h-4" />,
      value: safeCount,
      context: totalAnalyses > 0 ? `${safePercent}% of total` : 'no data yet',
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      glowColor: isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.06)',
    },
    {
      label: 'analyses done',
      icon: <Clock className="w-4 h-4" />,
      value: totalAnalyses,
      context: 'all time',
      color: 'text-primary',
      bg: 'bg-primary/10',
      glowColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.06)',
    },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-5xl w-full">
      {/* ── Header ───────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-text">
            Hello, {user?.displayName?.split(' ')[0]} 👋
          </h1>
          <p className="text-text-muted text-sm mt-0.5">Ready to analyze your next contract?</p>
        </div>
      </motion.div>

      {/* ── Bento Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 items-start">

        {/* ── LEFT: Upload Zone ─────────────────────────── */}
        <motion.div
          id="tour-dropzone"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={`relative border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-[360px] ${
            isDragging
              ? 'border-primary bg-primary/5 shadow-2xl shadow-primary/10'
              : isDark
                ? 'border-white/10 bg-surface hover:border-primary/30 hover:bg-surface-2/30'
                : 'border-slate-200 bg-white hover:border-primary/30 hover:bg-slate-50/80 shadow-sm'
          }`}
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
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
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
                  className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"
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
                className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors duration-300 ${
                  isDragging ? 'bg-primary text-white' : isDark ? 'bg-primary/10 text-primary' : 'bg-primary/10 text-primary'
                }`}
              >
                <Upload className="w-8 h-8" />
              </motion.div>

              <div className="flex flex-col gap-1.5">
                <p className="font-bold text-text text-base">
                  {isDragging ? 'Drop it here!' : 'Drop your contract here'}
                </p>
                <p className="text-xs text-text-muted">PDF, DOCX, or TXT — up to 10MB</p>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                className={`btn-primary px-8 py-2.5 relative overflow-hidden group transition-all ${isDragging ? 'opacity-0 scale-95' : 'opacity-100'}`}
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              >
                <span className="relative z-10">Browse Files</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              </motion.button>

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
                    <div className={`h-px flex-1 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
                    <span className="text-[10px] text-text-subtle font-bold tracking-widest">your first contract awaits</span>
                    <div className={`h-px flex-1 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
                  </div>

                  {/* Benefit pills */}
                  <div className="flex flex-wrap justify-center gap-2">
                    {[
                      { icon: '⚡', text: 'results in seconds' },
                      { icon: '🛡️', text: 'flags hidden risks' },
                      { icon: '💬', text: 'plain-english summary' },
                    ].map((b) => (
                      <span
                        key={b.text}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border ${
                          isDark
                            ? 'bg-white/5 border-white/10 text-text-muted'
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                      >
                        <span>{b.icon}</span>
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
            className={`rounded-2xl border p-4 flex flex-col gap-3 ${
              isDark ? 'bg-surface border-white/5' : 'bg-white border-slate-200 shadow-sm'
            }`}
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
                    className={`relative flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all duration-200 ${
                      isActive
                        ? 'border-primary/40 bg-primary/5 shadow-sm shadow-primary/10'
                        : isDark
                          ? 'border-white/5 bg-white/3 hover:border-primary/20 hover:bg-primary/5'
                          : 'border-slate-200 bg-slate-50 hover:border-primary/20 hover:bg-primary/3'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="persona-ring"
                        className="absolute inset-0 rounded-xl border-2 border-primary/50"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="text-lg leading-none">{persona.icon}</span>
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
                    <div className={`flex gap-2.5 p-3 rounded-xl border ${
                      isDark ? 'bg-primary/5 border-primary/10' : 'bg-primary/3 border-primary/10'
                    }`}>
                      <span className="text-base shrink-0 mt-0.5">{p.icon}</span>
                      <p className="text-[11px] text-text-muted leading-relaxed font-medium italic">
                        {p.preview}
                      </p>
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </motion.div>

          {/* Stats cards */}
          <motion.div
            id="tour-stats"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col gap-2"
          >
            {stats.map((stat, i) => (
              <div
                key={i}
                onMouseMove={(e) => handleMouseMove(e, i)}
                onMouseLeave={handleMouseLeave}
                className={`relative overflow-hidden flex items-center gap-4 px-4 py-3 rounded-2xl border transition-all group ${
                  isDark ? 'bg-surface border-white/5 hover:border-white/10' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Glassmorphic Interactive Radial Glow Overlay */}
                {mouseCoords.index === i && (
                  <div
                    className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-100 z-0"
                    style={{
                      background: `radial-gradient(130px circle at ${mouseCoords.x}px ${mouseCoords.y}px, ${stat.glowColor}, transparent 80%)`
                    }}
                  />
                )}

                <div className={`relative z-10 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color} transition-transform duration-200 group-hover:scale-110`}>
                  {stat.icon}
                </div>
                <div className="relative z-10 flex-1 min-w-0">
                  <p className="text-xs text-text-muted font-medium truncate">{stat.label}</p>
                </div>
                {!history ? (
                  <div className="relative z-10 flex flex-col items-end gap-1">
                    <div className="w-8 h-5 bg-surface-2 rounded animate-pulse" />
                    <div className="w-14 h-2.5 bg-surface-2 rounded animate-pulse" />
                  </div>
                ) : (
                  <div className="relative z-10 flex flex-col items-end gap-0.5">
                    <motion.p
                      key={stat.value}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-xl font-display font-black text-text tabular-nums leading-none"
                    >
                      <AnimatedCounter value={stat.value as number} />
                    </motion.p>
                    <p className="text-[9px] text-text-subtle font-medium tabular-nums">
                      {stat.context}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </motion.div>

          {/* Legal disclaimer */}
          <div className={`flex items-start gap-2 px-3 py-2.5 rounded-xl border text-[10px] text-text-subtle font-medium leading-relaxed ${
            isDark ? 'bg-surface border-white/5' : 'bg-slate-50 border-slate-200'
          }`}>
            <ShieldCheck className="w-3.5 h-3.5 text-primary/50 shrink-0 mt-0.5" />
            <span>AI analysis is for informational purposes only and does not constitute professional legal advice.</span>
          </div>
        </div>
      </div>

      {showTour && <OnboardingTour onComplete={completeTour} />}

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
            <button
              onClick={() => navigate('/history')}
              className="flex items-center gap-1 text-xs font-bold text-primary hover:text-indigo-500 transition-colors group"
            >
              view all
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
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
                const personaIcon =
                  item.persona === 'Chill Friend' ? '☕' :
                  item.persona === 'Angry Lawyer' ? '⚖️' :
                  item.persona === 'Corporate Mentor' ? '💼' : '🛡️';
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
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border text-left transition-all duration-200 group ${
                      isDark
                        ? 'bg-surface border-white/5 hover:border-white/10 hover:bg-surface-2/50'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md shadow-sm'
                    }`}
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
                        <span className="text-[10px] text-text-subtle font-medium">
                          {personaIcon} {item.persona}
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
