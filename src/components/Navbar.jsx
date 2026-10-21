import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Disc, ShieldAlert, LayoutDashboard, LogOut, X, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BrandLogo from './BrandLogo';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { name: 'Distribution', path: '/distribution' },
  { name: 'Pricing', path: '/pricing' },
  { name: 'Artists', path: '/artists' },
  { name: 'Resources', path: '/resources' },
  { name: 'About', path: '/about' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  /* ── Scroll-shrink detection ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Close drawer on route change ── */
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  /* ── Lock body scroll while drawer is open ── */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => {
    if (path === '/distribution') {
      return location.pathname === '/distribution' || location.pathname === '/features';
    }
    return location.pathname === path;
  };

  /* ── Drawer animation variants ── */
  const drawerVariants = {
    hidden:  { x: '100%', opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 320, damping: 32 } },
    exit:    { x: '100%', opacity: 0, transition: { duration: 0.22, ease: 'easeIn' } },
  };

  const backdropVariants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit:    { opacity: 0, transition: { duration: 0.2 } },
  };

  const linkItemVariants = {
    hidden:  { opacity: 0, x: 30 },
    visible: (i) => ({
      opacity: 1, x: 0,
      transition: { delay: 0.06 + i * 0.055, type: 'spring', stiffness: 280, damping: 28 }
    }),
  };

  return (
    <>
      {/* ── Main Nav Bar ── */}
      <motion.nav
        aria-label="Main Navigation"
        animate={{
          height: scrolled ? 64 : 80,
          boxShadow: scrolled ? '0 2px 24px rgba(0,0,0,0.10)' : '0 0px 0px rgba(0,0,0,0)',
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="sticky top-0 left-0 w-full z-50 backdrop-blur-xl border-b border-black/10 dark:border-white/10"
        style={{ backgroundColor: 'var(--bg-nav)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">

          {/* LEFT: Logo */}
          <BrandLogo variant="navbar" />

          {/* CENTER: Desktop nav links */}
          <div className="hidden md:flex items-center gap-6" role="menubar">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  role="menuitem"
                  aria-current={active ? 'page' : undefined}
                  className="relative py-1.5 font-outfit text-sm font-semibold tracking-wide transition-colors duration-200 text-[#050315] dark:text-white hover:text-black/70 dark:hover:text-white/70 group"
                >
                  {link.name}

                  {/* Animated active underline */}
                  <motion.span
                    className="absolute bottom-0 left-0 h-[2.5px] bg-black dark:bg-white rounded-full"
                    initial={false}
                    animate={{ width: active ? '100%' : '0%', opacity: active ? 1 : 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  />

                  {/* Hover underline (only when not active) */}
                  {!active && (
                    <span className="absolute bottom-0 left-0 h-[2px] bg-black/30 dark:bg-white/30 rounded-full w-0 group-hover:w-full transition-all duration-250" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* RIGHT: Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-2.5">
                {user.role === 'Admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-600 text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Admin
                  </Link>
                )}

                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-black/20 dark:border-white/15 bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider transition-all hover:opacity-90"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                  <div className="w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-xs flex items-center justify-center uppercase">
                    {user.artistName ? user.artistName.charAt(0) : user.email.charAt(0)}
                  </div>
                  <span className="text-xs font-semibold text-[#050315] dark:text-white max-w-[100px] truncate">
                    {user.artistName || 'Artist'}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl border border-black/10 dark:border-white/10 hover:border-red-500/40 hover:bg-red-500/10 text-black dark:text-white hover:text-red-600 transition-all cursor-pointer"
                  title="Logout Account"
                  aria-label="Logout Account"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="font-outfit text-sm font-bold text-[#050315] dark:text-white hover:text-black/70 dark:hover:text-white/70 px-4 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary font-outfit text-sm px-5 py-2.5 rounded-xl shadow-lg transition-all duration-300"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* MOBILE: Theme + Dashboard shortcut + Hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            {user && (
              <Link
                to="/dashboard"
                aria-label="User Dashboard"
                className="p-2 rounded-xl border border-black/20 dark:border-white/20 bg-black/5 dark:bg-white/5 text-[#050315] dark:text-white"
              >
                <LayoutDashboard className="w-4 h-4" />
              </Link>
            )}
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label="Toggle Mobile Navigation Menu"
              className="p-2.5 rounded-xl border border-black/15 dark:border-white/15 text-[#050315] dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all focus:outline-none"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isOpen ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* ── Mobile Drawer Portal ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Blur backdrop */}
            <motion.div
              key="drawer-backdrop"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer panel (slides in from right) */}
            <motion.aside
              key="drawer-panel"
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 right-0 bottom-0 z-50 w-[80vw] max-w-[320px] md:hidden flex flex-col"
              style={{
                background: 'var(--bg-nav)',
                borderLeft: '1px solid var(--border-default)',
                boxShadow: '-12px 0 48px rgba(0,0,0,0.18)',
              }}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation Menu"
            >
              {/* Drawer header */}
              <div
                className="flex items-center justify-between px-5 py-4 shrink-0"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
              >
                <BrandLogo variant="navbar" />
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => setIsOpen(false)}
                  aria-label="Close Navigation Menu"
                  className="p-2 rounded-xl border border-black/10 dark:border-white/10 text-[#050315] dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Nav links */}
              <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
                {navLinks.map((link, i) => {
                  const active = isActive(link.path);
                  return (
                    <motion.div
                      key={link.name}
                      custom={i}
                      variants={linkItemVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <Link
                        to={link.path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center justify-between px-4 py-3.5 rounded-2xl font-outfit text-base font-semibold transition-all duration-200 ${
                          active
                            ? 'bg-black dark:bg-white text-white dark:text-black shadow-md'
                            : 'text-[#050315] dark:text-white hover:bg-black/5 dark:hover:bg-white/8'
                        }`}
                      >
                        <span>{link.name}</span>
                        {active && (
                          <motion.span
                            layoutId="mobile-active-dot"
                            className="w-2 h-2 rounded-full bg-white dark:bg-black"
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Drawer footer: auth actions */}
              <div
                className="px-4 pb-8 pt-4 space-y-3 shrink-0"
                style={{ borderTop: '1px solid var(--border-subtle)' }}
              >
                {user ? (
                  <>
                    {user.role === 'Admin' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                      >
                        <Link
                          to="/admin"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 font-semibold w-full"
                        >
                          <ShieldAlert className="w-4 h-4" />
                          Admin Control Panel
                        </Link>
                      </motion.div>
                    )}

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.38 }}
                      className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-black/5 dark:bg-white/5"
                    >
                      <div className="w-9 h-9 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold flex items-center justify-center uppercase text-sm">
                        {user.artistName ? user.artistName.charAt(0) : user.email.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#050315] dark:text-white truncate">
                          {user.artistName || 'Artist'}
                        </p>
                        <p className="text-[11px] text-[#050315]/60 dark:text-white/50 truncate">{user.email}</p>
                      </div>
                    </motion.div>

                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.41 }}
                      onClick={() => { setIsOpen(false); handleLogout(); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 font-medium transition-all hover:bg-red-500/20"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout Account
                    </motion.button>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="grid grid-cols-2 gap-3"
                  >
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="block text-center px-4 py-3 rounded-2xl border border-black/15 dark:border-white/15 text-[#050315] dark:text-white hover:bg-black/5 dark:hover:bg-white/5 font-semibold transition-all text-sm"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsOpen(false)}
                      className="block text-center px-4 py-3 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-bold shadow-lg transition-all hover:opacity-90 text-sm"
                    >
                      Get Started
                    </Link>
                  </motion.div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
