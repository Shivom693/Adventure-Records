import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Music, CheckCircle2, ShieldCheck, ChevronDown, ArrowRight, MapPin, Radio, CreditCard } from 'lucide-react';
import SeoHead from '../components/SeoHead';

const faqs = [
  {
    question: "Which Indian streaming platforms does Adventure Records cover?",
    answer: "Adventure Records delivers your music to major Indian platforms including JioSaavn, Wynk Music, Gaana, Spotify India, Amazon Music India, YouTube Music, as well as global platforms like Apple Music."
  },
  {
    question: "Can I pay for distribution using Indian UPI?",
    answer: "Yes! Adventure Records supports direct UPI payment (GPay, PhonePe, Paytm, BHIM) at the official merchant ID 9691546208@ptyes. Rates are in INR (Single ₹100, EP ₹500, Album ₹1,000)."
  },
  {
    question: "Does Adventure Records support regional language songs in India?",
    answer: "Yes, we support releases in Hindi, Punjabi, Tamil, Telugu, Malayalam, Bengali, Kannada, Marathi, Gujarati, Bhojpuri, and all other Indian regional languages."
  }
];

const IndiaDistributionGuide = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const breadcrumbs = [
    { name: 'Home', url: 'https://music-b2696.web.app/' },
    { name: 'Music Distribution India', url: 'https://music-b2696.web.app/music-distribution-india' }
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
    'headline': 'Music Distribution in India for Independent Artists | Adventure Records',
    'description': 'Distribute Hindi, Punjabi, Tamil, Telugu and regional Indian music to JioSaavn, Wynk, Gaana, Spotify and Apple Music with easy UPI payment.',
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
    'mainEntityOfPage': 'https://music-b2696.web.app/music-distribution-india'
  };

  return (
    <div className="relative pt-12 pb-24 min-h-screen bg-[#070709] text-zinc-100 font-outfit">
      
      <SeoHead
        title="Music Distribution India | Release Music to JioSaavn, Wynk & Spotify | Adventure Records"
        description="Empowering Indian independent artists with direct release to JioSaavn, Wynk, Gaana, Spotify & Apple Music. INR pricing & seamless UPI payments."
        canonicalUrl="https://music-b2696.web.app/music-distribution-india"
        structuredData={[articleSchema, faqSchema]}
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="space-y-4 border-b border-white/10 pb-8 text-center sm:text-left">
          <div className="minimal-badge">Adventure Records India</div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight">
            Music Distribution in India
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-3xl">
            Tailored digital music distribution for Indian musicians, singers, rappers, beatmakers, and indie record labels. Transparent INR pricing and instant UPI payments.
          </p>
        </div>

        {/* Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="minimal-card p-6 bg-[#09090d] space-y-3">
            <Radio className="w-8 h-8 text-amber-400" />
            <h2 className="font-bold text-white text-lg">Top Indian DSPs</h2>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Full coverage across JioSaavn, Wynk Music, Gaana, Spotify India, Amazon Music India, and YouTube Music.
            </p>
          </div>
          <div className="minimal-card p-6 bg-[#09090d] space-y-3">
            <CreditCard className="w-8 h-8 text-amber-400" />
            <h2 className="font-bold text-white text-lg">UPI Payment Support</h2>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Pay conveniently in INR via GPay, PhonePe, Paytm, or BHIM UPI directly to our official merchant address.
            </p>
          </div>
          <div className="minimal-card p-6 bg-[#09090d] space-y-3">
            <MapPin className="w-8 h-8 text-amber-400" />
            <h2 className="font-bold text-white text-lg">Regional Language Focus</h2>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Dedicated support for Hindi, Punjabi, Haryanvi, Tamil, Telugu, Malayalam, Marathi, Bengali, and all Indian regional tracks.
            </p>
          </div>
        </div>

        {/* INR Pricing Detail */}
        <div className="minimal-card p-8 bg-[#09090d] space-y-6">
          <h2 className="font-heading font-bold text-xl text-white border-b border-white/10 pb-3">
            Simple INR Pricing for Indian Artists
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Single Track</p>
              <p className="font-heading font-black text-3xl text-white">₹100</p>
              <p className="text-zinc-400 text-xs">One-time release fee • Keep 100% royalties</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-amber-500/30 bg-amber-500/5 space-y-2">
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">EP (2–6 Tracks)</p>
              <p className="font-heading font-black text-3xl text-white">₹500</p>
              <p className="text-zinc-400 text-xs">One-time release fee • Free ISRC & UPC</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Full Album (7+ Tracks)</p>
              <p className="font-heading font-black text-3xl text-white">₹1,000</p>
              <p className="text-zinc-400 text-xs">One-time release fee • Priority verification</p>
            </div>
          </div>
        </div>

        {/* Internal Link Section */}
        <div className="minimal-card p-8 bg-[#09090d] space-y-4">
          <h2 className="font-heading font-bold text-lg text-white">Related Resources</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium">
            <Link to="/pricing" className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-white flex items-center justify-between">
              <span>UPI Payment Pricing</span> <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
            </Link>
            <Link to="/free-music-distribution" className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-white flex items-center justify-between">
              <span>Free Distribution Guide</span> <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
            </Link>
            <Link to="/isrc" className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-white flex items-center justify-between">
              <span>ISRC Codes</span> <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
            </Link>
            <Link to="/copyright" className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-white flex items-center justify-between">
              <span>Copyright in India</span> <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
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

export default IndiaDistributionGuide;
