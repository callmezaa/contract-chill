import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { Suspense, lazy, useEffect } from 'react';
import { LandingPage } from '../pages/LandingPage';
import { ProtectedRoute } from './ProtectedRoute';
import { Layout } from '../layouts/Layout';
import { LegalPage } from '../pages/LegalPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { PageTransition } from './PageTransition';
import { LoadingFallback } from '../components/LoadingFallback';

// Lazy load heavy dashboard, generator, and configuration pages
const Dashboard = lazy(() => import('../pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Generator = lazy(() => import('../pages/Generator').then(m => ({ default: m.Generator })));
const History = lazy(() => import('../pages/History').then(m => ({ default: m.History })));
const Settings = lazy(() => import('../pages/Settings').then(m => ({ default: m.Settings })));
const LoginPage = lazy(() => import('../pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const Analyzer = lazy(() => import('../pages/Analyzer').then(m => ({ default: m.Analyzer })));
const Analytics = lazy(() => import('../pages/Analytics').then(m => ({ default: m.Analytics })));

export const AnimatedRoutes = () => {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Group all app routes under the same key so Layout doesn't unmount
  const isAppRoute = ['/dashboard', '/generator', '/history', '/settings', '/analytics', '/analyze'].some(p => location.pathname.startsWith(p));
  const routeKey = isAppRoute ? 'app-layout' : location.pathname;

  const lazyLoad = (Component: React.ComponentType) => (
    <Suspense fallback={<LoadingFallback />}>
      <Component />
    </Suspense>
  );

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={routeKey}>
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition>{lazyLoad(LoginPage)}</PageTransition>} />
        <Route path="/register" element={<PageTransition>{lazyLoad(RegisterPage)}</PageTransition>} />
        <Route path="/privacy" element={<PageTransition><LegalPage title="Privacy Policy" /></PageTransition>} />
        <Route path="/terms" element={<PageTransition><LegalPage title="Terms of Service" /></PageTransition>} />
        <Route path="/cookies" element={<PageTransition><LegalPage title="Cookie Policy" /></PageTransition>} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={lazyLoad(Dashboard)} />
            <Route path="/generator" element={lazyLoad(Generator)} />
            <Route path="/history" element={lazyLoad(History)} />
            <Route path="/settings" element={lazyLoad(Settings)} />
            <Route path="/analytics" element={lazyLoad(Analytics)} />
            <Route path="/analyze/:id" element={lazyLoad(Analyzer)} />
          </Route>
        </Route>
        
        {/* Catch-all 404 Route */}
        <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};
