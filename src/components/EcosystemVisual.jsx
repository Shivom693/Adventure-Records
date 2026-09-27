import React from 'react';
import { motion } from 'framer-motion';
import { Disc, Music, Play, Radio, Share2, Video, Globe, Zap, Sparkles } from 'lucide-react';

const platformNodes = [
  {
    name: 'Spotify',
    sub: 'Stream & Playlists',
    icon: <Radio className="w-4 h-4 text-emerald-400" />,
    color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]',
    pos: 'top-0 left-1/2 -translate-x-1/2 -translate-y-4 sm:-translate-y-6'
  },
  {
    name: 'Apple Music',
    sub: 'Lossless Audio',
    icon: <Music className="w-4 h-4 text-pink-400" />,
    color: 'border-pink-500/30 bg-pink-500/10 text-pink-300',
    glow: 'shadow-[0_0_20px_rgba(236,72,153,0.2)]',
    pos: 'top-[18%] right-[2%] sm:right-[5%]'
  },
  {
    name: 'YouTube Music',
    sub: 'Official Artist Channel',
    icon: <Play className="w-4 h-4 text-red-400" />,
    color: 'border-red-500/30 bg-red-500/10 text-red-300',
    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.2)]',
    pos: 'bottom-[25%] right-[0%] sm:right-[2%]'
  },
  {
    name: 'Amazon Music',
    sub: 'HD Streaming',
    icon: <Zap className="w-4 h-4 text-cyan-400" />,
    color: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
    glow: 'shadow-[0_0_20px_rgba(6,182,212,0.2)]',
    pos: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-4 sm:translate-y-6'
  },
  {
    name: 'Instagram',
    sub: 'Audio Sync & Reels',
    icon: <Share2 className="w-4 h-4 text-purple-400" />,
    color: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.2)]',
    pos: 'bottom-[25%] left-[0%] sm:left-[2%]'
  },
  {
    name: 'TikTok',
    sub: 'Sounds & Viral Charts',
    icon: <Video className="w-4 h-4 text-indigo-400" />,
    color: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
    glow: 'shadow-[0_0_20px_rgba(99,102,241,0.2)]',
    pos: 'top-[18%] left-[2%] sm:left-[5%]'
  }
];

const EcosystemVisual = () => {
  return (
    <div className="relative w-full max-w-lg aspect-square flex items-center justify-center p-4 sm:p-8 select-none">
      
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/15 via-indigo-600/10 to-cyan-500/10 rounded-full blur-[70px] pointer-events-none" />

      {/* Orbit Rings */}
      <div className="absolute w-[82%] h-[82%] rounded-full border border-purple-500/15 animate-spin-slow" />
      <div className="absolute w-[58%] h-[58%] rounded-full border border-dashed border-indigo-500/20" />

      {/* SVG Connecting Pulse Beams */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <defs>
          <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        
        {/* Connecting spokes from center to 6 surrounding nodes */}
        <line x1="50%" y1="50%" x2="50%" y2="8%" stroke="url(#beamGrad)" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1="50%" y1="50%" x2="88%" y2="28%" stroke="url(#beamGrad)" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1="50%" y1="50%" x2="90%" y2="70%" stroke="url(#beamGrad)" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1="50%" y1="50%" x2="50%" y2="92%" stroke="url(#beamGrad)" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1="50%" y1="50%" x2="10%" y2="70%" stroke="url(#beamGrad)" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1="50%" y1="50%" x2="12%" y2="28%" stroke="url(#beamGrad)" strokeWidth="1.5" strokeDasharray="4 4" />
      </svg>

      {/* CENTER NODE: Adventure Records */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-20 flex flex-col items-center justify-center p-5 sm:p-6 rounded-3xl bg-[#0b0b12]/90 backdrop-blur-2xl border-2 border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.4)] text-center group"
      >
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-purple-400 p-[2px] flex items-center justify-center shadow-lg mb-2 group-hover:scale-105 transition-transform duration-300">
          <div className="w-full h-full bg-[#08080d] rounded-[14px] flex items-center justify-center">
            <Disc className="w-6 h-6 sm:w-7 sm:h-7 text-purple-400 animate-spin-slow" />
          </div>
        </div>
        <span className="font-heading font-black text-xs sm:text-sm text-white tracking-wider uppercase">
          Adventure Records
        </span>
        <span className="text-[9px] text-purple-300 font-semibold tracking-widest uppercase mt-0.5 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">
          Distribution Core
        </span>

        {/* Central Pulse Indicator */}
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-purple-500" />
        </span>
      </motion.div>

      {/* SATELLITE NODES: Spotify, Apple Music, YouTube Music, Amazon Music, Instagram, TikTok */}
      {platformNodes.map((platform, idx) => (
        <motion.div
          key={platform.name}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: idx * 0.08 }}
          className={`absolute z-10 flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl backdrop-blur-xl border ${platform.color} ${platform.glow} ${platform.pos} hover:scale-105 transition-all duration-300 cursor-default`}
        >
          <div className="p-1.5 rounded-xl bg-white/5 border border-white/10 shrink-0">
            {platform.icon}
          </div>
          <div className="flex flex-col text-left">
            <span className="font-heading font-bold text-xs text-white leading-tight">
              {platform.name}
            </span>
            <span className="text-[9px] text-zinc-400 font-medium">
              {platform.sub}
            </span>
          </div>
        </motion.div>
      ))}

      {/* SATELLITE NODE 7: Other Digital Platforms (Floating Bottom Pill) */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="absolute bottom-[-18px] sm:bottom-[-24px] z-30 flex items-center gap-2 px-4 py-2 rounded-full bg-[#0d0d15]/90 backdrop-blur-xl border border-white/15 text-white text-xs font-semibold shadow-xl hover:border-purple-500/40 transition-all"
      >
        <Globe className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
        <span>+ Other Digital Platforms (150+ Stores)</span>
      </motion.div>

    </div>
  );
};

export default EcosystemVisual;
