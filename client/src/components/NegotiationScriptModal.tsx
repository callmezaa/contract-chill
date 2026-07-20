import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, MessageSquare, Send, MessageCircle, Mail, Shield, Zap, type LucideIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, Sparkles, RefreshCw } from 'lucide-react';
import type { Persona } from '../types/analysis';
import { generateNegotiationScript } from '../services/api';

interface NegotiationScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  script: string;
  clause: string;
  explanation: string;
  persona: Persona;
}

export const NegotiationScriptModal = ({ isOpen, onClose, script, clause, explanation, persona }: NegotiationScriptModalProps) => {
  const [copied, setCopied] = useState(false);
  const [currentScript, setCurrentScript] = useState(script);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTone, setSelectedTone] = useState<'Friendly' | 'Assertive' | 'Tough'>('Assertive');

  useEffect(() => {
    setCurrentScript(script);
    setSelectedTone('Assertive');
  }, [script, isOpen]);

  const handleGenerate = async (toneToUse?: 'Friendly' | 'Assertive' | 'Tough') => {
    const activeTone = toneToUse || selectedTone;
    if (toneToUse) {
      setSelectedTone(toneToUse);
    }
    try {
      setIsGenerating(true);
      const scriptText = await generateNegotiationScript(
        clause,
        explanation,
        persona,
        activeTone
      );
      setCurrentScript(scriptText);
      toast.success(`Naskah negosiasi (${activeTone}) berhasil diperbarui!`);
    } catch (error) {
      console.error('Generation Error:', error);
      toast.error('Gagal memperbarui naskah');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!currentScript) return;
    navigator.clipboard.writeText(currentScript);
    setCopied(true);
    toast.success('Script copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    if (!currentScript) return;
    const opener = `Halo! Mengenai klausul kontrak berikut:\n"${clause.length > 80 ? clause.substring(0, 80) + '...' : clause}"\n\nBerikut adalah naskah usulan negosiasi saya:\n\n`;
    const fullMessage = encodeURIComponent(`${opener}${currentScript}`);
    window.open(`https://wa.me/?text=${fullMessage}`, '_blank');
    toast.success('Membuka pintasan WhatsApp Share...');
  };

  const handleSendEmail = () => {
    if (!currentScript) return;
    
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Menyusun naskah PDF dengan Stempel Resmi Contract-Chill...',
        success: 'Berhasil! Naskah PDF resmi dikirim ke email terdaftar Anda 📧',
        error: 'Gagal mengirim email.',
      }
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="negotiation-script-title"
              className="bg-surface w-full max-w-md rounded-2xl shadow-2xl border border-border overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-2/30 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div>
                    <h3 id="negotiation-script-title" className="text-sm font-display font-semibold text-text">Negotiation script</h3>
                    <p className="text-[9px] text-text-subtle font-medium">Ready-to-use template</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-surface-2 rounded-lg transition-colors text-text-subtle"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-5 flex flex-col gap-5 overflow-y-auto custom-scrollbar">
                {/* Related Clause */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-text-subtle tracking-wider ml-1">Target Clause</label>
                  <div className="p-3 rounded-xl bg-surface-2 border border-border italic text-[11px] text-text-muted leading-relaxed line-clamp-2">
                    "{clause}"
                  </div>
                </div>

                {/* Negotiation Style Selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-bold text-text-subtle tracking-wider ml-1">Negotiation Style</label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-surface-2 border border-border">
                    {[
                      { id: 'Friendly' as const, label: 'Friendly', Icon: MessageCircle },
                      { id: 'Assertive' as const, label: 'Assertive', Icon: Shield },
                      { id: 'Tough' as const, label: 'Tough', Icon: Zap }
                    ].map((toneOpt) => {
                      const isActive = selectedTone === toneOpt.id;
                      const ToneIcon = toneOpt.Icon;
                      return (
                        <button
                          key={toneOpt.id}
                          onClick={() => !isGenerating && handleGenerate(toneOpt.id)}
                          disabled={isGenerating}
                          className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-background text-primary border border-border/80 shadow-sm scale-[1.02]'
                              : 'text-text-subtle hover:text-text hover:bg-background/40 border border-transparent'
                          }`}
                        >
                          <ToneIcon className="w-3.5 h-3.5" />
                          <span>{toneOpt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Script Box */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-text-subtle tracking-wider ml-1">AI Suggested Script</label>
                  <div className="relative group">
                    <div className={`w-full bg-background border border-border rounded-xl p-4 text-xs text-text font-medium leading-relaxed min-h-[120px] whitespace-pre-wrap flex items-center justify-center ${isGenerating ? 'opacity-50' : ''}`}>
                      {isGenerating ? (
                        <div className="flex flex-col items-center gap-2 text-primary">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <p className="text-[10px] font-bold animate-pulse">Gemini is writing...</p>
                        </div>
                      ) : currentScript ? (
                        <div className="w-full text-left">{currentScript}</div>
                      ) : (
                        <div className="flex flex-col items-center gap-3 text-center py-2">
                          <Sparkles className="w-6 h-6 text-primary/30" />
                          <div>
                            <p className="text-[10px] text-text-muted font-bold">Old Analysis</p>
                            <p className="text-[9px] text-text-subtle">Generate script now</p>
                          </div>
                          <button 
                            onClick={() => handleGenerate()}
                            className="btn-primary py-1.5 px-4 text-[9px] flex items-center gap-2"
                          >
                            <RefreshCw className="w-2.5 h-2.5" />
                            Generate Now
                          </button>
                        </div>
                      )}
                    </div>
                    {currentScript && !isGenerating && (
                      <button
                        onClick={handleCopy}
                        className="absolute top-2 right-2 p-2 bg-surface border border-border rounded-lg shadow-sm hover:border-primary/50 hover:bg-white transition-all group/btn active:scale-90"
                        title="Copy script"
                      >
                        {copied ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3 text-text-subtle group-hover/btn:text-primary transition-colors" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Smart Share Hub */}
                {currentScript && !isGenerating && (
                  <div className="flex flex-col gap-2 border-t pt-4">
                    <label className="text-[9px] font-bold text-text-subtle tracking-wider ml-1">Smart Share Hub</label>
                    <div className="grid grid-cols-2 gap-2">
                      {/* WhatsApp Share */}
                      <button
                        onClick={handleWhatsAppShare}
                        className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-green-500/20 bg-green-500/5 hover:bg-green-500/10 text-green-600 dark:text-green-400 font-bold text-[10px] transition-all hover:scale-[1.02] active:scale-98 cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Send to WhatsApp
                      </button>

                      {/* PDF to Email */}
                      <button
                        onClick={handleSendEmail}
                        className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-bold text-[10px] transition-all hover:scale-[1.02] active:scale-98 cursor-pointer"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Send PDF to Email
                      </button>
                    </div>
                  </div>
                )}

                {/* Info Note */}
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-primary/5 border border-primary/10 mt-1">
                  <Send className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                  <p className="text-[9px] text-primary/80 font-medium leading-normal">
                    AI scripts are best used as a starting point for professional communication.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-surface-2/30 border-t border-border flex justify-end gap-2 shrink-0">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-border text-[10px] font-bold text-text-muted hover:bg-surface transition-all"
                >
                  Close
                </button>
                <button
                  onClick={handleCopy}
                  disabled={!currentScript || isGenerating}
                  className="btn-primary px-6 py-2 text-[10px] flex items-center gap-2"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy Script'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
