import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, History as HistoryIcon, Settings, LogOut, Shield, Menu, X, ChevronLeft, Wand2, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

export const Layout = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard' },
    { to: '/generator', icon: <Wand2 className="w-4 h-4" />, label: 'Generator' },
    { to: '/history', icon: <HistoryIcon className="w-4 h-4" />, label: 'History' },
    { to: '/settings', icon: <Settings className="w-4 h-4" />, label: 'Settings' },
  ];

  const isDark = theme === 'dark';

  return (
      <div className={`min-h-screen w-full flex transition-colors duration-300 overflow-hidden ${isDark ? 'bg-[#0b0b0d]' : 'bg-background'}`}>
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isCollapsed ? 80 : 240 }}
        className={`hidden md:flex border-r flex-col p-4 gap-6 fixed h-full z-20 transition-all duration-300 ease-out ${
          isDark ? 'bg-surface border-white/10' : 'bg-surface/80 border-border'
        }`}
      >
        {/* Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
           className={`absolute -right-3 top-10 size-6 border rounded-full flex items-center justify-center shadow-sm hover:border-primary transition-colors z-30 ${
            isDark ? 'bg-surface border-white/10' : 'bg-white border-slate-200'
          }`}
        >
          <ChevronLeft className={`w-3.5 h-3.5 text-text-subtle transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>

        <Link 
          to="/"
          id="tour-logo"
          className={`flex items-center gap-3 px-1 py-2 hover:opacity-80 transition-opacity ${isCollapsed ? 'justify-center' : ''}`}
          title="Back to Landing Page"
        >
          <img src="/logo.png" alt="Logo" className="size-8 rounded-xl shrink-0 shadow-sm" />
          {!isCollapsed && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-text font-display font-bold text-base truncate"
            >
              ContractChill
            </motion.span>
          )}
        </Link>

         {!isCollapsed && (
           <Link to="/analyzer" className="flex items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-medium text-white shadow-sm shadow-primary/20 transition hover:bg-primary-dark">
             <Plus className="size-4" />
             New analysis
           </Link>
         )}

         {/* Nav Links */}
        <nav className="flex-1 flex flex-col gap-1.5">
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`${location.pathname === item.to ? 'nav-link-active' : 'nav-link'} ${isCollapsed ? 'justify-center px-0' : ''}`}
              title={isCollapsed ? item.label : ''}
            >
              <div className="shrink-0">{item.icon}</div>
              {!isCollapsed && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="truncate"
                >
                  {item.label}
                </motion.span>
              )}
            </Link>
          ))}
        </nav>

        {/* User Profile + Logout */}
        <div className={`border-t pt-4 flex flex-col gap-4 ${isCollapsed ? 'items-center' : ''} ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
          <div className={`flex items-center gap-3 px-1 ${isCollapsed ? 'justify-center' : ''}`}>
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-border shrink-0 object-cover" />
            ) : (
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${
                isDark ? 'bg-surface-2 border-white/10' : 'bg-slate-100 border-slate-200'
              }`}>
                <Shield className="w-4 h-4 text-primary/40" />
              </div>
            )}
            {!isCollapsed && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="overflow-hidden"
              >
                <p className="text-sm text-text font-bold truncate leading-none mb-1">{user?.displayName?.split(' ')[0]}</p>
                <p className="text-[10px] text-text-subtle truncate leading-none">{user?.email}</p>
              </motion.div>
            )}
          </div>
          <button
            onClick={async () => {
              await logout();
              navigate('/');
            }}
            className={`nav-link text-red-500 hover:text-red-600 hover:bg-red-500/10 w-full ${isCollapsed ? 'justify-center px-0' : ''}`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Header */}
      <div className={`md:hidden fixed top-0 left-0 right-0 h-14 border-b flex items-center justify-between px-4 z-50 transition-all ${
        isDark ? 'bg-surface border-white/5' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="ContractChill Logo" className="w-6 h-6 rounded-md" />
          <span className="font-display font-bold text-sm text-text">ContractChill</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={`p-2 rounded-lg text-text transition-colors ${
          isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
        }`}>
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`md:hidden fixed inset-0 top-14 z-40 p-4 flex flex-col justify-between overflow-y-auto ${
              isDark ? 'bg-surface' : 'bg-white'
            }`}
            style={{ height: 'calc(100vh - 56px)' }}
          >
            {/* Nav Links */}
            <div className="flex flex-col gap-2">
              {navItems.map(item => (
                <Link key={item.to} to={item.to} onClick={() => setIsMobileMenuOpen(false)}
                  className={location.pathname === item.to ? 'nav-link-active' : 'nav-link'}
                >
                  {item.icon} <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* User Profile + Logout */}
            <div className={`border-t pt-4 pb-6 flex flex-col gap-4 ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
              <div className="flex items-center gap-3 px-1">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full border border-border shrink-0 object-cover" />
                ) : (
                  <div className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 ${
                    isDark ? 'bg-surface-2 border-white/10' : 'bg-slate-100 border-slate-200'
                  }`}>
                    <Shield className="w-5 h-5 text-primary/40" />
                  </div>
                )}
                <div className="overflow-hidden">
                  <p className="text-sm text-text font-bold truncate leading-none mb-1">{user?.displayName}</p>
                  <p className="text-xs text-text-subtle truncate leading-none">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={async () => {
                  setIsMobileMenuOpen(false);
                  await logout();
                  navigate('/');
                }}
                className="nav-link text-red-500 hover:text-red-600 hover:bg-red-500/10 w-full justify-start gap-2"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main 
         className={`flex-1 min-w-0 w-0 flex flex-col transition-[margin] duration-300 ease-out ml-0 ${isCollapsed ? 'md:ml-[80px]' : 'md:ml-[240px]'} ${isDark ? 'bg-[#0b0b0d]' : 'bg-background'}`}
      >
         <div className={`flex-1 w-full p-4 sm:p-6 md:p-10 pt-20 md:pt-10 overflow-y-auto overflow-x-hidden ${isDark ? 'bg-[#0b0b0d]' : 'bg-background'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="h-full w-full min-w-0"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
