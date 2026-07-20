import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, ShieldCheck, X, MessageSquare, Mail, Shield, Scale, type LucideIcon } from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

interface AnalysisChatProps {
  fileUrl?: string;
  previousAnalysis: any;
  persona: string;
}

export const AnalysisChat = ({ fileUrl, previousAnalysis, persona }: AnalysisChatProps) => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isDark = theme === 'dark';

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) setShowTooltip(true);
    }, 2000);
    
    const hideTimer = setTimeout(() => {
      setShowTooltip(false);
    }, 12000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  useEffect(() => {
    if (isOpen) setShowTooltip(false);
  }, [isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await api.post(`/chat`, {
        question: userMessage,
        fileUrl,
        previousAnalysis,
        persona
      });

      setMessages(prev => [...prev, { role: 'ai', content: response.data.response }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I'm having trouble connecting right now. Can you try again?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedChips: { Icon: LucideIcon; label: string; prompt: string }[] = [
    { 
      Icon: Mail,
      label: 'Tulis email penolakan', 
      prompt: `Tuliskan draft email penolakan berisiko tinggi yang profesional dan persuasif dengan gaya bicara khas ${persona}.` 
    },
    { 
      Icon: Shield,
      label: 'Cara revisi klausul', 
      prompt: `Bagaimana cara merevisi klausul paling berisiko dalam kontrak ini agar lebih adil menurut pandangan ${persona}?` 
    },
    { 
      Icon: MessageSquare,
      label: 'Sederhanakan bahasa', 
      prompt: `Minta ${persona} untuk menerjemahkan bahasa hukum (legalese) yang rumit dalam kontrak ini menjadi penjelasan santai yang mudah dimengerti.` 
    },
    { 
      Icon: Scale,
      label: 'Cari risiko terlewat', 
      prompt: `Menurut pandangan tajam ${persona}, apakah ada jebakan hukum tersembunyi atau hak penting saya yang terlewatkan di dokumen ini?` 
    }
  ];

  const handleChipClick = async (promptText: string) => {
    if (isLoading) return;

    setMessages(prev => [...prev, { role: 'user', content: promptText }]);
    setIsLoading(true);

    try {
      const response = await api.post(`/chat`, {
        question: promptText,
        fileUrl,
        previousAnalysis,
        persona
      });

      setMessages(prev => [...prev, { role: 'ai', content: response.data.response }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I'm having trouble connecting right now. Can you try again?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            role="dialog"
            aria-modal="false"
            aria-labelledby="analysis-chat-title"
            className={`w-[350px] max-w-[calc(100vw-32px)] h-[500px] max-h-[70vh] rounded-2xl shadow-2xl border flex flex-col overflow-hidden mb-1.5 transition-colors duration-200 ${
               isDark ? 'bg-surface border-white/10 shadow-black/40' : 'bg-surface border-border shadow-black/[0.05]'
            }`}
          >
            {/* Header */}
            <div className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
              isDark ? 'bg-surface/60 border-white/5' : 'bg-white/60 border-slate-100'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                   <h3 id="analysis-chat-title" className="text-xs font-display font-semibold text-text leading-tight">Ask {persona}</h3>
                  <p className="text-[9px] text-text-subtle font-medium">Instant insights</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className={`p-1.5 rounded-lg transition-colors text-text-subtle ${
                  isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                }`}
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar transition-colors ${
              isDark ? 'bg-black/20' : 'bg-slate-50/50'
            }`}>
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center p-4 gap-2.5">
                  <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${
                    isDark ? 'bg-surface border-white/5' : 'bg-white border-slate-200'
                  }`}>
                    <MessageSquare className="w-5 h-5 text-text-subtle opacity-20" />
                  </div>
                  <p className="text-[11px] text-text-muted font-medium leading-relaxed">
                    Ask me anything about this contract.
                  </p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'ai' && (
                    <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mr-2 mt-auto">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[85%] p-3 text-[12px] leading-relaxed shadow-sm transition-all ${
                    m.role === 'user' 
                      ? 'bg-primary text-white rounded-xl rounded-tr-none font-medium' 
                      : isDark 
                        ? 'bg-surface-2/80 text-text border border-white/5 rounded-xl rounded-tl-none font-medium'
                        : 'bg-white text-text border border-slate-100 rounded-xl rounded-tl-none font-medium'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mr-2 mt-auto">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className={`border p-3 rounded-xl rounded-tl-none shadow-sm flex items-center gap-2 ${
                    isDark ? 'bg-surface-2/80 border-white/5' : 'bg-white border-slate-100'
                  }`}>
                    <Loader2 className="w-3 h-3 animate-spin text-primary" />
                    <span className="text-[11px] font-semibold text-text-muted">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Suggestions Chips */}
            <div 
              className={`px-3 py-2 border-t flex gap-2 overflow-x-auto scrollbar-none shrink-0 ${
                isDark ? 'bg-surface/40 border-white/5' : 'bg-slate-50/70 border-slate-100'
              }`} 
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none'
              }}
            >
              {suggestedChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleChipClick(chip.prompt)}
                  disabled={isLoading}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-semibold tracking-wide transition-all active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer ${
                    isDark 
                      ? 'bg-surface border-white/5 text-text-muted hover:text-primary hover:border-primary/30 hover:bg-primary/5' 
                      : 'bg-white border-slate-200 text-slate-600 hover:text-primary hover:border-primary/30 hover:bg-primary/5'
                  }`}
                >
                  <chip.Icon className="w-3 h-3" />
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className={`p-3 border-t shrink-0 ${
              isDark ? 'bg-surface/60 border-white/5' : 'bg-white/80 border-slate-100'
            }`}>
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  className={`w-full border rounded-xl pl-3.5 pr-10 py-2.5 text-[12px] text-text placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all ${
                    isDark ? 'bg-black/40 border-white/10' : 'bg-slate-50 border-slate-200'
                  }`}
                />
                <button 
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="absolute right-1.5 top-1.5 p-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all disabled:opacity-40"
                  title="Send message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex items-center">
        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip && !isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 15, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.95 }}
              className={`absolute right-16 px-4 py-2.5 rounded-2xl rounded-tr-sm shadow-lg text-[12px] font-medium whitespace-nowrap pointer-events-none z-0 ${
                isDark 
                  ? 'bg-surface/90 border border-white/5 text-text-muted backdrop-blur-md' 
                  : 'bg-white border border-slate-200 text-slate-600 shadow-slate-200/50'
              }`}
            >
              ask me anything about this contract!
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all z-10"
          title={isOpen ? "close chat" : "ask ai"}
        >
          {/* Pulsing indicator */}
          {!isOpen && (
            <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-primary border-2 border-background"></span>
            </span>
          )}

          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <X className="w-5 h-5" />
              </motion.div>
            ) : (
              <motion.div key="chat" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.5, opacity: 0 }}>
                <MessageSquare className="w-5 h-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
};
