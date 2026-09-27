import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle2, ChevronDown, ArrowRight, Code } from 'lucide-react';
import SeoHead from '../components/SeoHead';

const faqs = [
  {
    question: "What is an ISRC code in music distribution?",
    answer: "ISRC stands for International Standard Recording Code. It is a unique 12-character alphanumeric identifier assigned to a specific audio recording or music video to track sales, streams, and royalty payouts across global digital stores."
  },
  {
    question: "Does Adventure Records charge extra for ISRC codes?",
    answer: "No. Adventure Records generates official, globally valid ISRC codes for all your tracks at no additional cost."
  },
  {
    question: "Can I bring my own existing ISRC codes?",
    answer: "Yes! If you already have official ISRC codes assigned to your tracks, you can enter them during the release submission process to preserve stream counts."
  }
];

const IsrcGuide = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const breadcrumbs = [
    { name: 'Home', url: 'https://music-b2696.web.app/' },
    { name: 'ISRC Guide', url: 'https://music-b2696.web.app/isrc' }
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
    'headline': 'Understanding ISRC Codes for Independent Artists | Adventure Records Guide',
    'description': 'Learn what an ISRC code is, how it works, how ISRC vs UPC differs, and how Adventure Records assigns free ISRC codes for your music releases.',
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
    'mainEntityOfPage': 'https://music-b2696.web.app/isrc'
  };

  return (
    <div className="relative pt-12 pb-24 min-h-screen bg-[#070709] text-zinc-100 font-outfit">
      
      <SeoHead
        title="What is an ISRC Code? Music Distribution Guide | Adventure Records"
        description="Complete guide to International Standard Recording Codes (ISRC). Learn how ISRCs track streaming royalties, play counts, and how to get free ISRCs."
        canonicalUrl="https://music-b2696.web.app/isrc"
        structuredData={[articleSchema, faqSchema]}
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="space-y-4 border-b border-white/10 pb-8 text-center sm:text-left">
          <div className="minimal-badge">Technical Guide</div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight">
            What is an ISRC Code?
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-3xl">
            Everything independent musicians need to know about International Standard Recording Codes (ISRC): track identification, stream tracking, and royalty reporting.
          </p>
        </div>

        {/* Breakdown Card */}
        <div className="minimal-card p-8 bg-[#09090d] space-y-6">
          <h2 className="font-heading font-bold text-xl text-white border-b border-white/10 pb-3">
            Understanding ISRC Structure (12 Characters)
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            An ISRC code uniquely identifies a specific audio recording (e.g., <code className="bg-white/10 px-2 py-1 rounded text-amber-400 font-mono text-xs">US-S1Z-24-00001</code>). It acts like a digital fingerprint or serial number for your song.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center text-xs">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="font-mono text-amber-400 font-bold text-base block">US</span>
              <span className="text-zinc-400">Country Code (2 Letters)</span>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="font-mono text-amber-400 font-bold text-base block">S1Z</span>
              <span className="text-zinc-400">Registrant Code (3 Alphanumeric)</span>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="font-mono text-amber-400 font-bold text-base block">24</span>
              <span className="text-zinc-400">Year of Reference (2 Digits)</span>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="font-mono text-amber-400 font-bold text-base block">00001</span>
              <span className="text-zinc-400">Designation Code (5 Digits)</span>
            </div>
          </div>
        </div>

        {/* Why ISRCs Matter */}
        <div className="minimal-card p-8 bg-[#09090d] space-y-6">
          <h2 className="font-heading font-bold text-xl text-white border-b border-white/10 pb-3">
            Why ISRC Codes Are Essential for Artists
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm text-zinc-300">
            <div className="space-y-2">
              <h3 className="font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400" /> Accurate Royalty Reporting
              </h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Platforms like Spotify, Apple Music, and YouTube use ISRCs to log streams and allocate performance royalties back to the rights holder.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400" /> Preserving Stream Counts
              </h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                If you ever transfer your catalog from another distributor to Adventure Records, using the same ISRC ensures your play counts and playlist placements stay intact.
              </p>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="minimal-card p-8 bg-[#09090d] space-y-4">
          <h2 className="font-heading font-bold text-lg text-white">Related Technical Guides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium">
            <Link to="/upc" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-white flex items-center justify-between">
              <div>
                <p className="font-bold text-white">UPC Barcode Guide</p>
                <p className="text-zinc-400 text-xs">Product code tracking</p>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400" />
            </Link>
            <Link to="/copyright" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-white flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Copyright Guide</p>
                <p className="text-zinc-400 text-xs">Protect original master rights</p>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400" />
            </Link>
            <Link to="/free-music-distribution" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-white flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Distribution Overview</p>
                <p className="text-zinc-400 text-xs">How metadata works</p>
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

export default IsrcGuide;
