import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Shield, Activity, Share2, Sparkles, Check, ArrowRight, Zap } from 'lucide-react';

const features = [
  {
    icon: <Globe className="w-8 h-8 text-[#585589]" />,
    title: "Worldwide Ingestion",
    description: "Submit once and reach 150+ music services globally. Your tracks are delivered directly to Spotify, Apple Music, Tidal, Amazon, and domestic outlets such as JioSaavn and Wynk.",
    highlights: ["Delivery in 24-48 Hours", "JioSaavn & Wynk Included", "TikTok & Instagram Feeds"]
  },
  {
    icon: <Activity className="w-8 h-8 text-[#585589]" />,
    title: "Live Analytical Console",
    description: "Receive daily stream statistics, demographic breakdowns, listener ages, and country performance. Don't wait months for CSV logs; view stats in near real-time.",
    highlights: ["Daily Stream Logs", "Geographic Breakdowns", "Playlist Placement Alerts"]
  },
  {
    icon: <Sparkles className="w-8 h-8 text-[#585589]" />,
    title: "AI Audio Mastering",
    description: "Prepare your tracks for streaming platforms automatically. Our integrated AI mastering engine matches loudness to LUFS standard specs for Spotify and Apple Music.",
    highlights: ["LUFS Loudness Matching", "Audio Quality Check", "Format Conversion (WAV/MP3)"]
  },
  {
    icon: <Share2 className="w-8 h-8 text-[#585589]" />,
    title: "Collaborator Split Shares",
    description: "Automatically split royalties and earnings with producers, featured artists, and writers. We pay them directly, so you don't have to manually execute transfers.",
    highlights: ["Direct Payout Splits", "Writers Credit Registry", "Simple Artist Signups"]
  },
  {
    icon: <Shield className="w-8 h-8 text-[#585589]" />,
    title: "Official Content ID Protection",
    description: "Claim monetization royalties from user-uploaded videos containing your tracks. Register for YouTube Content ID, TikTok audio tracking, and Facebook Rights Manager.",
    highlights: ["YouTube Content ID Claims", "TikTok Audio Protection", "Copyright Registry Safeguard"]
  }
];

const pipeline = [
  { name: 'Spotify Catalog Ingestion',  status: 'Distributed',    progress: 100, color: '#8b5cf6' },
  { name: 'Apple Music Audio Sync',      status: 'Distributed',    progress: 100, color: '#8b5cf6' },
  { name: 'YouTube Content ID Matching', status: 'Processing',     progress: 65,  color: '#60a5fa' },
  { name: 'JioSaavn / Wynk Audio Feed',  status: 'Pending Review', progress: 20,  color: '#a78bfa' },
];

const Features = () => {
  return (
    <div className="relative pt-20 overflow-x-hidden min-h-screen">

      {/* ── Hero Header ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 text-center space-y-4">
        <div className="minimal-badge mx-auto">Platform Capabilities</div>
        <h1 className="font-heading font-extrabold text-4xl sm:text-6xl tracking-tight" style={{ color: 'var(--text-heading)' }}>
          Enterprise Tools for <br />
          <span className="text-zinc-600 dark:text-[#DEDCFF]">Independent Music Creators</span>
        </h1>
        <p className="text-zinc-400 text-sm max-w-2xl mx-auto leading-relaxed">
          From independent recording artists to commercial labels, our infrastructure provides tools
          to ingest, protect, release, and profit from your music catalog.
        </p>
      </section>

      {/* ── Features Grid ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="glass-panel rounded-3xl p-8 hover:border-[#585589]/40 transition-all duration-500 hover:translate-y-[-5px] shadow-[0_4px_30px_rgba(0,0,0,0.4)] flex flex-col group"
            >
              {/* Icon */}
              <div className="p-3 rounded-2xl w-fit mb-6 border border-white/5 group-hover:border-[#585589]/40 transition-colors duration-300"
                style={{ background: 'rgba(255,255,255,0.05)' }}>
                {feat.icon}
              </div>

              {/* Title */}
              <h3 className="font-heading font-bold text-xl mb-4 group-hover:text-[#DEDCFF] transition-colors"
                style={{ color: '#ffffff' }}>
                {feat.title}
              </h3>

              {/* Description */}
              <p className="text-sm leading-relaxed mb-6 flex-grow" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {feat.description}
              </p>

              {/* Highlights */}
              <ul className="space-y-2.5 pt-6 mt-auto" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {feat.highlights.map((h, hIdx) => (
                  <li key={hIdx} className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    <Check className="w-4 h-4 shrink-0" style={{ color: '#DEDCFF' }} />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Deliver to Global Stores — Always-Dark Band ──────────────── */}
      <section
        className="dark-section-band relative py-20 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #05030f 0%, #0d0a1f 50%, #05030f 100%)',
          borderTop: '1px solid rgba(139,92,246,0.15)',
          borderBottom: '1px solid rgba(139,92,246,0.10)',
        }}
      >
        {/* Ambient glow blobs */}
        <div className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 55% 60% at 15% 50%, rgba(88,85,200,0.13) 0%, transparent 65%),' +
              'radial-gradient(ellipse 45% 55% at 85% 50%, rgba(60,30,180,0.09) 0%, transparent 65%)',
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          {/* Left — Copy */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
            className="space-y-6"
          >
            <h2 className="font-heading font-bold text-2xl sm:text-3xl" style={{ color: '#ffffff' }}>
              Deliver to Global Stores{' '}
              <span style={{
                background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Instantly
              </span>
            </h2>

            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
              When you submit a release on Adventure Records, our pipeline validates file audio encodes
              and formats metadata immediately. We issue verified UPC and ISRC identifiers for compliance,
              and ingest them directly to streaming platforms.
            </p>

            <div className="flex flex-col gap-3">
              {[
                { text: 'Compliant UPC and ISRC Codes Included',         accent: '#a78bfa' },
                { text: 'High Fidelity FLAC/WAV Encodes Upload',          accent: '#60a5fa' },
                { text: 'Direct Pitching to Spotify Playlist Curators',   accent: '#c4b5fd' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: 0.1 + idx * 0.1 }}
                  className="flex items-center gap-3 text-sm"
                  style={{ color: 'rgba(255,255,255,0.85)' }}
                >
                  <div
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: `${item.accent}20`, border: `1px solid ${item.accent}40` }}
                  >
                    <Check className="w-3 h-3" style={{ color: item.accent }} />
                  </div>
                  {item.text}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right — Live Pipeline Card */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.15 }}
            className="relative rounded-3xl p-8 overflow-hidden"
            style={{
              background: 'rgba(10,8,22,0.85)',
              border: '1px solid rgba(139,92,246,0.22)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              boxShadow:
                '0 0 50px rgba(99,60,180,0.18), 0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
              minHeight: '300px',
            }}
          >
            {/* Inner glow */}
            <div className="absolute inset-0 pointer-events-none rounded-3xl" style={{
              background:
                'radial-gradient(ellipse 70% 60% at 80% 20%, rgba(99,60,220,0.12) 0%, transparent 65%),' +
                'radial-gradient(ellipse 50% 50% at 20% 80%, rgba(56,139,253,0.08) 0%, transparent 65%)',
            }} />

            {/* Live badge */}
            <div className="absolute top-4 right-4 z-10">
              <span
                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{
                  background: 'rgba(139,92,246,0.18)',
                  border: '1px solid rgba(139,92,246,0.4)',
                  color: '#c4b5fd',
                  boxShadow: '0 0 12px rgba(139,92,246,0.2)',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Live Pipeline
              </span>
            </div>

            {/* Header */}
            <h4 className="relative z-10 font-heading text-xs font-semibold uppercase tracking-widest mb-6"
              style={{ color: 'rgba(255,255,255,0.4)' }}>
              Ingestion Status Simulation
            </h4>

            {/* Pipeline rows */}
            <div className="relative z-10 space-y-5">
              {pipeline.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: 0.3 + idx * 0.12 }}
                  className="space-y-1.5"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
                      {item.name}
                    </span>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: `${item.color}18`,
                        border: `1px solid ${item.color}35`,
                        color: item.color,
                      }}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.progress}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.1, delay: 0.4 + idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        background: `linear-gradient(90deg, ${item.color}99, ${item.color})`,
                        boxShadow: `0 0 10px ${item.color}66`,
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="relative z-10 mt-6 pt-5 flex items-center gap-2 text-[11px]"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' }}>
              <Zap className="w-3 h-3" style={{ color: '#a78bfa' }} />
              Updates every 60 seconds • All times in IST
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default Features;
