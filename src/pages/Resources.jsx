import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileCode2, HelpCircle, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
import SeoHead from '../components/SeoHead';

const resourcesList = [
  {
    title: 'Free Music Distribution Guide',
    description: 'Comprehensive guide explaining how free distribution works, metadata, audio specs, royalties, and transparent pricing.',
    link: '/free-music-distribution',
    badge: 'Guide'
  },
  {
    title: 'Worldwide Music Distribution',
    description: 'Learn how Adventure Records delivers tracks to Spotify, Apple Music, JioSaavn, Wynk and 150+ stores globally.',
    link: '/music-distribution',
    badge: 'Overview'
  },
  {
    title: 'Independent Artist Guide',
    description: 'Everything DIY artists, solo musicians, and bands need to know to release music with 100% royalty retention.',
    link: '/music-distribution-for-artists',
    badge: 'Artist'
  },
  {
    title: 'Music Distribution in India',
    description: 'Tailored distribution guide for Indian artists with JioSaavn, Wynk, Gaana coverage and INR UPI payments.',
    link: '/music-distribution-india',
    badge: 'India Focus'
  },
  {
    title: 'ISRC Code Guide',
    description: 'Learn how International Standard Recording Codes (ISRC) identify audio recordings and track play royalties.',
    link: '/isrc',
    badge: 'Technical'
  },
  {
    title: 'UPC Barcode Guide',
    description: 'Understand Universal Product Codes (UPC/EAN) for single, EP, and album release packages.',
    link: '/upc',
    badge: 'Technical'
  },
  {
    title: 'Music Copyright & Ownership',
    description: 'Protect your sound recordings, master rights, composition copyrights, and understand non-exclusive agreements.',
    link: '/copyright',
    badge: 'Legal'
  },
  {
    title: 'Single, EP & Album Release Options',
    description: 'Explore one-time release options: Single (₹100), EP (₹500), and Album (₹1,000) with zero recurring fees.',
    link: '/pricing',
    badge: 'Pricing'
  }
];

const Resources = () => {
  const breadcrumbs = [
    { name: 'Home', url: 'https://music-b2696.web.app/' },
    { name: 'Resources', url: 'https://music-b2696.web.app/resources' }
  ];

  return (
    <div className="relative pt-12 pb-24 overflow-x-hidden min-h-screen bg-[#070709] font-outfit">
      
      <SeoHead
        title="Music Distribution Resources & Guides | Adventure Records"
        description="Comprehensive guides on music distribution, ISRC codes, UPC barcodes, music copyright, and release strategies for independent artists."
        canonicalUrl="https://music-b2696.web.app/resources"
        breadcrumbs={breadcrumbs}
      />

      {/* Background Ambient Glows */}
      <div className="absolute top-20 left-10 w-[500px] h-[350px] bg-amber-500/5 blur-[160px] rounded-full pointer-events-none" />

      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 text-center space-y-4">
        <div className="minimal-badge mx-auto">
          <BookOpen className="w-4 h-4 text-amber-400" /> Knowledge Center & Educational Guides
        </div>
        <h1 className="font-heading font-black text-4xl sm:text-6xl text-white tracking-tight">
          Creator Resources & Guides
        </h1>
        <p className="text-zinc-400 text-base max-w-2xl mx-auto leading-relaxed">
          Everything you need to know about releasing music, audio formats, copyright guidelines, barcode rules, and honest distribution.
        </p>
      </section>

      {/* Resources Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {resourcesList.map((res, idx) => (
            <div 
              key={idx}
              className="minimal-card minimal-card-hover p-6 flex flex-col justify-between space-y-4 bg-[#09090d]"
            >
              <div className="space-y-3">
                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                  {res.badge}
                </span>
                <h3 className="font-heading font-bold text-lg text-white pt-1">{res.title}</h3>
                <p className="text-zinc-400 text-xs leading-relaxed">{res.description}</p>
              </div>

              <div className="pt-4">
                <Link
                  to={res.link}
                  className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-semibold text-xs tracking-wide group"
                >
                  Read Guide <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Help Banner */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8">
        <div className="minimal-card p-10 bg-white/5 border border-white/10 space-y-6">
          <HelpCircle className="w-10 h-10 text-amber-400 mx-auto" />
          <h2 className="font-heading font-bold text-2xl text-white">Need Personalized Support?</h2>
          <p className="text-zinc-400 text-sm max-w-xl mx-auto">
            Our support team and AI Assistant are available 24/7 to answer your distribution questions.
          </p>
          <Link
            to="/contact"
            className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm"
          >
            Contact Support Team
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Resources;
