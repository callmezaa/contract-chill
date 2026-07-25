import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Download, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { EASE_OUT, SPRING_PANEL } from '@/lib/ease';
import { Button } from '@/components/motion/button';

export function InstallPrompt() {
  const { t } = useTranslation();
  const { shouldShow, promptInstall, dismiss } = useInstallPrompt();
  const reduce = useReducedMotion();

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
          transition={reduce ? { duration: 0.2 } : SPRING_PANEL}
          className="fixed bottom-6 right-6 z-50 max-w-sm w-full"
        >
          <div className="relative bg-surface/80 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-5 overflow-hidden">
            {/* Subtle gradient accent */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

            {/* Close button */}
            <button
              onClick={dismiss}
              className="absolute top-3 right-3 p-1 rounded-lg text-text-subtle hover:text-text hover:bg-surface-2 transition-colors"
              aria-label={t('install.dismiss')}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content */}
            <div className="relative flex items-start gap-4">
              {/* Icon */}
              <motion.div
                initial={reduce ? {} : { scale: 0.8, opacity: 0 }}
                animate={reduce ? {} : { scale: 1, opacity: 1 }}
                transition={reduce ? {} : { delay: 0.1, ...SPRING_PANEL }}
                className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"
              >
                <Download className="w-6 h-6 text-primary" />
              </motion.div>

              {/* Text */}
              <div className="flex-1 min-w-0 pr-2">
                <h3 className="text-sm font-semibold text-text">
                  {t('install.title')}
                </h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  {t('install.description')}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="relative flex items-center gap-2 mt-4">
              <Button
                variant="primary"
                size="sm"
                onClick={promptInstall}
                className="flex-1"
              >
                {t('common.buttons.install')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={dismiss}
              >
                {t('common.buttons.notNow')}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
