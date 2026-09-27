import React, { useState, useEffect } from 'react';
import { Disc, Sparkles, Keyboard, MousePointer, Pause, Play } from 'lucide-react';
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
    <div className="relative w-full max-w-xl mx-auto flex flex-col items-center select-none font-outfit">
      
      {/* Glow Ambient Accent behind Vinyl */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] sm:w-[440px] sm:h-[440px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* 3D VINYL CANVAS SCENE CONTAINER */}
      <div className="relative w-full rounded-3xl bg-[#09090d]/80 border border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden group">
        
        {/* Top Status Bar */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Interactive 3D Vinyl</span>
          </div>

          <button
            type="button"
            onClick={() => setIsPaused(prev => !prev)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold backdrop-blur-md transition-all cursor-pointer"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-amber-400" /> : <Pause className="w-3.5 h-3.5 text-zinc-300" />}
            <span>{isPaused ? 'Resume Spin' : 'Pause Spin'}</span>
          </button>
        </div>

        {/* 3D Scene Component */}
        <VinylScene isPaused={isPaused} />

        {/* Bottom Bar: Interactive Hints (Mouse, Touch, Keyboard) */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between text-[11px] text-zinc-400 px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md">
          <span className="flex items-center gap-1.5 text-zinc-300">
            <MousePointer className="w-3.5 h-3.5 text-amber-400" /> Drag to Rotate & Tilt 3D Disc
          </span>
          <span className="hidden sm:flex items-center gap-1.5 text-zinc-400">
            <Keyboard className="w-3.5 h-3.5 text-amber-400" /> Space to Pause/Play
          </span>
        </div>

      </div>
    </div>
  );
};

export default InteractiveVinyl;
