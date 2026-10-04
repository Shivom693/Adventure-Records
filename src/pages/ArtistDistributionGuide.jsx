import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Music, CheckCircle2, ShieldCheck, ChevronDown, ArrowRight, UserCheck, Sparkles, Award } from 'lucide-react';
import SeoHead from '../components/SeoHead';

const faqs = [
  {
    question: "Why should independent artists choose Adventure Records?",
    answer: "Adventure Records gives independent artists full control of their masters, 100% royalty payouts, affordable one-time pricing without annual subscription lock-ins, and direct access to top digital streaming platforms."
  },
  {
    question: "Can an independent artist distribute music without a record label?",
    answer: "Yes! Digital music distribution services like Adventure Records allow independent musicians, bedroom producers, and DIY bands to release music globally on Spotify, Apple Music, and JioSaavn without signing to a traditional record label."
  },
  {
    question: "What rights do independent artists retain?",
    answer: "You retain 100% of your copyright, master rights, publishing ownership, and freedom to take down or transfer your releases at any time."
  }
];

const ArtistDistributionGuide = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const breadcrumbs = [
    { name: 'Home', url: 'https://music-b2696.web.app/' },
    { name: 'Music Distribution for Artists', url: 'https://music-b2696.web.app/music-distribution-for-artists' }
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
    'headline': 'Independent Music Distribution Guide for Artists',
    'description': 'How independent artists can distribute music online to Spotify, Apple Music, and JioSaavn while retaining 100% rights.',
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
    'mainEntityOfPage': 'https://music-b2696.web.app/music-distribution-for-artists'
  };

  return (
    <div className="relative pt-12 pb-24 min-h-screen bg-[#070709] text-zinc-100 font-outfit">
      
      <SeoHead
        title="Music Distribution for Independent Artists Guide | Adventure Records"
        description="Comprehensive guide for independent musicians on how to release singles, EPs, and albums to digital streaming platforms with 0% royalty split."
        canonicalUrl="https://music-b2696.web.app/music-distribution-for-artists"
        structuredData={[articleSchema, faqSchema]}
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="space-y-4 border-b border-white/10 pb-8 text-center sm:text-left">
          <div className="minimal-badge">Artist Empowerment</div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight">
            Music Distribution for Independent Artists
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-3xl">
            Learn how DIY musicians, solo acts, bands, and producers can successfully publish and monetize their songs worldwide without needing a traditional record deal.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="minimal-card p-6 bg-[#0d0d12] space-y-3">
            <UserCheck className="w-8 h-8 text-[#DEDCFF]" />
            <h2 className="font-bold text-white text-lg">Total Creative Freedom</h2>
            <p className="text-zinc-400 text-xs leading-relaxed">
              You choose when to release, how your artwork looks, and retain complete authority over your creative catalogue.
            </p>
          </div>
          <div className="minimal-card p-6 bg-[#0d0d12] space-y-3">
            <Sparkles className="w-8 h-8 text-[#DEDCFF]" />
            <h2 className="font-bold text-white text-lg">Instant Global Reach</h2>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Distribute to 150+ streaming platforms across 200+ countries, putting your music directly into the ears of global fans.
            </p>
          </div>
          <div className="minimal-card p-6 bg-[#0d0d12] space-y-3">
            <Award className="w-8 h-8 text-[#DEDCFF]" />
            <h2 className="font-bold text-white text-lg">Keep 100% Earnings</h2>
            <p className="text-zinc-400 text-xs leading-relaxed">
              No hidden percentage cuts. Every rupee generated from Spotify, Apple Music, and regional platforms belongs to you.
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="minimal-card p-8 bg-[#0d0d12] space-y-6">
          <h2 className="font-heading font-bold text-xl text-white border-b border-white/10 pb-3">
            Essential Steps for Artists Before Releasing Music
          </h2>
          <div className="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed">
            <p>
              Releasing music independently is more than just exporting an MP3. To maximize playlist consideration and listener engagement, independent artists should follow industry best practices:
            </p>
            <ul className="space-y-3 list-none">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#DEDCFF] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Mastering for Streaming:</strong> Ensure your mix is professionally mastered with a peak loudness suitable for digital DSP normalization (typically -14 LUFS).
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#DEDCFF] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">High Quality Artwork:</strong> Prepare a 3000 x 3000 pixel square cover art image without low-quality pixelation or misleading text.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#DEDCFF] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Accurate Metadata & Credits:</strong> Properly credit songwriters, lyricists, producers, and featured artists to ensure accurate royalty distribution.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#DEDCFF] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Planning Lead Time:</strong> Submit your release at least 10 to 14 days prior to your target release date to pitch to official Spotify for Artists & Apple Music editorial playlists.
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Internal Link Section */}
        <div className="minimal-card p-8 bg-[#09090d] space-y-4">
          <h2 className="font-heading font-bold text-lg text-white">Explore Distribution Options</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium">
            <Link to="/single-distribution" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-white flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Single Release</p>
                <p className="text-zinc-400 text-xs">₹100 one-time fee</p>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400" />
            </Link>
            <Link to="/ep-distribution" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-white flex items-center justify-between">
              <div>
                <p className="font-bold text-white">EP Release</p>
                <p className="text-zinc-400 text-xs">₹500 one-time fee</p>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400" />
            </Link>
            <Link to="/album-distribution" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-white flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Album Release</p>
                <p className="text-zinc-400 text-xs">₹1,000 one-time fee</p>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400" />
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

export default ArtistDistributionGuide;
