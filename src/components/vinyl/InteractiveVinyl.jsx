import React, { useState, useEffect } from 'react';
import { Sparkles, Keyboard, MousePointer, Pause, Play, Palette } from 'lucide-react';
import VinylScene from './VinylScene';
import { VINYL_COLORS } from './vinylTexture';

const InteractiveVinyl = () => {
  const [isPaused, setIsPaused] = useState(false);
  const [activeColor, setActiveColor] = useState(VINYL_COLORS[0]);

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
      
      {/* Subtle Studio Lighting (Soft Radial Shadow behind Vinyl Container) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] sm:w-[460px] sm:h-[460px] bg-black/[0.04] rounded-full blur-[120px] pointer-events-none" />

      {/* PLAYER CONTAINER WITH WHITE BACKGROUND (LOCKED TO WHITE IN BOTH LIGHT AND DARK MODE) */}
      <div className="vinyl-player-card relative w-full rounded-3xl bg-white text-[#050315] border border-black/15 shadow-[0_25px_60px_rgba(0,0,0,0.12)] backdrop-blur-xl overflow-hidden group">
        
        {/* TOP CONTROL PILLS */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto gap-2">
          {/* Badge: Interactive 3D Vinyl */}
          <div className="vinyl-badge-dark flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#050315] border border-black/20 text-white text-xs font-semibold shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-white">Interactive 3D Vinyl</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Active Theme Badge */}
            <div className="vinyl-badge-dark hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#050315] border border-black/20 text-white text-xs font-semibold shadow-md transition-all">
              <span
                className="w-2.5 h-2.5 rounded-full border border-white/40 transition-colors duration-300"
                style={{ backgroundColor: activeColor.hex }}
              />
              <span className="text-zinc-200">{activeColor.name}</span>
            </div>

            {/* Button: Pause/Resume Spin */}
            <button
              type="button"
              onClick={() => setIsPaused(prev => !prev)}
              className="vinyl-badge-dark flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#050315] hover:bg-black border border-black/20 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-white" /> : <Pause className="w-3.5 h-3.5 text-white" />}
              <span>{isPaused ? 'Resume Spin' : 'Pause Spin'}</span>
            </button>
          </div>
        </div>

        {/* 3D Scene Component */}
        <VinylScene
          isPaused={isPaused}
          onColorChange={(color) => setActiveColor(color)}
        />

        {/* BOTTOM CONTROL BAR */}
        <div className="vinyl-badge-dark absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 text-[11px] text-white px-4 py-2.5 rounded-xl bg-[#050315]/95 border border-black/20 shadow-lg backdrop-blur-md">
          <span className="flex items-center gap-2 text-white font-medium">
            <Palette className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-white font-semibold">Tap vinyl to change color</span>
            <span
              className="inline-block w-2.5 h-2.5 rounded-full border border-white/40 ml-0.5 transition-colors duration-300"
              style={{ backgroundColor: activeColor.hex }}
            />
            <span className="text-zinc-300 font-normal">({activeColor.name})</span>
          </span>
          <span className="flex items-center gap-3 text-white/90 font-medium">
            <span className="flex items-center gap-1.5">
              <MousePointer className="w-3.5 h-3.5 text-white shrink-0" /> Drag to Rotate
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5 text-white shrink-0" /> Space to Pause
            </span>
          </span>
        </div>

      </div>
    </div>
  );
};

export default InteractiveVinyl;

