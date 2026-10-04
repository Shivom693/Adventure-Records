import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Disc, Menu, X, ShieldAlert, LayoutDashboard, LogOut } from 'lucide-react';
import logoImg from '../assets/logo.png';
import BrandLogo from './BrandLogo';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
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
    <nav aria-label="Main Navigation" className="sticky top-0 left-0 w-full z-50 bg-[#0c0b1a]/92 backdrop-blur-xl border-b border-white/10 transition-all duration-300" style={{ backgroundColor: 'var(--bg-nav)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* LEFT: Adventure Records Official Logo */}
          <BrandLogo variant="navbar" />

          {/* CENTER NAVIGATION: Distribution, Pricing, Artists, Resources, About */}
          <div className="hidden md:flex items-center gap-8" role="menubar">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                role="menuitem"
                aria-current={isActive(link.path) ? 'page' : undefined}
                className={`font-outfit text-sm font-semibold tracking-wide transition-all duration-300 relative py-2 ${
                  isActive(link.path)
                    ? 'text-[#050315] font-extrabold'
                    : 'text-[#050315] hover:text-black/70'
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-black rounded-full shadow-sm" />
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
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-600 text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Admin
                  </Link>
                )}
                
                <Link 
                  to="/dashboard" 
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-black/20 bg-black text-white text-xs font-bold uppercase tracking-wider transition-all hover:bg-black/90"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-white" />
                  Dashboard
                </Link>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/5 border border-black/10">
                  <div className="w-6 h-6 rounded-full bg-black text-white font-bold text-xs flex items-center justify-center uppercase">
                    {user.artistName ? user.artistName.charAt(0) : user.email.charAt(0)}
                  </div>
                  <span className="text-xs font-semibold text-[#050315] max-w-[100px] truncate">
                    {user.artistName || 'Artist'}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl border border-black/10 hover:border-red-500/40 hover:bg-red-500/10 text-black hover:text-red-600 transition-all cursor-pointer"
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
                  className="font-outfit text-sm font-bold text-[#050315] hover:text-black px-4 py-2 rounded-xl hover:bg-black/5 transition-all"
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
                aria-label="User Dashboard"
                className="p-2 rounded-xl border border-black/20 bg-black/5 text-[#050315]"
              >
                <LayoutDashboard className="w-4 h-4" />
              </Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label="Toggle Mobile Navigation Menu"
              className="p-2.5 rounded-xl border border-black/15 text-[#050315] hover:bg-black/5 transition-all focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>


        </div>
      </div>

      {/* MOBILE DRAWER MENU */}
      {isOpen && (
        <div className="md:hidden bg-white backdrop-blur-2xl border-b border-black/15 animate-fade-in shadow-2xl">
          <div className="px-4 pt-3 pb-6 space-y-2">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-xl font-outfit text-base font-medium transition-all ${
                    isActive(link.path)
                      ? 'bg-black/10 text-[#050315] font-semibold border border-black/20'
                      : 'text-[#050315]/80 hover:bg-black/5 hover:text-[#050315]'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="pt-4 border-t border-black/15 space-y-3">
              {user ? (
                <>
                  {user.role === 'Admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 font-semibold"
                    >
                      <ShieldAlert className="w-5 h-5" />
                      Admin Control Panel
                    </Link>
                  )}
                  <div className="flex items-center gap-3 px-4 py-2 text-[#050315]">
                    <div className="w-8 h-8 rounded-full bg-black text-white font-bold flex items-center justify-center uppercase">
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
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 font-medium text-left"
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
                    className="block text-center px-4 py-3 rounded-xl border border-black/15 text-[#050315] hover:bg-black/5 font-medium transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsOpen(false)}
                    className="block text-center px-4 py-3 rounded-xl bg-black text-white font-semibold shadow-lg transition-all"
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
