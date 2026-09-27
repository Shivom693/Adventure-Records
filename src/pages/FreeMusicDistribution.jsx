import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Music, CheckCircle2, ShieldCheck, HelpCircle, ChevronDown, 
  ArrowRight, Disc, Disc2, Star, AlertCircle, FileText, Lock
} from 'lucide-react';
import SeoHead from '../components/SeoHead';

const faqs = [
  {
    question: "Is Adventure Records 100% free for music distribution?",
    answer: "No. Adventure Records provides transparent, affordable one-time pricing per release (Single ₹100, EP ₹500, Album ₹1,000). Creating an account and exploring the platform is completely free, but submitting a release for store delivery requires a one-time distribution fee. Artists keep 100% of their streaming earnings."
  },
  {
    question: "What does 'free music distribution' actually mean in the industry?",
    answer: "In the music industry, 'free music distribution' usually refers to distributors that take no upfront fee but charge 15% to 30% commission on your lifetime earnings, or platforms offering limited free trial releases. Adventure Records charges a small, transparent one-time fee per release so you keep 100% of your earnings forever."
  },
  {
    question: "What should artists check before choosing a music distributor?",
    answer: "Artists should verify: 1) Royalty commission rates (whether 0% or percentage split), 2) Recurring annual subscription fees, 3) ISRC and UPC code charges, 4) Takedowns policy and ownership retention, 5) Store distribution coverage."
  },
  {
    question: "Are ISRC and UPC barcodes provided for releases?",
    answer: "Yes, Adventure Records assigns official GS1-compliant UPC barcodes and ISRC codes for all your releases without additional hidden fees."
  },
  {
    question: "How long does distribution delivery take?",
    answer: "Once your payment is verified and metadata is approved by our curation desk, releases are delivered to major digital service providers within 24 to 48 hours."
  }
];

const FreeMusicDistribution = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const breadcrumbs = [
    { name: 'Home', url: 'https://music-b2696.web.app/' },
    { name: 'Free Music Distribution Guide', url: 'https://music-b2696.web.app/free-music-distribution' }
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
    'headline': 'Free Music Distribution Guide for Independent Artists',
    'description': 'Comprehensive guide explaining how free music distribution works, ISRC, UPC, metadata, royalties, and Adventure Records pricing.',
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
    'mainEntityOfPage': 'https://music-b2696.web.app/free-music-distribution'
  };

  return (
    <div className="relative pt-12 pb-24 min-h-screen bg-[#070709] text-zinc-100 font-outfit">
      
      <SeoHead
        title="Free Music Distribution Guide for Independent Artists | Adventure Records"
        description="Learn how free music distribution works, what artists should know about ISRC, UPC, metadata, royalties and release delivery, with practical guidance from Adventure Records."
        canonicalUrl="https://music-b2696.web.app/free-music-distribution"
        structuredData={[articleSchema, faqSchema]}
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="space-y-4 border-b border-white/10 pb-8 text-center sm:text-left">
          <div className="minimal-badge">Educational Resource & Guide</div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight">
            Free Music Distribution Guide for Independent Artists
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-3xl">
            Everything you need to know about releasing music online: how distribution models work, ISRC & UPC codes, audio requirements, royalties, and honest pricing.
          </p>
        </div>

        {/* Honest Business Model Callout */}
        <div className="minimal-card p-6 sm:p-8 bg-amber-500/5 border-amber-500/20 text-amber-200 space-y-3">
          <div className="flex items-center gap-2 font-bold text-base text-white">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Honest Pricing & Transparency at Adventure Records</span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Creating an account and exploring the Adventure Records platform is <strong>100% free</strong>. For music distribution, Adventure Records charges an affordable, transparent <strong>one-time fee per release</strong> (Single ₹100, EP ₹500, Album ₹1,000). In return, <strong>you keep 100% of your streaming earnings</strong> with zero monthly or annual recurring fees.
          </p>
        </div>

        {/* Section 1: What is Free Music Distribution */}
        <div className="minimal-card p-8 bg-[#09090d] space-y-6">
          <h2 className="font-heading font-bold text-xl text-white border-b border-white/10 pb-3">
            1. What Does "Free Music Distribution" Mean?
          </h2>
          <div className="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed">
            <p>
              In today's digital music industry, independent musicians have multiple pathways to deliver their songs to platforms like Spotify, Apple Music, Amazon Music, Wynk, and JioSaavn. When searching for <em>free music distribution</em>, artists usually encounter two main business models:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <h3 className="font-bold text-white text-sm">Revenue Share (Commission Model)</h3>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Distributors charge no upfront fee to upload, but take a <strong>15% to 30% commission</strong> from all your streaming royalties for as long as your song remains online.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <h3 className="font-bold text-white text-sm">One-Time Fee (0% Commission Model)</h3>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  You pay a small upfront fee per release (e.g. ₹100 for a Single at Adventure Records), and <strong>retain 100% of all generated royalties</strong> with zero ongoing commission splits.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Technical Checklist for Releases */}
        <div className="minimal-card p-8 bg-[#09090d] space-y-6">
          <h2 className="font-heading font-bold text-xl text-white border-b border-white/10 pb-3">
            2. Technical Requirements for Music Release Submission
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
            <div className="space-y-2">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Music className="w-4 h-4 text-amber-400" /> Audio Master Format
              </h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                High-resolution 16-bit or 24-bit WAV or FLAC audio files (44.1kHz sample rate). Uncompressed audio ensures broadcast quality on all streaming services.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Disc className="w-4 h-4 text-amber-400" /> Cover Artwork Specifications
              </h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Square image (3000 × 3000 pixels) in JPG or PNG format, RGB color mode. Artwork must not contain social media handles, pricing text, or blurry elements.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" /> ISRC & UPC Identifiers
              </h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                International Standard Recording Code (ISRC) tracks individual audio recordings, while Universal Product Code (UPC) tracks the complete release package.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" /> Copyright Ownership
              </h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                You must hold 100% legal ownership or authorized rights for all sound recordings, samples, beat licenses, and musical compositions.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Adventure Records Pricing Table */}
        <div className="minimal-card p-8 bg-[#09090d] space-y-6">
          <h2 className="font-heading font-bold text-xl text-white border-b border-white/10 pb-3">
            3. Adventure Records Distribution Pricing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center space-y-3">
              <span className="text-2xl">🎵</span>
              <h3 className="font-bold text-white text-base">SINGLE</h3>
              <p className="font-heading font-black text-3xl text-white">₹100</p>
              <p className="text-zinc-400 text-xs">One-time payment • 1 Track</p>
              <Link to="/single-distribution" className="btn-secondary block py-2.5 rounded-xl text-xs font-semibold">
                Single Details →
              </Link>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-amber-500/30 bg-amber-500/5 text-center space-y-3">
              <span className="text-2xl">💿</span>
              <h3 className="font-bold text-white text-base">EP</h3>
              <p className="font-heading font-black text-3xl text-white">₹500</p>
              <p className="text-zinc-400 text-xs">One-time payment • 2–6 Tracks</p>
              <Link to="/ep-distribution" className="btn-primary block py-2.5 rounded-xl text-xs font-semibold">
                EP Details →
              </Link>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center space-y-3">
              <span className="text-2xl">💽</span>
              <h3 className="font-bold text-white text-base">ALBUM</h3>
              <p className="font-heading font-black text-3xl text-white">₹1,000</p>
              <p className="text-zinc-400 text-xs">One-time payment • 7+ Tracks</p>
              <Link to="/album-distribution" className="btn-secondary block py-2.5 rounded-xl text-xs font-semibold">
                Album Details →
              </Link>
            </div>
          </div>
        </div>

        {/* Section 4: Internal Links Contextual Navigation */}
        <div className="minimal-card p-8 bg-[#09090d] space-y-4">
          <h2 className="font-heading font-bold text-lg text-white">Explore Detailed Guides & Resources</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium">
            <Link to="/music-distribution" className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-white flex items-center justify-between">
              <span>Music Distribution</span> <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
            </Link>
            <Link to="/pricing" className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-white flex items-center justify-between">
              <span>Transparent Pricing</span> <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
            </Link>
            <Link to="/isrc" className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-white flex items-center justify-between">
              <span>ISRC Guide</span> <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
            </Link>
            <Link to="/upc" className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-white flex items-center justify-between">
              <span>UPC Barcode Guide</span> <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
            </Link>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <h2 className="font-heading font-bold text-2xl text-white text-center sm:text-left">
            Frequently Asked Questions
          </h2>
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

export default FreeMusicDistribution;
