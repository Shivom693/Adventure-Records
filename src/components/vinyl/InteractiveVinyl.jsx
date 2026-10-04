import React, { useState, useEffect } from 'react';
import { Sparkles, Keyboard, MousePointer, Pause, Play } from 'lucide-react';
import VinylScene from './VinylScene';

const InteractiveVinyl = () => {
  const [isPaused, setIsPaused] = useState(false);

  // ----------------------------------------------------
  // KEYBOARD CONTROLS LISTENERS (Spacebar Pause/Play)
  // ----------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in form inputs
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPaused(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="vinyl-container relative w-full max-w-xl mx-auto flex flex-col items-center select-none font-outfit">
      
      {/* 6. Subtle Studio Lighting (Soft White/Grey Radial Glow behind Vinyl) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] sm:w-[460px] sm:h-[460px] bg-white/[0.04] rounded-full blur-[120px] pointer-events-none" />

      {/* 1. PLAYER CONTAINER: Sophisticated Charcoal #18181B, Rounded 3xl, Border rgba(255,255,255,0.12), Soft Shadow */}
      <div className="vinyl-container relative w-full rounded-3xl bg-[#18181B] border border-white/12 shadow-[0_25px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl overflow-hidden group">
        
        {/* 4. TOP CONTROL PILLS */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
          {/* Badge: Interactive 3D Vinyl */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black border border-white/15 text-white text-xs font-semibold shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span className="text-white">Interactive 3D Vinyl</span>
          </div>

          {/* Button: Pause/Resume Spin */}
          <button
            type="button"
            onClick={() => setIsPaused(prev => !prev)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black hover:bg-zinc-900 border border-white/15 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-white" /> : <Pause className="w-3.5 h-3.5 text-white" />}
            <span>{isPaused ? 'Resume Spin' : 'Pause Spin'}</span>
          </button>
        </div>

        {/* 3D Scene Component */}
        <VinylScene isPaused={isPaused} />

        {/* 5. BOTTOM CONTROL BAR: Background #050505, Text #FFFFFF, Icons #FFFFFF, Border rgba(255,255,255,0.12) */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between text-[11px] text-white px-4 py-2.5 rounded-xl bg-[#050505] border border-white/12 shadow-lg">
          <span className="flex items-center gap-2 text-white font-medium">
            <MousePointer className="w-3.5 h-3.5 text-white shrink-0" /> Drag to Rotate & Tilt 3D Disc
          </span>
          <span className="hidden sm:flex items-center gap-2 text-white/90 font-medium">
            <Keyboard className="w-3.5 h-3.5 text-white shrink-0" /> Space to Pause/Play
          </span>
        </div>

      </div>
    </div>
  );
};

export default InteractiveVinyl;
