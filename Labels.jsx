import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, Layers, ShieldCheck, PieChart, ArrowRight, CheckCircle2 } from 'lucide-react';

const labelFeatures = [
  {
    icon: <Users className="w-6 h-6 text-purple-400" />,
    title: 'Multi-Artist Catalog Roster Management',
    description: 'Manage multiple artist profiles under your official custom Record Label name with unified catalog dashboards.'
  },
  {
    icon: <PieChart className="w-6 h-6 text-indigo-400" />,
    title: 'Automated Revenue Splits & Payouts',
    description: 'Configure automated revenue splits for roster artists, producers, and managers with automated monthly payouts.'
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-cyan-400" />,
    title: 'YouTube Content ID & Rights Protection',
    description: 'Protect master recordings across YouTube, TikTok, and Instagram with automated fingerprinting and claim management.'
  },
  {
    icon: <Layers className="w-6 h-6 text-emerald-400" />,
    title: 'Priority Bulk Upload Engine',
    description: 'Ingest full catalogs and back-catalogs rapidly with high-speed parallel server processing.'
  }
];

const Labels = () => {
  return (
    <div className="relative pt-12 pb-24 overflow-x-hidden min-h-screen">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-20 right-10 w-[500px] h-[350px] bg-indigo-600/10 blur-[160px] rounded-full pointer-events-none" />

      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
          <Building2 className="w-4 h-4 text-indigo-400" /> Enterprise & Independent Record Labels
        </div>
        <h1 className="font-heading font-black text-4xl sm:text-6xl text-white tracking-tight">
          Scalable Infrastructure for <br />
          <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
            Record Labels & Imprints
          </span>
        </h1>
        <p className="text-zinc-400 text-base max-w-2xl mx-auto leading-relaxed">
          Manage your entire artist roster, release schedules, team permissions, and revenue splits from a unified command center.
        </p>
      </section>

      {/* Label Feature Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {labelFeatures.map((feat, idx) => (
            <div 
              key={idx}
              className="p-8 rounded-3xl bg-[#0d0d14] border border-white/10 hover:border-indigo-500/40 transition-all duration-300 space-y-4"
            >
              <div className="p-3.5 rounded-2xl bg-white/5 w-fit border border-white/5">
                {feat.icon}
              </div>
              <h3 className="font-heading font-bold text-xl text-white">{feat.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roster & Enterprise Stats */}
      <section className="border-y border-white/10 bg-zinc-950/40 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <p className="font-heading font-black text-4xl text-white">1,200+</p>
              <p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Independent Labels Onboarded</p>
            </div>
            <div className="space-y-2">
              <p className="font-heading font-black text-4xl text-white">24h</p>
              <p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Fast-Track Ingestion Speed</p>
            </div>
            <div className="space-y-2">
              <p className="font-heading font-black text-4xl text-white">100%</p>
              <p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Royalty Payout Accuracy</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
        <div className="p-10 rounded-3xl bg-gradient-to-r from-indigo-950/50 via-purple-950/40 to-black border border-indigo-500/30 space-y-6">
          <h2 className="font-heading font-bold text-3xl text-white">Scale Your Record Label Today</h2>
          <p className="text-zinc-300 text-sm max-w-xl mx-auto">
            Get unlimited artist profiles, custom label branding, and dedicated manager support.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all"
          >
            Get Started as Label <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Labels;
