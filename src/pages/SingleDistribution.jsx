import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Music, CheckCircle2, ChevronDown, ArrowRight, Disc } from 'lucide-react';
import SeoHead from '../components/SeoHead';

const SingleDistribution = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const breadcrumbs = [
    { name: 'Home', url: 'https://music-b2696.web.app/' },
    { name: 'Single Distribution', url: 'https://music-b2696.web.app/single-distribution' }
  ];

  const faqs = [
    {
      question: "How much does it cost to distribute a Single track?",
      answer: "Distributing a Single (1 audio track) with Adventure Records costs a one-time fee of ₹100. There are no recurring monthly or annual costs, and you keep 100% of generated royalties."
    },
    {
      question: "Is an ISRC code provided for my Single?",
      answer: "Yes! Adventure Records provides an official ISRC code for your single track at no extra charge."
    },
    {
      question: "How long does a Single release take to go live?",
      answer: "Once metadata is reviewed and verified by our desk, single releases are delivered to digital store partners within 24 to 48 hours."
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
    'name': 'Single Music Distribution',
    'description': 'Distribute 1 single audio track to Spotify, Apple Music, JioSaavn and 150+ digital stores.',
    'brand': {
      '@type': 'Brand',
      'name': 'Adventure Records'
    },
    'offers': {
      '@type': 'Offer',
      'priceCurrency': 'INR',
      'price': '100',
      'availability': 'https://schema.org/InStock',
      'url': 'https://music-b2696.web.app/single-distribution'
    }
  };

  return (
    <div className="relative pt-12 pb-24 min-h-screen bg-[#070709] text-zinc-100 font-outfit">
      
      <SeoHead
        title="Single Music Distribution | ₹100 One-Time Fee | Adventure Records"
        description="Release your single track to Spotify, Apple Music, JioSaavn, Wynk & 150+ stores for a one-time ₹100 fee. Keep 100% of royalties and master rights."
        canonicalUrl="https://music-b2696.web.app/single-distribution"
        structuredData={[productSchema, faqSchema]}
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="space-y-4 border-b border-white/10 pb-8 text-center sm:text-left">
          <div className="minimal-badge">Single Track Release</div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight">
            Single Music Distribution
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-3xl">
            Distribute your standalone single track worldwide for a simple one-time payment of ₹100.
          </p>
        </div>

        {/* Pricing Box */}
        <div className="minimal-card p-8 bg-[#09090d] border border-amber-500/30 text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-amber-500/10 text-amber-400 mb-2">
            <Disc className="w-10 h-10" />
          </div>
          <h2 className="font-heading font-bold text-2xl text-white">Single Distribution Plan</h2>
          <div className="font-heading font-black text-5xl text-white">₹100 <span className="text-sm font-normal text-zinc-400">/ one-time</span></div>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-md mx-auto">
            Includes 1 track, 150+ global stores, official ISRC & UPC barcodes, and 100% royalty payouts to your account.
          </p>
          <div className="pt-4">
            <Link to="/pricing" className="btn-primary inline-block px-8 py-3 rounded-xl font-bold text-sm">
              Distribute Single Now →
            </Link>
          </div>
        </div>

        {/* What's Included */}
        <div className="minimal-card p-8 bg-[#09090d] space-y-6">
          <h2 className="font-heading font-bold text-xl text-white border-b border-white/10 pb-3">What's Included in Single Distribution</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-zinc-300">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>1 Audio Track (WAV / FLAC format)</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>150+ Worldwide Streaming Services</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Free Official ISRC & UPC Assigned</span>
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
            <Link to="/ep-distribution" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-white flex items-center justify-between">
              <div>
                <p className="font-bold text-white">EP Distribution</p>
                <p className="text-zinc-400 text-xs">2–6 tracks • ₹500</p>
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

export default SingleDistribution;
