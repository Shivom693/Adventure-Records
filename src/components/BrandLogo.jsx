import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Disc } from 'lucide-react';
import logoImg from '../assets/logo.png';

const BrandLogo = ({ variant = 'navbar', showText = true, className = '', onClick }) => {
  const [imgError, setImgError] = useState(false);

  const isAuth = variant === 'auth';
  const isFooter = variant === 'footer';

  const iconContainerSize = isAuth 
    ? 'p-2 rounded-2xl border border-white/20 shadow-[0_0_25px_rgba(234,179,8,0.2)] bg-gradient-to-b from-white/15 to-white/5' 
    : isFooter 
    ? 'p-2 rounded-2xl border border-white/15 bg-white/10' 
    : 'p-1.5 rounded-2xl border border-white/15 bg-white/10';

  const imgHeight = isAuth 
    ? 'h-14 sm:h-16' 
    : isFooter 
    ? 'h-10 sm:h-12' 
    : 'h-9 sm:h-11';

  return (
    <Link 
      to="/" 
      onClick={onClick} 
      className={`inline-flex items-center gap-3 group shrink-0 select-none ${className}`}
    >
      <div className={`relative backdrop-blur-md transition-all duration-300 group-hover:border-amber-400/50 group-hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] flex items-center justify-center ${iconContainerSize}`}>
        {!imgError ? (
          <img 
            src="/logo.png" 
            alt="Adventure Records Logo" 
            className={`${imgHeight} w-auto object-contain rounded-xl transition-transform duration-300 group-hover:scale-105`}
            onError={() => {
              // Try fallback to imported logo asset
              setImgError(true);
            }}
          />
        ) : (
          <div className="flex items-center justify-center p-1">
            <Disc className="w-8 h-8 text-amber-400 animate-spin-slow" />
          </div>
        )}
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <span className={`font-heading font-black tracking-tight text-white group-hover:text-amber-400 transition-colors flex items-center gap-1 ${isAuth ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'}`}>
            ADVENTURE <span className="text-amber-400">RECORDS</span>
          </span>
          <span className={`font-semibold tracking-widest text-zinc-400 uppercase -mt-1 ${isAuth ? 'text-[11px]' : 'text-[9px]'}`}>
            Music Distribution
          </span>
        </div>
      )}
    </Link>
  );
};

export default BrandLogo;
