import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Music, CheckCircle2, ShieldCheck, HelpCircle, ChevronDown, ArrowRight, Globe, Layers, Zap } from 'lucide-react';
import SeoHead from '../components/SeoHead';

const faqs = [
  {
    question: "How does music distribution work at Adventure Records?",
    answer: "You upload your audio files and artwork, provide release metadata (title, artist names, genre), pay the one-time release fee, and our team verifies your submission before dispatching it to over 150+ global streaming services."
  },
  {
    question: "Which platforms does Adventure Records deliver to?",
    answer: "Adventure Records delivers to major international and regional DSPs including Spotify, Apple Music, Amazon Music, YouTube Music, JioSaavn, Wynk Music, Gaana, Shazam, TikTok, and Instagram Audio."
  },
  {
    question: "Do I keep the copyright to my music?",
    answer: "Yes, 100%. You retain full legal ownership, copyright, and master rights of your tracks. Adventure Records only acts as your non-exclusive digital distributor."
  },
  {
    question: "How much does music distribution cost?",
    answer: "Adventure Records charges a simple one-time payment per release: ₹100 for a Single (1 track), ₹500 for an EP (2–6 tracks), and ₹1,000 for an Album (7+ tracks). You retain 100% of generated royalties."
  }
];

const MusicDistribution = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const breadcrumbs = [
    { name: 'Home', url: 'https://music-b2696.web.app/' },
    { name: 'Music Distribution', url: 'https://music-b2696.web.app/music-distribution' }
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer
      }
    }))
  };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': 'Worldwide Music Distribution for Independent Artists',
    'description': 'Deliver your tracks to Spotify, Apple Music, JioSaavn, Wynk and 150+ global stores with Adventure Records.',
    'author': {
      '@type': 'Organization',
      'name': 'Adventure Records'
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Adventure Records',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://music-b2696.web.app/logo.png'
      }
    },
    'mainEntityOfPage': 'https://music-b2696.web.app/music-distribution'
  };

  return (
    <div className="relative pt-12 pb-24 min-h-screen bg-[#070709] text-zinc-100 font-outfit">
      
      <SeoHead
        title="Music Distribution for Independent Artists | Adventure Records"
        description="Distribute your music worldwide to Spotify, Apple Music, JioSaavn, Wynk & 150+ stores with Adventure Records. Keep 100% of your earnings."
        canonicalUrl="https://music-b2696.web.app/music-distribution"
        structuredData={[articleSchema, faqSchema]}
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="space-y-4 border-b border-white/10 pb-8 text-center sm:text-left">
          <div className="minimal-badge">Official Service Guide</div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight">
            Music Distribution for Independent Artists
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-3xl">
            Empowering independent musicians, producers, and record labels with worldwide release management, speed, and transparent pricing.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="minimal-card p-6 bg-[#09090d] space-y-3">
            <Globe className="w-8 h-8 text-amber-400" />
            <h2 className="font-bold text-white text-lg">150+ Digital Stores</h2>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Reach listeners globally across Spotify, Apple Music, Amazon Music, YouTube Music, JioSaavn, Wynk, and international platforms.
            </p>
          </div>
          <div className="minimal-card p-6 bg-[#09090d] space-y-3">
            <Zap className="w-8 h-8 text-amber-400" />
            <h2 className="font-bold text-white text-lg">24-48 Hours Delivery</h2>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Fast metadata verification and release processing ensures your music goes live quickly on digital service providers.
            </p>
          </div>
          <div className="minimal-card p-6 bg-[#09090d] space-y-3">
            <ShieldCheck className="w-8 h-8 text-amber-400" />
            <h2 className="font-bold text-white text-lg">100% Royalties Kept</h2>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Zero commission splits. You keep 100% of stream royalties and keep all rights to your original master recordings.
            </p>
          </div>
        </div>

        {/* Workflow Section */}
        <div className="minimal-card p-8 bg-[#09090d] space-y-6">
          <h2 className="font-heading font-bold text-xl text-white border-b border-white/10 pb-3">
            How Music Distribution Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-2 p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center mx-auto text-sm">1</span>
              <h3 className="font-bold text-white text-sm">Prepare Master</h3>
              <p className="text-zinc-400 text-xs">High quality WAV file (16/24 bit) and 3000x3000px JPG artwork.</p>
            </div>
            <div className="space-y-2 p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center mx-auto text-sm">2</span>
              <h3 className="font-bold text-white text-sm">Submit Metadata</h3>
              <p className="text-zinc-400 text-xs">Fill in track title, main artists, featured artists, genre & release date.</p>
            </div>
            <div className="space-y-2 p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center mx-auto text-sm">3</span>
              <h3 className="font-bold text-white text-sm">Pay One-Time Fee</h3>
              <p className="text-zinc-400 text-xs">Pay single, EP, or album fee via UPI merchant gateway.</p>
            </div>
            <div className="space-y-2 p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center mx-auto text-sm">4</span>
              <h3 className="font-bold text-white text-sm">Go Live Globally</h3>
              <p className="text-zinc-400 text-xs">Get official ISRC & UPC codes as your release goes live across stores.</p>
            </div>
          </div>
        </div>

        {/* Pricing Banner */}
        <div className="minimal-card p-8 bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/5 border-amber-500/20 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="font-heading font-bold text-xl text-white">Transparent Release Pricing</h2>
              <p className="text-zinc-400 text-xs sm:text-sm">Single ₹100 | EP ₹500 | Album ₹1,000 — Pay once, keep 100% royalties forever.</p>
            </div>
            <Link to="/pricing" className="btn-primary shrink-0 px-6 py-3 rounded-xl text-xs font-semibold">
              View Detailed Pricing →
            </Link>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="minimal-card p-8 bg-[#09090d] space-y-4">
          <h2 className="font-heading font-bold text-lg text-white">Related Distribution Guides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium">
            <Link to="/free-music-distribution" className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-white flex items-center justify-between">
              <span>Free Distribution Guide</span> <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
            </Link>
            <Link to="/music-distribution-for-artists" className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-white flex items-center justify-between">
              <span>Artist Distribution Guide</span> <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
            </Link>
            <Link to="/music-distribution-india" className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-white flex items-center justify-between">
              <span>India Music Distribution</span> <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
            </Link>
            <Link to="/copyright" className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-white flex items-center justify-between">
              <span>Copyright Guide</span> <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
            </Link>
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <h2 className="font-heading font-bold text-2xl text-white">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="minimal-card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left font-semibold text-white text-xs sm:text-sm flex justify-between items-center gap-4 hover:text-zinc-300 transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-300 ${openFaq === idx ? 'rotate-180 text-white' : 'text-zinc-500'}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-zinc-400 leading-relaxed border-t border-white/5 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default MusicDistribution;
