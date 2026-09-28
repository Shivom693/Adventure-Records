import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Disc, Menu, X, ShieldAlert, LayoutDashboard, LogOut } from 'lucide-react';
import logoImg from '../assets/logo.png';
import BrandLogo from './BrandLogo';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const checkAuth = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener('auth-change', checkAuth);
    return () => {
      window.removeEventListener('auth-change', checkAuth);
    };
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.dispatchEvent(new Event('auth-change'));
    navigate('/');
  };

  // Center Navigation Links requested
  const navLinks = [
    { name: 'Distribution', path: '/distribution' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Artists', path: '/artists' },
    { name: 'Resources', path: '/resources' },
    { name: 'About', path: '/about' }
  ];

  const isActive = (path) => {
    if (path === '/distribution') {
      return location.pathname === '/distribution' || location.pathname === '/features';
    }
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 left-0 w-full z-50 bg-[#070709]/90 backdrop-blur-xl border-b border-white/10 transition-all duration-300" style={{ backgroundColor: 'var(--bg-nav)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* LEFT: Adventure Records Official Logo */}
          <BrandLogo variant="navbar" />

          {/* CENTER NAVIGATION: Distribution, Pricing, Artists, Resources, About */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`font-outfit text-sm font-medium tracking-wide transition-all duration-300 relative py-2 ${
                  isActive(link.path)
                    ? 'text-white font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                )}
              </Link>
            ))}
          </div>

          {/* RIGHT: Theme Toggle, Login & Get Started */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-3">
                {user.role === 'Admin' && (
                  <Link 
                    to="/admin" 
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold uppercase tracking-wider transition-all"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Admin
                  </Link>
                )}
                
                <Link 
                  to="/dashboard" 
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold uppercase tracking-wider transition-all"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-white text-black font-bold text-xs flex items-center justify-center uppercase">
                    {user.artistName ? user.artistName.charAt(0) : user.email.charAt(0)}
                  </div>
                  <span className="text-xs font-medium text-zinc-300 max-w-[100px] truncate">
                    {user.artistName || 'Artist'}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl border border-white/10 hover:border-red-500/40 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="font-outfit text-sm font-medium text-zinc-300 hover:text-white px-4 py-2 rounded-xl hover:bg-white/5 transition-all"
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

          {/* MOBILE: Theme Toggle & Hamburger Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            {user && (
              <Link 
                to="/dashboard" 
                className="p-2 rounded-xl border border-white/15 bg-white/5 text-white"
              >
                <LayoutDashboard className="w-4 h-4" />
              </Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-xl border border-white/10 text-zinc-300 hover:text-white hover:bg-white/5 transition-all focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE DRAWER MENU */}
      {isOpen && (
        <div className="md:hidden bg-[#070709]/98 backdrop-blur-2xl border-b border-white/10 animate-fade-in shadow-2xl">
          <div className="px-4 pt-3 pb-6 space-y-2">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-xl font-outfit text-base font-medium transition-all ${
                    isActive(link.path)
                      ? 'bg-white/10 text-white font-semibold border border-white/15'
                      : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10 space-y-3">
              {user ? (
                <>
                  {user.role === 'Admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-semibold"
                    >
                      <ShieldAlert className="w-5 h-5" />
                      Admin Control Panel
                    </Link>
                  )}
                  <div className="flex items-center gap-3 px-4 py-2 text-zinc-300">
                    <div className="w-8 h-8 rounded-full bg-white text-black font-bold flex items-center justify-center uppercase">
                      {user.artistName ? user.artistName.charAt(0) : user.email.charAt(0)}
                    </div>
                    <span className="text-sm font-medium truncate">
                      {user.artistName || user.email}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout Account
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block text-center px-4 py-3 rounded-xl border border-white/10 text-zinc-300 hover:text-white hover:bg-white/5 font-medium transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsOpen(false)}
                    className="block text-center px-4 py-3 rounded-xl bg-white text-black font-semibold shadow-lg transition-all"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
