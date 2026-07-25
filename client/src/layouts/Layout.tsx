import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FilePenLine, History, Settings, LogOut, Sun, Moon, Menu, X, BarChart3, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Tooltip } from '@/components/motion/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useSidebar } from '@/context/SidebarContext';
import { motion, AnimatePresence } from 'motion/react';
import { EASE_OUT } from '@/lib/ease';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { to: '/generator', icon: FilePenLine, labelKey: 'nav.generator' },
  { to: '/history', icon: History, labelKey: 'nav.history' },
  { to: '/analytics', icon: BarChart3, labelKey: 'nav.analytics' },
  { to: '/settings', icon: Settings, labelKey: 'nav.settings' },
];

const pageMeta: Record<string, { titleKey: string; subtitleKey: string }> = {
  '/dashboard': { titleKey: 'nav.dashboard', subtitleKey: 'pageSubtitles.dashboard' },
  '/generator': { titleKey: 'nav.generator', subtitleKey: 'pageSubtitles.generator' },
  '/history': { titleKey: 'nav.history', subtitleKey: 'pageSubtitles.history' },
  '/analytics': { titleKey: 'nav.analytics', subtitleKey: 'pageSubtitles.analytics' },
  '/settings': { titleKey: 'nav.settings', subtitleKey: 'pageSubtitles.settings' },
};

const useResolvedTheme = () => {
  const { theme } = useTheme();
  if (theme !== 'system') return theme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const Layout = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { toggleTheme } = useTheme();
  const resolvedTheme = useResolvedTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await logout();
    navigate('/');
  };

  useEffect(() => {
    if (!isProfileOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  const currentPage = pageMeta[location.pathname] || pageMeta['/dashboard'];
  const logoSrc = resolvedTheme === 'dark' ? '/logo/brandLogo_white.png' : '/logo/brandLogo_black.png';

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* ===== Desktop Sidebar ===== */}
      <nav
        className={`
          hidden md:flex flex-col shrink-0
          bg-sidebar border-r border-sidebar-border
          transition-[width] duration-200 ease-in-out
          ${isCollapsed ? 'w-16' : 'w-60'}
        `}
      >
        {/* Logo + Collapse Toggle */}
        <div className="flex items-center h-14 px-3 border-b border-sidebar-border shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden flex-1 min-w-0">
            <img src={logoSrc} alt="ContractChill" className="w-9 h-9 rounded-xl shrink-0 object-contain" />
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="font-display font-bold text-sm text-sidebar-foreground whitespace-nowrap overflow-hidden"
                >
                  ContractChill
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center size-8 rounded-lg shrink-0 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
          >
            {isCollapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          </button>
        </div>

        {/* Nav Items */}
        <div className="flex-1 flex flex-col gap-1 p-2 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, labelKey }) => {
            const label = t(labelKey);
            return (
              <Tooltip key={to} content={isCollapsed ? label : undefined} side="right">
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl transition-colors ${
                      isCollapsed ? 'justify-center size-10' : 'px-3 py-2.5'
                    } ${
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                    }`
                  }
                >
                  <Icon className="size-5 shrink-0" />
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.15 }}
                        className="text-sm font-medium whitespace-nowrap overflow-hidden"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </NavLink>
              </Tooltip>
            );
          })}
        </div>
      </nav>

      {/* ===== Mobile Header ===== */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center h-14 px-4 border-b border-border bg-surface">
        <div className="flex items-center gap-2.5 flex-1">
          <img src={logoSrc} alt="ContractChill" className="w-9 h-9 rounded-xl shrink-0 object-contain" />
          <span className="font-display font-bold text-sm text-foreground">ContractChill</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center justify-center size-10 rounded-xl text-foreground/60 hover:text-foreground hover:bg-accent/50 transition-colors"
        >
          {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* ===== Mobile Menu ===== */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed top-14 left-0 right-0 z-30 border-b border-border bg-surface shadow-lg"
          >
            <div className="flex flex-col gap-1 p-3">
              {navItems.map(({ to, icon: Icon, labelKey }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-foreground/60 hover:text-foreground hover:bg-accent/50'
                    }`
                  }
                >
                  <Icon className="size-5 shrink-0" />
                  <span className="text-sm font-medium">{t(labelKey)}</span>
                </NavLink>
              ))}

              <div className="border-t border-border my-1" />

              <div className="px-3 py-2">
                <LanguageSwitcher variant="default" />
              </div>

              <button
                onClick={() => { toggleTheme(); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-foreground/60 hover:text-foreground hover:bg-accent/50"
              >
                {resolvedTheme === 'dark' ? <Sun className="size-5 shrink-0" /> : <Moon className="size-5 shrink-0" />}
                <span className="text-sm font-medium">{resolvedTheme === 'dark' ? t('common.lightMode') : t('common.darkMode')}</span>
              </button>

              <button
                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-foreground/60 hover:text-red-500 hover:bg-red-500/10"
              >
                <LogOut className="size-5 shrink-0" />
                <span className="text-sm font-medium">{t('common.signOut')}</span>
              </button>

              <div className="flex items-center gap-2.5 px-3 py-2">
                <Avatar className="size-8 shrink-0">
                  <AvatarImage src={user?.photoURL || undefined} />
                  <AvatarFallback className="text-xs bg-accent text-foreground/60">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-foreground truncate leading-none mb-0.5">{user?.displayName}</p>
                  <p className="text-[11px] text-foreground/50 truncate leading-none">{user?.email}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Main Content Column ===== */}
      <div className="flex flex-col flex-1 min-w-0 pt-14 md:pt-0">
        {/* Desktop Navbar Header */}
        <header className="hidden md:flex items-center h-14 px-6 border-b border-border bg-background shrink-0">
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground leading-none">{t(currentPage.titleKey)}</h1>
            <p className="text-xs text-foreground/50 mt-0.5">{t(currentPage.subtitleKey)}</p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher variant="compact" />

            <Tooltip content={resolvedTheme === 'dark' ? t('common.lightMode') : t('common.darkMode')} side="bottom">
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center size-9 rounded-lg text-foreground/60 hover:text-foreground hover:bg-accent/50 transition-colors"
              >
                {resolvedTheme === 'dark' ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
              </button>
            </Tooltip>

            {/* Profile Dropdown */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center justify-center size-9 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <Avatar className="size-7 shrink-0">
                  <AvatarImage src={user?.photoURL || undefined} />
                  <AvatarFallback className="text-xs bg-accent text-foreground/60">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15, ease: EASE_OUT }}
                    className="absolute right-0 top-full mt-2 w-56 z-50 bg-surface/95 backdrop-blur-xl border border-border rounded-xl shadow-lg py-1"
                  >
                    <div className="px-3 py-2.5">
                      <p className="text-sm font-semibold text-foreground truncate leading-none">{user?.displayName}</p>
                      <p className="text-[11px] text-foreground/50 truncate leading-none mt-1">{user?.email}</p>
                    </div>
                    <div className="border-t border-border mx-2" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-foreground/60 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="size-4 shrink-0" />
                      <span>{t('common.signOut')}</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden bg-background p-4 sm:p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
