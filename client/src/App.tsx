import { BrowserRouter as Router, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
const Analyzer = lazy(() => import('./pages/Analyzer').then(m => ({ default: m.Analyzer })));
import { History } from './pages/History';
import { Settings } from './pages/Settings';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './layouts/Layout';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'sonner';
import { GlassyBackground } from './components/GlassyBackground';
import { LegalPage } from './pages/LegalPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AnimatedRoutes } from './components/AnimatedRoutes';
import { CommandPalette } from '@/components/motion/command-palette';
import { LayoutDashboard, FilePenLine, History as HistoryIcon, Settings as SettingsIcon } from 'lucide-react';

import { Component, useState, Suspense, lazy } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
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
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-10 bg-red-50 text-red-900">
          <h1 className="text-2xl font-bold mb-4">Application Crash</h1>
          <pre className="bg-white p-6 rounded-xl border border-red-200 text-xs overflow-auto max-w-full">
            {this.state.error?.stack}
          </pre>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg font-bold"
          >
            Back to Dashboard
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}


function CommandPaletteWithNav() {
  const navigate = useNavigate();
  return (
    <CommandPalette
      items={[
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, onSelect: () => navigate('/dashboard') },
        { id: 'generator', label: 'Generator', icon: FilePenLine, onSelect: () => navigate('/generator') },
        { id: 'history', label: 'History', icon: HistoryIcon, onSelect: () => navigate('/history') },
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
          <GlassyBackground />
          <Router>
              <AnimatedRoutes />
              <CommandPaletteWithNav />
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
