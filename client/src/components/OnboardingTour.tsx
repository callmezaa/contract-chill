import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface Step {
  id: string;
  title: string;
  description: string;
  targetId: string;
}

const steps: Step[] = [
  {
    id: 'welcome',
    title: 'Welcome to ContractChill! ❄️',
    description: 'Ready to make contract analysis actually chill? Let us show you around briefly.',
    targetId: 'tour-logo'
  },
  {
    id: 'persona',
    title: 'Select your AI Persona',
    description: 'Choose who analyzes your contract. Want a "Chill Friend" vibe or a "Professional Lawyer"?',
    targetId: 'tour-persona'
  },
  {
    id: 'stats',
    title: 'Track your Progress',
    description: 'Keep an eye on risk trends and your total analyzed documents here.',
    targetId: 'tour-stats'
  },
  {
    id: 'dropzone',
    title: 'Analyze in Seconds',
    description: 'Just drop your contract here. We handle the reading, you keep the chill.',
    targetId: 'tour-dropzone'
  }
];

export const OnboardingTour = ({ onComplete }: { onComplete: () => void }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    // Scroll target into view
    const targetElement = document.getElementById(steps[currentStep].targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const step = steps[currentStep];

  return (
    <>
      {/* Dynamic Style Injection for the Target Element */}
      <style>{`
        #${step.targetId} {
          position: relative;
          z-index: 50;
          outline: 3px solid rgba(79, 70, 229, 0.8) !important;
          outline-offset: 4px;
          border-radius: inherit;
          box-shadow: 0 0 20px rgba(79, 70, 229, 0.4) !important;
          animation: target-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          transition: all 0.3s ease;
        }

        @keyframes target-pulse {
          0%, 100% {
            outline-color: rgba(79, 70, 229, 0.8);
            box-shadow: 0 0 20px rgba(79, 70, 229, 0.4);
          }
          50% {
            outline-color: rgba(79, 70, 229, 0.3);
            box-shadow: 0 0 10px rgba(79, 70, 229, 0.1);
          }
        }
      `}</style>

      {/* Fixed Command Drawer */}
      <div className="fixed bottom-6 left-0 right-0 z-[100] px-4 pointer-events-none flex justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`w-full max-w-[400px] rounded-[1.5rem] p-6 shadow-2xl pointer-events-auto border backdrop-blur-xl ${
              isDark 
                ? 'bg-surface/95 border-white/10 shadow-black/50' 
                : 'bg-white/95 border-slate-200 shadow-primary/10'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5">
                    Step {currentStep + 1} of {steps.length}
                  </p>
                  <h3 className="text-base font-display font-bold text-text leading-tight">
                    {step.title}
                  </h3>
                </div>
              </div>
              <button 
                onClick={onComplete} 
                title="Close tour"
                className={`p-1.5 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-white/10 text-text-subtle' : 'hover:bg-slate-100 text-slate-400'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[13px] text-text-muted leading-relaxed mb-6 font-medium">
              {step.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {steps.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentStep 
                        ? 'w-6 bg-primary' 
                        : isDark ? 'w-1.5 bg-white/10' : 'w-1.5 bg-slate-200'
                    }`} 
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <button 
                    onClick={handlePrev}
                    title="Previous step"
                    className={`p-2 rounded-xl transition-all ${
                      isDark ? 'hover:bg-white/10 text-text-subtle' : 'hover:bg-slate-100 text-slate-500'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={handleNext}
                  className="bg-text text-background py-2 px-5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg hover:opacity-90 transition-opacity"
                >
                  {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
};
