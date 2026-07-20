import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowDown, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const sampleLegalText = "The Receiving Party shall hold and maintain the Confidential Information in strictest confidence for the sole and exclusive benefit of the Disclosing Party. The Receiving Party shall carefully restrict access to Confidential Information to employees, contractors and third parties as is reasonably required to carry out the obligations under this Agreement.";

const translatedText = "You must keep this information completely secret. You can only use it to benefit the person sharing it with you. Only share it with your employees or contractors if they absolutely need it to do their jobs.";

export const MiniDemo = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
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
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex flex-col items-center gap-3 text-center mb-12"
      >
        <p className="text-xs font-medium tracking-[0.16em] uppercase text-primary">Live demo</p>
        <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-[-0.05em] text-text [text-wrap:balance]">See the clarity</h2>
        <p className="text-text-muted [text-wrap:pretty]">Turn dense legal language into something you can act on.</p>
      </motion.div>

      <div className="bg-surface rounded-2xl shadow-[0_20px_60px_-28px_rgba(0,0,0,0.28)] border border-border p-2 overflow-hidden flex flex-col md:flex-row relative">
        
        {/* Left side: Jargon */}
        <div className="flex-1 p-6 md:p-8 flex flex-col bg-surface-2 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500">Original Contract Clause</span>
            <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-1 rounded-md font-medium">Standard NDA</span>
          </div>
          <div className="relative flex-1">
            <p className="text-slate-700 text-sm md:text-base leading-relaxed font-serif italic">
              "{sampleLegalText}"
            </p>
          </div>
          
          <div className="mt-8 flex justify-center md:justify-start">
            <button 
              onClick={handleTranslate}
              disabled={isTranslating}
               className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-[background-color,box-shadow,transform] active:scale-[0.96]
                ${showResult 
                  ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' 
                  : 'bg-primary text-white hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/20'
                }
              `}
            >
              {isTranslating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : showResult ? (
                'Reset Demo'
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Translate to plain English
                </>
              )}
            </button>
          </div>
        </div>

        {/* Center arrow / divider */}
        <div className="hidden md:flex items-center justify-center -mx-4 z-10">
          <div className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm">
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>
        <div className="md:hidden flex items-center justify-center -my-4 z-10">
          <div className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm">
            <ArrowDown className="w-4 h-4 text-slate-400" />
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
                className="flex flex-col items-center justify-center text-center h-full text-slate-400 gap-3"
              >
                <Sparkles className="w-8 h-8 text-slate-200" />
                <p className="text-sm">Click translate to see the magic happen</p>
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
                  <span className="text-xs font-bold text-primary">Gemini AI is thinking...</span>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-slate-100 rounded-full w-full animate-pulse" />
                  <div className="h-3 bg-slate-100 rounded-full w-5/6 animate-pulse" />
                  <div className="h-3 bg-slate-100 rounded-full w-4/5 animate-pulse" />
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
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-bold text-green-600">Simplified by AI</span>
                </div>
                <p className="text-slate-800 text-lg md:text-xl font-medium leading-relaxed">
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
