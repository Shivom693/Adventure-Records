import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Barcode, CheckCircle2, ChevronDown, ArrowRight } from 'lucide-react';
import SeoHead from '../components/SeoHead';

const faqs = [
  {
    question: "What is a UPC code in digital music distribution?",
    answer: "UPC stands for Universal Product Code (or EAN barcode). While an ISRC identifies a single audio track, a UPC identifies the entire release product package (Single, EP, or Album)."
  },
  {
    question: "Does Adventure Records charge for UPC barcodes?",
    answer: "No. Adventure Records automatically generates official, GS1-compliant UPC barcodes for every release submitted through our platform at no extra charge."
  },
  {
    question: "What is the difference between ISRC and UPC?",
    answer: "ISRC identifies an individual song recording (1 track = 1 ISRC). UPC identifies the complete release product (1 Single/EP/Album release = 1 UPC). An EP with 5 songs will have 1 UPC and 5 ISRCs."
  }
];

const UpcGuide = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const breadcrumbs = [
    { name: 'Home', url: 'https://music-b2696.web.app/' },
    { name: 'UPC Guide', url: 'https://music-b2696.web.app/upc' }
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
    'headline': 'Understanding UPC Barcodes in Music Distribution | Adventure Records Guide',
    'description': 'Learn what a UPC barcode is, how UPC vs ISRC differs, and how Adventure Records assigns official UPC barcodes for your release packages.',
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
    'mainEntityOfPage': 'https://music-b2696.web.app/upc'
  };

  return (
    <div className="relative pt-12 pb-24 min-h-screen bg-[#070709] text-zinc-100 font-outfit">
      
      <SeoHead
        title="What is a UPC Barcode in Music Distribution? | Adventure Records"
        description="Comprehensive guide to Universal Product Codes (UPC/EAN). Learn how UPC barcodes track single, EP, and album releases across digital service providers."
        canonicalUrl="https://music-b2696.web.app/upc"
        structuredData={[articleSchema, faqSchema]}
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="space-y-4 border-b border-white/10 pb-8 text-center sm:text-left">
          <div className="minimal-badge">Technical Guide</div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight">
            What is a UPC Barcode?
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-3xl">
            Everything independent artists need to know about Universal Product Codes (UPC) and EAN barcodes for album, EP, and single release packages.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="minimal-card p-8 bg-[#09090d] space-y-6">
          <h2 className="font-heading font-bold text-xl text-white border-b border-white/10 pb-3">
            ISRC vs. UPC: Key Differences
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-zinc-300 border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-white font-bold">
                  <th className="py-3 px-4">Feature</th>
                  <th className="py-3 px-4 text-amber-400">ISRC Code</th>
                  <th className="py-3 px-4 text-amber-400">UPC Barcode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Full Name</td>
                  <td className="py-3 px-4">International Standard Recording Code</td>
                  <td className="py-3 px-4">Universal Product Code / EAN</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Applies To</td>
                  <td className="py-3 px-4">Individual audio track</td>
                  <td className="py-3 px-4">Entire release product (Single/EP/Album)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Example Code</td>
                  <td className="py-3 px-4 font-mono text-xs">US-S1Z-24-00001</td>
                  <td className="py-3 px-4 font-mono text-xs">198123456789</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Quantity per Release</td>
                  <td className="py-3 px-4">1 ISRC per track (10 songs = 10 ISRCs)</td>
                  <td className="py-3 px-4">1 UPC per overall release package</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Links */}
        <div className="minimal-card p-8 bg-[#09090d] space-y-4">
          <h2 className="font-heading font-bold text-lg text-white">Related Technical Guides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium">
            <Link to="/isrc" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-white flex items-center justify-between">
              <div>
                <p className="font-bold text-white">ISRC Code Guide</p>
                <p className="text-zinc-400 text-xs">Track-level identifiers</p>
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
            <Link to="/pricing" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-white flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Pricing & Plans</p>
                <p className="text-zinc-400 text-xs">Single, EP & Album rates</p>
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

export default UpcGuide;
