import React from 'react';

const FloatingDisc = ({ size = 'md', delay = false }) => {
  const sizeClasses = {
    sm: 'w-24 h-24 border-[4px]',
    md: 'w-48 h-48 border-[6px]',
    lg: 'w-72 h-72 border-[8px]',
    xl: 'w-96 h-96 border-[10px]'
  };

  const glowColors = 'border-[#585589]/30 shadow-[0_0_30px_rgba(88,85,137,0.3)]';
  const animClass = delay ? 'animate-float-delayed' : 'animate-float';

  return (
    <div className={`relative ${animClass} select-none`}>
      {/* Outer Glowing Ring */}
      <div className={`rounded-full ${sizeClasses[size]} ${glowColors} flex items-center justify-center bg-[#070709] transition-transform duration-700 hover:scale-105`}>
        
        {/* Inner Record (Vinyl grooves) */}
        <div className="w-[90%] h-[90%] rounded-full bg-[#111] relative flex items-center justify-center vinyl-record animate-spin-slow shadow-inner">
          
          {/* Audio grooves details */}
          <div className="absolute inset-2 rounded-full border border-zinc-800/60 pointer-events-none" />
          <div className="absolute inset-6 rounded-full border border-zinc-800/40 pointer-events-none" />
          <div className="absolute inset-10 rounded-full border border-zinc-800/40 pointer-events-none" />
          
          {/* Record Label (Center) */}
          <div className="w-[35%] h-[35%] rounded-full bg-gradient-to-tr from-[#585589] via-[#53527D] to-[#DEDCFF] flex items-center justify-center p-1 border border-black shadow-[0_0_10px_rgba(0,0,0,0.8)]">
            
            {/* Core Spindle Hole */}
            <div className="w-[20%] h-[20%] rounded-full bg-black border border-zinc-700" />
          </div>
        </div>
      </div>
      
      {/* Holographic light reflection overlay */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none mix-blend-overlay rotate-45" />
    </div>
  );
};

export default FloatingDisc;
