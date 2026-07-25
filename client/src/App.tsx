import { BrowserRouter as Router, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'sonner';
import { AnimatedRoutes } from './components/AnimatedRoutes';
import { CommandPalette } from '@/components/motion/command-palette';
import { InstallPrompt } from '@/components/InstallPrompt';
import { LayoutDashboard, FilePenLine, History as HistoryIcon, Settings as SettingsIcon, BarChart3 } from 'lucide-react';

import { Component, useState } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { withTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

class ErrorBoundaryInner extends Component<{ children: ReactNode; t: TFunction }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode; t: TFunction }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const { t } = this.props;
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-10 bg-red-50 text-red-900">
          <h1 className="text-2xl font-bold mb-4">{t('errors.applicationCrash')}</h1>
          <pre className="bg-white p-6 rounded-xl border border-red-200 text-xs overflow-auto max-w-full">
            {this.state.error?.stack}
          </pre>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg font-bold"
          >
            {t('common.buttons.backToDashboard')}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const ErrorBoundary = withTranslation()(ErrorBoundaryInner);


function CommandPaletteWithNav() {
  const navigate = useNavigate();
  return (
    <CommandPalette
      items={[
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, onSelect: () => navigate('/dashboard') },
        { id: 'generator', label: 'Generator', icon: FilePenLine, onSelect: () => navigate('/generator') },
        { id: 'history', label: 'History', icon: HistoryIcon, onSelect: () => navigate('/history') },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, onSelect: () => navigate('/analytics') },
        { id: 'settings', label: 'Settings', icon: SettingsIcon, onSelect: () => navigate('/settings') },
      ]}
    />
  );
}

function App() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Toaster position="top-center" richColors />
          <Router>
              <AnimatedRoutes />
              <CommandPaletteWithNav />
          </Router>
          <InstallPrompt />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
