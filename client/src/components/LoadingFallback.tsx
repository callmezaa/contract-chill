import { Loader } from '@/components/motion/loader';

export const LoadingFallback = ({ className }: { className?: string }) => (
  <div className={`min-h-[50vh] flex items-center justify-center ${className ?? ''}`}>
    <Loader variant="morph" />
  </div>
);
