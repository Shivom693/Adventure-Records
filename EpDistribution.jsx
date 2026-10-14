import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Music, CheckCircle2, ChevronDown, ArrowRight, Disc2 } from 'lucide-react';
import SeoHead from '../components/SeoHead';

const EpDistribution = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const breadcrumbs = [
    { name: 'Home', url: 'https://music-b2696.web.app/' },
    { name: 'EP Distribution', url: 'https://music-b2696.web.app/ep-distribution' }
  ];

  const faqs = [
    {
      question: "How many tracks can I include in an EP distribution?",
      answer: "An EP (Extended Play) release at Adventure Records includes between 2 to 6 tracks for a flat one-time fee of ₹500."
    },
    {
      question: "Are individual ISRCs provided for each track in an EP?",
      answer: "Yes! Every individual audio track in your EP gets its own unique ISRC code, and the entire EP gets a single UPC barcode."
    },
    {
      question: "Are there annual subscription fees for EP releases?",
      answer: "No. You pay ₹500 once and your EP stays live on streaming stores forever while you keep 100% of all royalties."
    }
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

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': 'EP Music Distribution',
    'description': 'Distribute 2 to 6 tracks (EP) to Spotify, Apple Music, JioSaavn and 150+ digital stores.',
    'brand': {
      '@type': 'Brand',
      'name': 'Adventure Records'
    },
    'offers': {
      '@type': 'Offer',
      'priceCurrency': 'INR',
      'price': '500',
      'availability': 'https://schema.org/InStock',
      'url': 'https://music-b2696.web.app/ep-distribution'
    }
  };

  return (
    <div className="relative pt-12 pb-24 min-h-screen bg-[#070709] text-zinc-100 font-outfit">
      
      <SeoHead
        title="EP Music Distribution | ₹500 One-Time Fee | Adventure Records"
        description="Release your EP (2-6 tracks) to Spotify, Apple Music, JioSaavn, Wynk & 150+ stores for a one-time ₹500 fee. Free ISRC/UPC & 100% royalty payout."
        canonicalUrl="https://music-b2696.web.app/ep-distribution"
        structuredData={[productSchema, faqSchema]}
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="space-y-4 border-b border-white/10 pb-8 text-center sm:text-left">
          <div className="minimal-badge">Extended Play (EP) Release</div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight">
            EP Music Distribution
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-3xl">
            Distribute your 2 to 6 track Extended Play project worldwide for a simple one-time payment of ₹500.
          </p>
        </div>

        {/* Pricing Box */}
        <div className="minimal-card p-8 bg-[#09090d] border border-amber-500/30 text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-amber-500/10 text-amber-400 mb-2">
            <Disc2 className="w-10 h-10" />
          </div>
          <h2 className="font-heading font-bold text-2xl text-white">EP Distribution Plan</h2>
          <div className="font-heading font-black text-5xl text-white">₹500 <span className="text-sm font-normal text-zinc-400">/ one-time</span></div>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-md mx-auto">
            Includes 2 to 6 tracks, 150+ global stores, individual ISRC codes per track, 1 release UPC, and 100% royalty payout.
          </p>
          <div className="pt-4">
            <Link to="/pricing" className="btn-primary inline-block px-8 py-3 rounded-xl font-bold text-sm">
              Distribute EP Now →
            </Link>
          </div>
        </div>

        {/* What's Included */}
        <div className="minimal-card p-8 bg-[#09090d] space-y-6">
          <h2 className="font-heading font-bold text-xl text-white border-b border-white/10 pb-3">What's Included in EP Distribution</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-zinc-300">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>2 to 6 Audio Tracks (WAV / FLAC)</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>150+ Worldwide Streaming Services</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Free ISRCs for every track + UPC Barcode</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>100% Streaming Royalty Rights</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Fast 24-48 Hour Store Delivery</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Zero Annual Recurring Fees</span>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="minimal-card p-8 bg-[#09090d] space-y-4">
          <h2 className="font-heading font-bold text-lg text-white">Compare Release Types</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium">
            <Link to="/single-distribution" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-white flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Single Distribution</p>
                <p className="text-zinc-400 text-xs">1 track • ₹100</p>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400" />
            </Link>
            <Link to="/album-distribution" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-white flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Album Distribution</p>
                <p className="text-zinc-400 text-xs">7+ tracks • ₹1,000</p>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400" />
            </Link>
            <Link to="/pricing" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-white flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Full Pricing Table</p>
                <p className="text-zinc-400 text-xs">All options compared</p>
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

export default EpDistribution;
