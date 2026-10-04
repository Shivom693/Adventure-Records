import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Cpu, TrendingUp, Music, Compass, Star } from 'lucide-react';
import SeoHead from '../components/SeoHead';

const pillars = [
  {
    icon: <ShieldCheck className="w-6 h-6 text-[#585589]" />,
    title: "Artist Autonomy First",
    description: "We believe creators should keep their rights and master tapes. We claim 0% of publishing or copyrights."
  },
  {
    icon: <Cpu className="w-6 h-6 text-[#585589]" />,
    title: "Ingestion Automation Engine",
    description: "We build APIs directly hooking into platforms, bypassing old industry middleware databases for fast updates."
  },
  {
    icon: <TrendingUp className="w-6 h-6 text-[#585589]" />,
    title: "Data-Driven Catalog Scale",
    description: "Access deep statistics regarding where tracks are streamed. Make distribution decisions backed by real figures."
  }
];

const roadmapMilestones = [
  {
    year: "Q1 2025",
    title: "Startup Ingestion Pipeline Beta",
    desc: "Beta version released to 5,000 independent Indian electronic artists. Built automated UPC assignment."
  },
  {
    year: "Q3 2025",
    title: "Global Store Extensions",
    desc: "Hooked into 150+ stores. Set up automatic Content ID claims system and collaborators payout splits."
  },
  {
    year: "Q1 2026",
    title: "Dual-Mode Datastore Integration",
    desc: "Re-engineered infrastructure to support seamless offline fallbacks, guaranteeing 99.9% API health uptime."
  },
  {
    year: "Q4 2026 (Future)",
    title: "AI mastering suites & Smart Links",
    desc: "Integrating native audio quality remastering, lossless codec conversions, and pre-save marketing landers."
  }
];

const About = () => {
  const breadcrumbs = [
    { name: 'Home', url: 'https://music-b2696.web.app/' },
    { name: 'About Us', url: 'https://music-b2696.web.app/about' }
  ];

  return (
    <div className="relative pt-20 overflow-x-hidden min-h-screen">
      
      <SeoHead
        title="About Adventure Records | Music Distribution & Release Management"
        description="Learn about Adventure Records: our mission to empower independent music creators with fast store delivery, 100% royalty payouts, and transparent pricing."
        canonicalUrl="https://music-b2696.web.app/about"
        breadcrumbs={breadcrumbs}
      />
      
      {/* Hero Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 text-center space-y-4">
        <div className="minimal-badge mx-auto">About Our Platform</div>
        <h1 className="font-heading font-extrabold text-4xl sm:text-6xl text-white tracking-tight">
          Empowering Independent <br />
          <span className="text-[#DEDCFF]/70">Music Creators & Labels</span>
        </h1>
        <p className="text-zinc-400 text-sm max-w-2xl mx-auto leading-relaxed">
          Founded in Mumbai, Adventure Records provides a transparent, high-performance music distribution bridge between artists and global streaming services.
        </p>
      </section>

      {/* Story Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="minimal-card p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <h2 className="font-heading font-bold text-2xl text-white">Our Mission</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Traditional distribution platforms are built on legacy infrastructure. They take weeks to process releases, obscure earnings statements, and take large percentages of your income.
            </p>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Adventure Records changes this. By pairing raw web tech with artist-friendly pricing, we deliver a platform that works like a high-tech tool, not a bureaucratic gatekeeper. We provide you with fast uploads, clear analytics, and 100% of your earnings.
            </p>
          </div>
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-44 h-44 rounded-2xl bg-[#13112a] border border-[#585589]/30 flex items-center justify-center p-4 text-center">
              <div>
                <Compass className="w-10 h-10 text-[#DEDCFF] mx-auto mb-3" />
                <span className="font-heading font-bold text-sm text-white tracking-wider block">ADVENTURE RECORDS</span>
                <span className="text-[10px] text-zinc-500 tracking-widest uppercase">ESTD. 2025</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-heading font-bold text-2xl text-white">Three Pillars of Our Product</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((p, idx) => (
            <div key={idx} className="glass-panel rounded-2xl p-8 border-[#585589]/20 space-y-4">
              <div className="p-3 bg-[#585589]/20 rounded-xl w-fit text-[#DEDCFF]">
                {p.icon}
              </div>
              <h3 className="font-heading font-bold text-lg text-white">{p.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{p.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roadmap Timeline */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mb-24">
        <div className="text-center mb-16">
          <h2 className="font-heading font-bold text-2xl text-white">The Product Journey Roadmap</h2>
          <p className="text-zinc-400 text-sm mt-2">Our milestone path and upcoming technology features</p>
        </div>

        <div className="relative border-l border-[#585589]/30 ml-4 sm:ml-6 space-y-12">
          {roadmapMilestones.map((m, idx) => (
            <div key={idx} className="relative pl-8 sm:pl-10">
              
              {/* Timeline Indicator Node */}
              <div className="absolute left-[-9px] top-1.5 w-4.5 h-4.5 rounded-full bg-[#0c0b1a] border-2 border-[#585589] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#DEDCFF]" />
              </div>

              <div className="space-y-2">
                <span className="font-heading font-extrabold text-xs text-[#DEDCFF] uppercase tracking-widest">
                  {m.year}
                </span>
                <h3 className="font-heading font-bold text-lg text-white">
                  {m.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {m.desc}
                </p>
              </div>

            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default About;
