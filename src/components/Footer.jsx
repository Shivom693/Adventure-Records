import React from 'react';
import { Link } from 'react-router-dom';
import { Disc, Share2, Globe, Video, Radio, Music, ShieldCheck } from 'lucide-react';
import BrandLogo from './BrandLogo';

const Footer = () => {

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative bg-white border-t border-black/15 pt-20 pb-12 z-10 overflow-hidden font-outfit" style={{ backgroundColor: 'var(--bg-footer)' }}>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 5-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-1 space-y-4">
            <BrandLogo variant="footer" onClick={scrollToTop} />
            <p className="text-[#050315]/80 text-xs leading-relaxed">
              A modern music distribution platform helping independent artists and labels release, manage, and monetize their music globally.
            </p>
          </div>

          {/* Column 2: Distribution */}
          <div className="space-y-4">
            <h4 className="font-heading text-xs font-bold text-[#050315] tracking-widest uppercase">
              Distribution
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/#how-it-works" onClick={() => scrollToSection('how-it-works')} className="text-[#050315]/80 hover:text-black transition-colors">How It Works</Link></li>
              <li><Link to="/pricing" onClick={scrollToTop} className="text-[#050315]/80 hover:text-black transition-colors">Pricing</Link></li>
              <li><Link to="/distribution" onClick={scrollToTop} className="text-[#050315]/80 hover:text-black transition-colors">Distribution Network</Link></li>
              <li><Link to="/artists" onClick={scrollToTop} className="text-[#050315]/80 hover:text-black transition-colors">Artists</Link></li>
              <li><Link to="/labels" onClick={scrollToTop} className="text-[#050315]/80 hover:text-black transition-colors">Labels</Link></li>
            </ul>
          </div>

          {/* Column 3: Resources & Guides */}
          <div className="space-y-4">
            <h4 className="font-heading text-xs font-bold text-[#050315] tracking-widest uppercase">
              Resources & Guides
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/free-music-distribution" onClick={scrollToTop} className="text-[#050315]/80 hover:text-black transition-colors">Free Distribution Guide</Link></li>
              <li><Link to="/music-distribution" onClick={scrollToTop} className="text-[#050315]/80 hover:text-black transition-colors">Music Distribution</Link></li>
              <li><Link to="/music-distribution-for-artists" onClick={scrollToTop} className="text-[#050315]/80 hover:text-black transition-colors">Artist Guide</Link></li>
              <li><Link to="/music-distribution-india" onClick={scrollToTop} className="text-[#050315]/80 hover:text-black transition-colors">Distribution India</Link></li>
              <li><Link to="/isrc" onClick={scrollToTop} className="text-[#050315]/80 hover:text-black transition-colors">ISRC Code Guide</Link></li>
              <li><Link to="/upc" onClick={scrollToTop} className="text-[#050315]/80 hover:text-black transition-colors">UPC Barcode Guide</Link></li>
              <li><Link to="/copyright" onClick={scrollToTop} className="text-[#050315]/80 hover:text-black transition-colors">Copyright & Ownership</Link></li>
            </ul>
          </div>

          {/* Column 4: Company */}
          <div className="space-y-4">
            <h4 className="font-heading text-xs font-bold text-[#050315] tracking-widest uppercase">
              Company
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/about" onClick={scrollToTop} className="text-[#050315]/80 hover:text-black transition-colors">About Us</Link></li>
              <li><Link to="/contact" onClick={scrollToTop} className="text-[#050315]/80 hover:text-black transition-colors">Contact</Link></li>
              <li><Link to="/admin-login" onClick={scrollToTop} className="text-red-600 hover:text-red-700 font-bold transition-colors">Admin Console</Link></li>
            </ul>
          </div>

          {/* Column 5: Legal */}
          <div className="space-y-4">
            <h4 className="font-heading text-xs font-bold text-[#050315] tracking-widest uppercase">
              Legal & Compliance
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/terms-of-use" onClick={scrollToTop} className="text-[#050315]/80 hover:text-black transition-colors">Terms of Use</Link></li>
              <li><Link to="/privacy-policy" onClick={scrollToTop} className="text-[#050315]/80 hover:text-black transition-colors">Privacy Policy</Link></li>
              <li><Link to="/copyright-policy" onClick={scrollToTop} className="text-[#050315]/80 hover:text-black transition-colors">Copyright Policy</Link></li>
              <li><Link to="/refund-policy" onClick={scrollToTop} className="text-[#050315]/80 hover:text-black transition-colors">Refund Policy</Link></li>
              <li><Link to="/content-policy" onClick={scrollToTop} className="text-[#050315]/80 hover:text-black transition-colors">Content Policy</Link></li>
              <li><Link to="/privacy-policy" onClick={scrollToTop} className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 inline shrink-0 text-emerald-600" /> DPDP Act 2023 Compliance</Link></li>
            </ul>
          </div>

        </div>

        {/* DPDP Act 2023 Compliance Section */}
        <div className="mb-12 p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 backdrop-blur-sm shadow-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> DPDP Act 2023 Compliant
                </span>
                <span className="text-xs text-[#050315]/80 font-medium">Digital Personal Data Protection Act, India</span>
              </div>
              <h3 className="text-sm font-bold text-[#050315] tracking-wide">
                Your Data Protection & Digital Rights Guaranteed
              </h3>
              <p className="text-xs text-[#050315]/80 leading-relaxed">
                Adventure Records strictly complies with India's DPDP Act, 2023. You have full rights as a Data Principal to access, correct, erase your data, or revoke consent at any time. For privacy queries or Data Protection Officer contact: <a href="mailto:adventureof693@gmail.com" className="text-[#050315] hover:underline font-bold">adventureof693@gmail.com</a>.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link 
                to="/privacy-policy" 
                onClick={scrollToTop} 
                className="px-4 py-2 text-xs font-semibold text-white bg-black hover:bg-black/80 border border-black rounded-xl transition-all shadow-md flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Read Data Rights Policy
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Strip: Copyright & Social Icons */}
        <div className="border-t border-black/15 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#050315]/70">

          <p>© 2026 Adventure Records. All rights reserved.</p>
          
          <div className="flex items-center gap-3">
            <a 
              href="https://www.instagram.com/adventurerecods693/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 rounded-xl bg-black/5 border border-black/15 hover:border-black hover:bg-black/10 text-[#050315] transition-all" 
              title="Instagram" 
              aria-label="Instagram"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a 
              href="https://www.youtube.com/@AdventureRecord693" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 rounded-xl bg-black/5 border border-black/15 hover:border-black hover:bg-black/10 text-[#050315] transition-all" 
              title="YouTube" 
              aria-label="YouTube"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a 
              href="https://x.com/51274Shivom" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 rounded-xl bg-black/5 border border-black/15 hover:border-black hover:bg-black/10 text-[#050315] transition-all" 
              title="X (Twitter)" 
              aria-label="X (Twitter)"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a 
              href="https://www.linkedin.com/in/shiv-om-tripathi-4219ba414/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 rounded-xl bg-black/5 border border-black/15 hover:border-black hover:bg-black/10 text-[#050315] transition-all" 
              title="LinkedIn" 
              aria-label="LinkedIn"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.64a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26z"/>
              </svg>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
