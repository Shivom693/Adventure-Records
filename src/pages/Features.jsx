import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Globe, Shield, Activity, Share2, Sparkles, Check,
  ArrowRight, Zap, Music, BarChart3, Clock, Users, Lock
} from 'lucide-react';

/* ─── Feature Card Data ─────────────────────────────────────────────── */
const features = [
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Worldwide Distribution",
    description:
      "Submit once and reach 150+ music services globally. Your tracks are delivered directly to Spotify, Apple Music, Tidal, Amazon, JioSaavn, and Wynk.",
    highlights: ["Delivery in 24–48 Hours", "JioSaavn & Wynk Included", "TikTok & Instagram Feeds"],
    glow: "rgba(99, 60, 220, 0.35)",
    accent: "#a78bfa",
  },
  {
    icon: <Activity className="w-6 h-6" />,
    title: "Live Analytics Console",
    description:
      "Daily stream statistics, demographic breakdowns, listener ages, and country performance — in near real-time, not months-old CSV files.",
    highlights: ["Daily Stream Logs", "Geographic Breakdowns", "Playlist Placement Alerts"],
    glow: "rgba(56, 139, 253, 0.35)",
    accent: "#60a5fa",
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "AI Audio Mastering",
    description:
      "Our AI mastering engine automatically matches loudness to LUFS specs for Spotify and Apple Music — so your tracks always sound polished.",
    highlights: ["LUFS Loudness Matching", "Audio Quality Check", "WAV/MP3 Conversion"],
    glow: "rgba(167, 139, 250, 0.35)",
    accent: "#c4b5fd",
  },
  {
    icon: <Share2 className="w-6 h-6" />,
    title: "Collaborator Split Shares",
    description:
      "Automatically split royalties with producers, featured artists, and writers. We pay them directly — no manual transfers needed.",
    highlights: ["Direct Payout Splits", "Writers Credit Registry", "Simple Artist Signups"],
    glow: "rgba(52, 211, 153, 0.30)",
    accent: "#6ee7b7",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Content ID Protection",
    description:
      "Claim monetization royalties from user-uploaded videos. Register for YouTube Content ID, TikTok audio tracking, and Facebook Rights Manager.",
    highlights: ["YouTube Content ID Claims", "TikTok Audio Protection", "Copyright Registry Safeguard"],
    glow: "rgba(251, 146, 60, 0.28)",
    accent: "#fba36c",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Revenue Dashboard",
    description:
      "Track every rupee you earn across platforms. UPI withdrawals, bank transfers, and instant royalty reports — all in one place.",
    highlights: ["UPI & Bank Transfers", "Real-Time Royalty Reports", "Tax Invoice Downloads"],
    glow: "rgba(236, 72, 153, 0.28)",
    accent: "#f472b6",
  },
];

/* ─── Ingestion Pipeline Data ───────────────────────────────────────── */
const pipeline = [
  { name: 'Spotify Catalog Ingestion',  status: 'Distributed',    progress: 100, color: '#8b5cf6' },
  { name: 'Apple Music Audio Sync',      status: 'Distributed',    progress: 100, color: '#8b5cf6' },
  { name: 'YouTube Content ID',          status: 'Processing',     progress: 65,  color: '#60a5fa' },
  { name: 'JioSaavn / Wynk Audio Feed',  status: 'Pending Review', progress: 20,  color: '#a78bfa' },
];

/* ─── Animated Progress Bar ─────────────────────────────────────────── */
const AnimatedBar = ({ progress, color, delay }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
      <motion.div
        className="h-full rounded-full"
        initial={{ width: 0 }}
        animate={inView ? { width: `${progress}%` } : {}}
        transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: `linear-gradient(90deg, ${color}99, ${color})`,
          boxShadow: `0 0 10px ${color}66`,
        }}
      />
    </div>
  );
};

/* ─── Stat Counter ──────────────────────────────────────────────────── */
const StatItem = ({ icon, value, label, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="flex flex-col items-center gap-1 text-center"
  >
    <div className="text-[#a78bfa] mb-1">{icon}</div>
    <div className="font-heading font-black text-2xl sm:text-3xl text-white">{value}</div>
    <div className="text-xs text-white/50 uppercase tracking-widest">{label}</div>
  </motion.div>
);

/* ─── Main Component ────────────────────────────────────────────────── */
const Features = () => {
  const [activeFeature, setActiveFeature] = useState(null);

  return (
    <div className="relative overflow-x-hidden" style={{ background: '#050310' }}>

      {/* ── Ambient Background ──────────────────────────────────────── */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(88,85,220,0.18) 0%, transparent 60%),' +
            'radial-gradient(ellipse 60% 40% at 90% 80%, rgba(60,30,180,0.12) 0%, transparent 60%)',
        }}
      />

      {/* ── Hero Header ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
          style={{
            background: 'rgba(139,92,246,0.12)',
            border: '1px solid rgba(139,92,246,0.3)',
            color: '#c4b5fd',
            boxShadow: '0 0 20px rgba(139,92,246,0.15)',
          }}
        >
          <Zap className="w-3 h-3" />
          Platform Capabilities
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-heading font-extrabold text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight leading-tight"
        >
          Enterprise Tools for{' '}
          <span
            className="relative inline-block"
            style={{
              background: 'linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Independent Creators
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-white/50 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
        >
          From independent artists to commercial labels — ingest, protect, release, and profit
          from your music catalog with Adventure Records.
        </motion.p>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="flex flex-wrap justify-center gap-10 sm:gap-16 pt-6"
        >
          <StatItem icon={<Music className="w-5 h-5" />} value="150+" label="Platforms" delay={0.4} />
          <StatItem icon={<Clock className="w-5 h-5" />} value="24hr" label="Distribution" delay={0.5} />
          <StatItem icon={<Users className="w-5 h-5" />} value="10M+" label="Streams Delivered" delay={0.6} />
          <StatItem icon={<Lock className="w-5 h-5" />} value="100%" label="Royalty Ownership" delay={0.7} />
        </motion.div>
      </section>

      {/* ── Features Grid ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: idx * 0.08 }}
              onMouseEnter={() => setActiveFeature(idx)}
              onMouseLeave={() => setActiveFeature(null)}
              className="relative rounded-3xl p-7 flex flex-col cursor-default"
              style={{
                background: 'rgba(10, 8, 22, 0.80)',
                border: `1px solid ${activeFeature === idx ? feat.accent + '40' : 'rgba(255,255,255,0.07)'}`,
                boxShadow: activeFeature === idx
                  ? `0 0 40px ${feat.glow}, 0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)`
                  : '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                transform: activeFeature === idx ? 'translateY(-6px)' : 'translateY(0)',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {/* Glow orb on hover */}
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse 60% 50% at 20% 20%, ${feat.glow} 0%, transparent 70%)`,
                  opacity: activeFeature === idx ? 1 : 0,
                  transition: 'opacity 0.4s ease',
                }}
              />

              {/* Icon */}
              <div
                className="relative z-10 w-11 h-11 rounded-2xl flex items-center justify-center mb-5"
                style={{
                  background: `linear-gradient(135deg, ${feat.accent}22, ${feat.accent}11)`,
                  border: `1px solid ${feat.accent}30`,
                  color: feat.accent,
                  boxShadow: activeFeature === idx ? `0 0 20px ${feat.glow}` : 'none',
                  transition: 'box-shadow 0.4s ease',
                }}
              >
                {feat.icon}
              </div>

              {/* Title */}
              <h3
                className="relative z-10 font-heading font-bold text-lg mb-3"
                style={{
                  color: activeFeature === idx ? feat.accent : '#ffffff',
                  transition: 'color 0.3s ease',
                }}
              >
                {feat.title}
              </h3>

              {/* Description */}
              <p className="relative z-10 text-sm leading-relaxed mb-6 flex-grow" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {feat.description}
              </p>

              {/* Highlights */}
              <ul className="relative z-10 space-y-2.5 border-t pt-5 mt-auto" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                {feat.highlights.map((h, hIdx) => (
                  <li key={hIdx} className="flex items-center gap-2.5 text-xs" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    <Check className="w-3.5 h-3.5 shrink-0" style={{ color: feat.accent }} />
                    {h}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Deliver to Global Stores — Dark Band ────────────────────── */}
      <section
        className="dark-section-band py-24"
        style={{ background: 'linear-gradient(135deg, #05030f 0%, #0e0a23 50%, #05030f 100%)' }}
      >
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-14 items-center">

          {/* Left — Copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-7"
          >
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest"
              style={{
                background: 'rgba(139,92,246,0.12)',
                border: '1px solid rgba(139,92,246,0.3)',
                color: '#c4b5fd',
              }}
            >
              <Zap className="w-3 h-3" />
              Global Pipeline
            </div>

            <h2
              className="font-heading font-black text-3xl sm:text-4xl leading-tight"
              style={{ color: '#ffffff' }}
            >
              Deliver to Global Stores{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Instantly
              </span>
            </h2>

            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
              When you submit a release on Adventure Records, our pipeline validates audio encodes
              and formats metadata immediately. We issue verified UPC and ISRC identifiers for
              compliance, and push them directly to 150+ streaming platforms.
            </p>

            <div className="flex flex-col gap-4 pt-1">
              {[
                { text: 'Compliant UPC and ISRC Codes Included', accent: '#a78bfa' },
                { text: 'High Fidelity FLAC/WAV Encodes Upload',  accent: '#60a5fa' },
                { text: 'Direct Pitching to Spotify Playlist Curators', accent: '#c4b5fd' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.15 + idx * 0.1 }}
                  className="flex items-center gap-3 text-sm"
                  style={{ color: 'rgba(255,255,255,0.85)' }}
                >
                  <div
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: `${item.accent}22`, border: `1px solid ${item.accent}44` }}
                  >
                    <Check className="w-3 h-3" style={{ color: item.accent }} />
                  </div>
                  {item.text}
                </motion.div>
              ))}
            </div>

            <motion.a
              href="/signup"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold mt-2"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                color: '#ffffff',
                boxShadow: '0 0 24px rgba(124,58,237,0.4)',
                border: '1px solid rgba(167,139,250,0.3)',
              }}
            >
              Start Distributing
              <ArrowRight className="w-4 h-4" />
            </motion.a>
          </motion.div>

          {/* Right — Ingestion Status Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative rounded-3xl p-7 overflow-hidden"
            style={{
              background: 'rgba(10, 8, 22, 0.85)',
              border: '1px solid rgba(139,92,246,0.22)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              boxShadow: '0 0 60px rgba(99,60,180,0.18), 0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            {/* Inner glow */}
            <div
              className="absolute inset-0 pointer-events-none rounded-3xl"
              style={{
                background:
                  'radial-gradient(ellipse 70% 60% at 80% 20%, rgba(99,60,220,0.12) 0%, transparent 65%),' +
                  'radial-gradient(ellipse 50% 50% at 20% 80%, rgba(56,139,253,0.08) 0%, transparent 65%)',
              }}
            />

            {/* Live Badge */}
            <div className="relative z-10 absolute top-4 right-4">
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
            <h4
              className="relative z-10 text-[11px] font-bold uppercase tracking-widest mb-7"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              Ingestion Status
            </h4>

            {/* Pipeline Items */}
            <div className="relative z-10 space-y-5">
              {pipeline.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + idx * 0.12 }}
                  className="space-y-2"
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
                  <AnimatedBar progress={item.progress} color={item.color} delay={0.4 + idx * 0.15} />
                </motion.div>
              ))}
            </div>

            {/* Footer note */}
            <div
              className="relative z-10 mt-7 pt-5 flex items-center gap-2 text-[11px]"
              style={{
                borderTop: '1px solid rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.35)',
              }}
            >
              <Zap className="w-3 h-3" style={{ color: '#a78bfa' }} />
              Updates every 60 seconds • All times in IST
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Bottom CTA ──────────────────────────────────────────────── */}
      <section className="py-24 px-4 text-center" style={{ background: '#05030f' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto space-y-6"
        >
          <h2 className="font-heading font-black text-3xl sm:text-5xl text-white leading-tight">
            Ready to Go{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Global?
            </span>
          </h2>
          <p className="text-white/50 text-base max-w-xl mx-auto">
            Join thousands of independent artists distributing their music worldwide with Adventure Records.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-2">
            <motion.a
              href="/signup"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                color: '#ffffff',
                boxShadow: '0 0 30px rgba(124,58,237,0.45)',
                border: '1px solid rgba(167,139,250,0.3)',
              }}
            >
              Start Releasing Free
              <ArrowRight className="w-4 h-4" />
            </motion.a>
            <motion.a
              href="/pricing"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold"
              style={{
                background: 'rgba(255,255,255,0.05)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              View Pricing
            </motion.a>
          </div>
        </motion.div>
      </section>

    </div>
  );
};

export default Features;
