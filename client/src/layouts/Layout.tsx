import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FilePenLine, History, Settings, LogOut, Sun, Moon, Menu, X } from 'lucide-react';
import { Tooltip } from '@/components/motion/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/generator', icon: FilePenLine, label: 'Generator' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const useResolvedTheme = () => {
  const { theme } = useTheme();
  if (theme !== 'system') return theme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const Layout = () => {
  const { user, logout } = useAuth();
  const { toggleTheme } = useTheme();
  const resolvedTheme = useResolvedTheme();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex w-16 flex-col items-center py-4 gap-2 border-r border-border bg-surface shrink-0">
        <div className="flex-1 flex flex-col items-center gap-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Tooltip key={to} content={label} side="right">
              <NavLink to={to} className={({ isActive }) =>
                `flex items-center justify-center size-10 rounded-xl transition-colors ${
                  isActive ? 'bg-surface-2 text-text' : 'text-text-muted hover:text-text hover:bg-surface-2'
                }`
              }>
                <Icon className="size-5" />
              </NavLink>
            </Tooltip>
          ))}
        </div>

        <div className="flex flex-col items-center gap-2 pb-4">
          <Tooltip content={resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'} side="right">
            <button onClick={toggleTheme} className="flex items-center justify-center size-10 rounded-xl text-text-muted hover:text-text hover:bg-surface-2 transition-colors">
              {resolvedTheme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </button>
          </Tooltip>
          <Tooltip content="Sign out" side="right">
            <button onClick={handleLogout} className="flex items-center justify-center size-10 rounded-xl text-text-muted hover:text-text hover:bg-surface-2 transition-colors">
              <LogOut className="size-5" />
            </button>
          </Tooltip>
          <Avatar className="size-8">
            <AvatarImage src={user?.photoURL || undefined} />
            <AvatarFallback className="text-xs bg-surface-2 text-text-muted">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </nav>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 border-b border-border bg-surface flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <img src="/logo/brandLogo_black.png" alt="ContractChill" className="size-6 rounded-md" />
          <span className="font-display font-bold text-sm text-text">ContractChill</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-lg text-text hover:bg-surface-2 transition-colors">
          {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 top-14 z-40 p-4 flex flex-col justify-between overflow-y-auto bg-surface"
            style={{ height: 'calc(100vh - 56px)' }}
          >
            <div className="flex flex-col gap-2">
              {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive ? 'bg-surface-2 text-text' : 'text-text-muted hover:text-text hover:bg-surface-2'
                    }`
                  }
                >
                  <Icon className="size-5" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>

            <div className="border-t border-border pt-4 pb-6 flex flex-col gap-4">
              <button
                onClick={() => { toggleTheme(); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
              >
                {resolvedTheme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
                <span>{resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
              </button>
              <button
                onClick={async () => {
                  setIsMobileMenuOpen(false);
                  await handleLogout();
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="size-5" />
                <span>Sign out</span>
              </button>
              <div className="flex items-center gap-3 px-1">
                <Avatar className="size-8">
                  <AvatarImage src={user?.photoURL || undefined} />
                  <AvatarFallback className="text-xs bg-surface-2 text-text-muted">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                  <p className="text-sm text-text font-bold truncate leading-none mb-1">{user?.displayName}</p>
                  <p className="text-xs text-text-muted truncate leading-none">{user?.email}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 min-w-0 w-0 flex flex-col md:ml-0">
        <div className="flex-1 w-full p-4 sm:p-6 md:p-10 pt-20 md:pt-10 overflow-y-auto overflow-x-hidden bg-background">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
