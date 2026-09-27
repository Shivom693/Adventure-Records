import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, CheckCircle2, ChevronDown, ArrowRight, FileText } from 'lucide-react';
import SeoHead from '../components/SeoHead';

const faqs = [
  {
    question: "Do I retain 100% of my music copyright with Adventure Records?",
    answer: "Yes, absolutely! Adventure Records acts purely as your non-exclusive digital distribution service. You retain 100% legal ownership, copyright, master recording rights, and publishing rights."
  },
  {
    question: "What rights do I need before uploading a song?",
    answer: "You must own or hold explicit written permission/licenses for: 1) Sound master recording, 2) Musical composition/lyrics, 3) Beats/instrumental samples, and 4) Cover artwork graphics."
  },
  {
    question: "What happens if a copyright issue or takedown request occurs?",
    answer: "If unauthorized content, unlicensed samples, or copyright infringement is flagged by streaming stores, Adventure Records will notify you immediately. Takedowns can be executed upon rights holder request."
  }
];

const CopyrightGuide = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const breadcrumbs = [
    { name: 'Home', url: 'https://music-b2696.web.app/' },
    { name: 'Copyright Guide', url: 'https://music-b2696.web.app/copyright' }
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
    'headline': 'Music Copyright and Ownership Guide for Independent Artists | Adventure Records',
    'description': 'Understand sound recording copyrights, master rights, beat licenses, publishing royalties, and how Adventure Records protects artist rights.',
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
    'mainEntityOfPage': 'https://music-b2696.web.app/copyright'
  };

  return (
    <div className="relative pt-12 pb-24 min-h-screen bg-[#070709] text-zinc-100 font-outfit">
      
      <SeoHead
        title="Music Copyright & Master Ownership Guide | Adventure Records"
        description="Learn how music copyright works for independent artists. Retain 100% of your master rights, compositions, beat licensing & royalty payouts with Adventure Records."
        canonicalUrl="https://music-b2696.web.app/copyright"
        structuredData={[articleSchema, faqSchema]}
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="space-y-4 border-b border-white/10 pb-8 text-center sm:text-left">
          <div className="minimal-badge">Legal & Rights Protection</div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight">
            Music Copyright for Independent Artists
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-3xl">
            A plain-language guide to master rights, composition copyrights, sample clearance, and retaining 100% ownership of your catalogue with Adventure Records.
          </p>
        </div>

        {/* Two Copyright Types */}
        <div className="minimal-card p-8 bg-[#09090d] space-y-6">
          <h2 className="font-heading font-bold text-xl text-white border-b border-white/10 pb-3">
            The Two Essential Music Copyrights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
                <Lock className="w-5 h-5" /> <span>1. Sound Recording Copyright ℗</span>
              </div>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                Also known as the <strong>Master Right</strong>. This protects the specific audio recording performance (the actual WAV/MP3 file audio). Independent artists retain 100% of master rights when distributing through Adventure Records.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
                <FileText className="w-5 h-5" /> <span>2. Composition Copyright ©</span>
              </div>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                Also known as <strong>Publishing Right</strong>. This protects the underlying melody, chord progression, and lyrics composed by songwriters and lyricists.
              </p>
            </div>
          </div>
        </div>

        {/* Rights Retention Guarantee */}
        <div className="minimal-card p-8 bg-amber-500/5 border border-amber-500/20 space-y-4">
          <div className="flex items-center gap-3 font-bold text-lg text-white">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <span>Adventure Records Non-Exclusive Guarantee</span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            When you distribute with Adventure Records, you sign a non-exclusive digital distribution agreement. We never own your masters, we never force multi-year contracts, and you are free to request track takedowns or migration whenever you wish.
          </p>
        </div>

        {/* Links */}
        <div className="minimal-card p-8 bg-[#09090d] space-y-4">
          <h2 className="font-heading font-bold text-lg text-white">Explore Additional Guides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium">
            <Link to="/isrc" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-white flex items-center justify-between">
              <div>
                <p className="font-bold text-white">ISRC Guide</p>
                <p className="text-zinc-400 text-xs">Track tracking code</p>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400" />
            </Link>
            <Link to="/upc" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-white flex items-center justify-between">
              <div>
                <p className="font-bold text-white">UPC Guide</p>
                <p className="text-zinc-400 text-xs">Release barcodes</p>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400" />
            </Link>
            <Link to="/free-music-distribution" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-white flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Distribution Guide</p>
                <p className="text-zinc-400 text-xs">Honest pricing guide</p>
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

export default CopyrightGuide;
