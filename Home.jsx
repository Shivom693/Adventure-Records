import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, BarChart3, ShieldCheck, ArrowRight, CheckCircle2, ChevronDown, Sparkles, Layers, Zap, Star } from 'lucide-react';
import FloatingDisc from '../components/FloatingDisc';

const stats = [
  { label: 'Global Music Platforms', value: '150+' },
  { label: 'Royalty Retained', value: '100%' },
  { label: 'Ingestion Pipeline', value: '< 24 Hours' },
  { label: 'Hidden Account Fees', value: '₹0' }
];

const features = [
  {
    icon: <Globe className="w-6 h-6 text-purple-400" />,
    title: "Global Distribution Network",
    description: "Deliver your singles, EPs, and albums to Spotify, Apple Music, YouTube Music, Amazon, JioSaavn, and Wynk with official ISRC & UPC validation."
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-blue-400" />,
    title: "Real-Time Streaming Analytics",
    description: "Monitor daily stream performance, geographic listener heatmaps, age demographics, and earnings breakdowns with precision tools."
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-cyan-400" />,
    title: "100% Royalty & Rights Ownership",
    description: "Keep 100% of your master rights and revenue. Withdraw earnings directly to your bank account with transparent royalty statements."
  }
];

const faqs = [
  {
    q: "How fast will my track appear on Spotify and Apple Music?",
    a: "Our priority ingestion engine delivers tracks to major digital service providers in 24 to 48 hours."
  },
  {
    q: "Do I keep 100% of my music royalties?",
    a: "Yes. Adventure Records never takes a cut of your stream royalties or publishing ownership. You retain 100%."
  },
  {
    q: "Are ISRC and UPC codes included with my release?",
    a: "Yes! Every release submitted through Adventure Records receives compliant, official ISRC and UPC barcodes automatically."
  },
  {
    q: "Can I transfer existing releases from another distributor?",
    a: "Yes. Simply provide your existing ISRCs when uploading to preserve stream counts and playlist placements."
  }
];

const Home = () => {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="relative pt-20 overflow-x-hidden min-h-screen">
      
      {/* Subtle Minimal Glows */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-purple-600/5 blur-[180px] rounded-full pointer-events-none" />
      <div className="absolute top-[600px] right-[-10%] w-[500px] h-[500px] bg-blue-600/5 blur-[180px] rounded-full pointer-events-none" />

      {/* HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20 md:pt-28 md:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left z-10">
            
            {/* Minimalist Pill Badge */}
            <div className="minimal-pill mx-auto lg:mx-0">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Premium Independent Music Distribution
            </div>

            {/* Main Headline */}
            <h1 className="font-heading font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.08] text-white">
              Your Music. <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-300 to-blue-400 bg-clip-text text-transparent">
                Everywhere.
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-zinc-400 text-base sm:text-lg max-w-xl leading-relaxed mx-auto lg:mx-0">
              Empowering independent artists, producers, and record labels with global music distribution, 100% royalty retention, and transparent analytics.
            </p>

            {/* Action Triggers */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/signup"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-white font-semibold text-sm tracking-wide shadow-[0_0_25px_rgba(168,85,247,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center gap-2"
              >
                Start Free Release <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/pricing"
                className="px-8 py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold tracking-wide hover:scale-[1.02] transition-all duration-300"
              >
                View Distribution Pricing
              </Link>
            </div>

            {/* Quick trust badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4 text-xs text-zinc-500 font-medium">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-purple-400" /> Free ISRC & UPC Codes</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-purple-400" /> 24-Hour Spotify Delivery</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-purple-400" /> Keep 100% Earnings</span>
            </div>

          </div>

          {/* Right Visual Floating Element */}
          <div className="lg:col-span-5 flex justify-center items-center relative h-[360px] md:h-[420px] z-0">
            <div className="absolute w-64 h-64 rounded-full bg-purple-500/10 blur-[80px] pointer-events-none" />
            <div className="relative scale-95 sm:scale-105">
              <FloatingDisc size="lg" />
            </div>
          </div>

        </div>
      </section>

      {/* MINIMALIST STATS STRIP */}
      <section className="border-y border-white/5 bg-zinc-950/40 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((st, idx) => (
              <div key={idx} className="space-y-1">
                <p className="font-heading font-extrabold text-3xl sm:text-4xl text-white bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                  {st.value}
                </p>
                <p className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
                  {st.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="minimal-pill mx-auto">Platform Capabilities</div>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-white">
            Built for Modern Music Creators
          </h2>
          <p className="text-zinc-400 text-sm">
            Everything you need to publish, track, protect, and monetize your catalog globally.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="glass-panel glass-panel-hover rounded-3xl p-8 border border-white/5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="p-3 bg-white/5 rounded-2xl w-fit border border-white/5">
                  {feat.icon}
                </div>
                <h3 className="font-heading font-semibold text-lg text-white">
                  {feat.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {feat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* GLOBAL DISTRIBUTION OUTLETS */}
      <section className="border-t border-white/5 bg-zinc-950/30 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
          <div className="space-y-2">
            <h3 className="font-heading font-bold text-2xl text-white">
              Deliver to 150+ Digital Music Outlets
            </h3>
            <p className="text-zinc-400 text-xs">
              Direct pipeline ingestion to major global streaming platforms & local Indian services.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto">
            {['Spotify', 'Apple Music', 'YouTube Music', 'Amazon Music', 'JioSaavn', 'Wynk Music', 'Instagram / Facebook', 'TikTok', 'Tidal', 'Deezer', 'Shazam', 'Gaana'].map((store, sIdx) => (
              <span key={sIdx} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-300 font-medium hover:border-purple-500/40 hover:text-white transition-all">
                {store}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-12 space-y-3">
          <div className="minimal-pill mx-auto">FAQ</div>
          <h2 className="font-heading font-bold text-3xl text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="glass-panel rounded-2xl border border-white/5 overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-6 text-left font-semibold text-white text-sm sm:text-base flex justify-between items-center gap-4 hover:text-purple-300 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-300 ${openFaq === idx ? 'rotate-180 text-purple-400' : 'text-zinc-500'}`} />
              </button>
              {openFaq === idx && (
                <div className="px-6 pb-6 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-white/5 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-28">
        <div className="glass-panel glass-panel-purple rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden space-y-6">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-white">
            Ready to Release Your Music Worldwide?
          </h2>
          <p className="text-zinc-300 text-sm max-w-xl mx-auto leading-relaxed">
            Create an account, submit your audio tracks, and start earning 100% royalties across global streaming platforms today.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <Link
              to="/signup"
              className="px-8 py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm tracking-wide shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all"
            >
              Create Creator Account
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
