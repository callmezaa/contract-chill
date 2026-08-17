import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, ArrowDown, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SectionHeader } from './SectionHeader';

const sampleLegalText = "The Receiving Party shall hold and maintain the Confidential Information in strictest confidence for the sole and exclusive benefit of the Disclosing Party. The Receiving Party shall carefully restrict access to Confidential Information to employees, contractors and third parties as is reasonably required to carry out the obligations under this Agreement.";

const translatedText = "You must keep this information completely secret. You can only use it to benefit the person sharing it with you. Only share it with your employees or contractors if they absolutely need it to do their jobs.";

export const MiniDemo = () => {
  const { t } = useTranslation();
  
  const [isTranslating, setIsTranslating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [displayedText, setDisplayedText] = useState("");

  const handleTranslate = () => {
    if (showResult) {
      // Reset
      setShowResult(false);
      setDisplayedText("");
      return;
    }

    setIsTranslating(true);
    // Simulate API call delay
    setTimeout(() => {
      setIsTranslating(false);
      setShowResult(true);
    }, 1200);
  };

  // Typing effect for the result
  useEffect(() => {
    if (showResult) {
      let i = 0;
      setDisplayedText("");
      const interval = setInterval(() => {
        setDisplayedText(translatedText.slice(0, i + 1));
        i++;
        if (i >= translatedText.length) {
          clearInterval(interval);
        }
      }, 30);
      return () => clearInterval(interval);
    }
  }, [showResult]);

  return (
    <section className="max-w-5xl mx-auto px-6 py-20">
      <SectionHeader
        label={t('landing.miniDemo.sectionLabel')}
        title={t('landing.miniDemo.title')}
        subtitle={t('landing.miniDemo.subtitle')}
        className="mb-12"
      />

      <div className="bg-surface rounded-2xl shadow-[0_20px_60px_-28px_rgba(0,0,0,0.28)] border border-border p-2 overflow-hidden flex flex-col md:flex-row relative">
        
        {/* Left side: Jargon */}
        <div className="flex-1 p-6 md:p-8 flex flex-col bg-surface-2 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-text-muted">{t('landing.miniDemo.originalClause')}</span>
            <span className="text-[10px] bg-surface text-text-muted border border-border px-2 py-1 rounded-md font-medium">{t('landing.miniDemo.standardNda')}</span>
          </div>
          <div className="relative flex-1">
            <p className="text-text text-sm md:text-base leading-relaxed font-serif italic">
              "{sampleLegalText}"
            </p>
          </div>
          
          <div className="mt-8 flex justify-center md:justify-start">
            <span className="relative inline-flex">
              {!showResult && (
                <span aria-hidden="true" className="pointer-events-none absolute inset-0 translate-y-[3px] rounded-xl bg-white shadow-[0_12px_22px_-8px_rgba(0,0,0,0.4)]" />
              )}
              <button 
                onClick={handleTranslate}
                disabled={isTranslating}
                 className={`relative z-10 flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-[background-color,transform] active:scale-[0.96] overflow-hidden
                  ${showResult 
                    ? 'bg-surface-2 text-text hover:bg-border' 
                    : 'bg-primary text-primary-foreground hover:-translate-y-0.5'
                  }
                `}
              >
                {!showResult && (
                  <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/25 via-white/10 to-transparent" />
                )}
                {isTranslating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('landing.miniDemo.analyzing')}
                </>
              ) : showResult ? (
                t('landing.miniDemo.resetDemo')
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {t('landing.miniDemo.translateButton')}
                </>
              )}
            </button>
            </span>
          </div>
        </div>

        {/* Center arrow / divider */}
        <div className="hidden md:flex items-center justify-center -mx-4 z-10">
          <div className="w-8 h-8 bg-surface border border-border rounded-full flex items-center justify-center shadow-sm">
            <ArrowRight className="w-4 h-4 text-text-muted" />
          </div>
        </div>
        <div className="md:hidden flex items-center justify-center -my-4 z-10">
          <div className="w-8 h-8 bg-surface border border-border rounded-full flex items-center justify-center shadow-sm">
            <ArrowDown className="w-4 h-4 text-text-muted" />
          </div>
        </div>

        {/* Right side: Plain English */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-center bg-surface rounded-xl">
          <AnimatePresence mode="wait">
            {!showResult && !isTranslating && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center text-center h-full text-text-muted gap-3"
              >
                <Sparkles className="w-8 h-8 text-text-subtle" />
                <p className="text-sm">{t('landing.miniDemo.clickTranslate')}</p>
              </motion.div>
            )}

            {isTranslating && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-4 h-full"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                  <span className="text-xs font-bold text-primary">{t('landing.miniDemo.geminiThinking')}</span>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-surface-2 rounded-full w-full animate-pulse" />
                  <div className="h-3 bg-surface-2 rounded-full w-5/6 animate-pulse" />
                  <div className="h-3 bg-surface-2 rounded-full w-4/5 animate-pulse" />
                </div>
              </motion.div>
            )}

            {showResult && (
              <motion.div 
                key="result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col h-full"
              >
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span className="text-xs font-bold text-success">{t('landing.miniDemo.simplifiedByAi')}</span>
                </div>
                <p className="text-text text-lg md:text-xl font-medium leading-relaxed">
                  {displayedText}
                  <span className="inline-block w-1 h-5 ml-1 bg-primary animate-pulse align-middle" />
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
};
