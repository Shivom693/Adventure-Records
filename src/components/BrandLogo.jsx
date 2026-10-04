import React from 'react';
import { Link } from 'react-router-dom';

const BrandLogo = ({ variant = 'navbar', showText = true, className = '', onClick }) => {
  const isAuth = variant === 'auth';

  return (
    <Link 
      to="/" 
      onClick={onClick} 
      className={`inline-flex items-center group shrink-0 select-none ${className}`}
    >
      <div className="flex flex-col text-left">
        <span className={`font-heading font-black tracking-tight text-[#050315] dark:text-white transition-colors ${isAuth ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
          ADVENTURE <span className="text-[#050315] dark:text-white">RECORDS</span>
        </span>
        <span className={`font-semibold tracking-widest text-[#050315]/80 dark:text-white/80 uppercase -mt-1 ${isAuth ? 'text-[11px]' : 'text-[9px]'}`}>
          Music Distribution
        </span>
      </div>
    </Link>
  );
};

export default BrandLogo;
