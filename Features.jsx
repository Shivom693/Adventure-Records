import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Shield, Activity, Share2, Sparkles, Check, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: <Globe className="w-8 h-8 text-brand-purple" />,
    title: "Worldwide Ingestion",
    description: "Submit once and reach 150+ music services globally. Your tracks are delivered directly to Spotify, Apple Music, Tidal, Amazon, and domestic outlets such as JioSaavn and Wynk.",
    highlights: ["Delivery in 24-48 Hours", "JioSaavn & Wynk Included", "TikTok & Instagram Feeds"]
  },
  {
    icon: <Activity className="w-8 h-8 text-brand-blue" />,
    title: "Live Analytical Console",
    description: "Receive daily stream statistics, demographic breakdowns, listener ages, and country performance. Don't wait months for CSV logs; view stats in near real-time.",
    highlights: ["Daily Stream Logs", "Geographic Breakdowns", "Playlist Placement Alerts"]
  },
  {
    icon: <Sparkles className="w-8 h-8 text-brand-cyan" />,
    title: "AI Audio Mastering",
    description: "Prepare your tracks for streaming platforms automatically. Our integrated AI mastering engine matches loudness to LUFS standard specs for Spotify and Apple Music.",
    highlights: ["LUFS Loudness Matching", "Audio Quality Check", "Format Conversion (WAV/MP3)"]
  },
  {
    icon: <Share2 className="w-8 h-8 text-brand-pink" />,
    title: "Collaborator Split Shares",
    description: "Automatically split royalties and earnings with producers, featured artists, and writers. We pay them directly, so you don't have to manually execute transfers.",
    highlights: ["Direct Payout Splits", "Writers Credit Registry", "Simple Artist Signups"]
  },
  {
    icon: <Shield className="w-8 h-8 text-purple-400" />,
    title: "Official Content ID Protection",
    description: "Claim monetization royalties from user-uploaded videos containing your tracks. Register for YouTube Content ID, TikTok audio tracking, and Facebook Rights Manager.",
    highlights: ["YouTube Content ID Claims", "TikTok Audio Protection", "Copyright Registry Safeguard"]
  }
];

const Features = () => {
  return (
    <div className="relative pt-20 overflow-x-hidden min-h-screen">
      
      {/* Hero Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 text-center space-y-4">
        <div className="minimal-badge mx-auto">Platform Capabilities</div>
        <h1 className="font-heading font-extrabold text-4xl sm:text-6xl text-white tracking-tight">
          Enterprise Tools for <br />
          <span className="text-zinc-400">Independent Music Creators</span>
        </h1>
        <p className="text-zinc-400 text-sm max-w-2xl mx-auto leading-relaxed">
          From independent recording artists to commercial labels, our infrastructure provides tools to ingest, protect, release, and profit from your music catalog.
        </p>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="glass-panel rounded-3xl p-8 hover:border-purple-500/30 transition-all duration-500 hover:translate-y-[-5px] shadow-[0_4px_30px_rgba(0,0,0,0.4)] flex flex-col group"
            >
              {/* Feature Icon */}
              <div className="p-3 bg-white/5 rounded-2xl w-fit mb-6 border border-white/5 group-hover:border-purple-500/30 transition-colors duration-300">
                {feat.icon}
              </div>

              {/* Title */}
              <h3 className="font-orbitron font-bold text-xl text-white mb-4 group-hover:text-brand-purple transition-colors">
                {feat.title}
              </h3>

              {/* Description */}
              <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
                {feat.description}
              </p>

              {/* Highlights Checklist */}
              <ul className="space-y-2.5 border-t border-white/5 pt-6 mt-auto">
                {feat.highlights.map((highlight, hIdx) => (
                  <li key={hIdx} className="flex items-center gap-2 text-xs text-zinc-300">
                    <Check className="w-4 h-4 text-brand-purple shrink-0" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Platform Ingestion Demonstration Call-to-action */}
      <section className="bg-zinc-950/60 border-t border-white/5 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="font-orbitron font-bold text-2xl sm:text-3xl text-white">
              Deliver to Global Stores Instantly
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              When you submit a release on Adventure Records, our pipeline validates file audio encodes and formats metadata immediately. We issue verified UPC and ISRC identifiers for compliance, and ingest them directly to streaming platforms.
            </p>
            <div className="flex flex-col gap-3">
              {[
                "Compliant UPC and ISRC Codes Included",
                "High Fidelity FLAC/WAV Encodes Upload",
                "Direct Pitching to Spotify Playlist curators"
              ].map((text, idx) => (
                <div key={idx} className="flex items-center gap-3 text-zinc-300 text-sm">
                  <Check className="w-5 h-5 text-brand-blue shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-8 border-purple-500/20 relative overflow-hidden flex flex-col justify-center min-h-[300px]">
            {/* Simulation of Ingestion status */}
            <div className="absolute top-3 right-3 text-[10px] font-orbitron bg-brand-purple/20 text-brand-purple px-2 py-0.5 rounded border border-brand-purple/30">
              Live Pipeline
            </div>
            <h4 className="font-orbitron text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-6">
              Ingestion Status Simulation
            </h4>
            <div className="space-y-4">
              {[
                { name: 'Spotify Catalog Ingestion', status: 'Distributed', progress: 100, color: 'bg-green-500' },
                { name: 'Apple Music Audio Sync', status: 'Distributed', progress: 100, color: 'bg-green-500' },
                { name: 'YouTube Content ID Matching', status: 'Processing', progress: 65, color: 'bg-blue-500' },
                { name: 'JioSaavn / Wynk Audio Feed', status: 'Pending Review', progress: 15, color: 'bg-yellow-500' }
              ].map((sim, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-zinc-200">{sim.name}</span>
                    <span className="text-zinc-400">{sim.status}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${sim.color} rounded-full`} style={{ width: `${sim.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Features;
