import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Globe, ShieldCheck, BarChart3, Layers, ArrowRight, CheckCircle2, ChevronDown, 
  Disc, Sparkles, Music, Zap, FileText, Check, HelpCircle, User, ArrowUpRight
} from 'lucide-react';
import InteractiveVinyl from '../components/vinyl/InteractiveVinyl';
import SeoHead from '../components/SeoHead';
import shivomImg from '../assets/shivom-tripathi.jpg';
import misfitImg from '../assets/misfit-arya.jpg';

const trustPlatforms = [
  'Spotify', 'Apple Music', 'YouTube Music', 'Amazon Music', 'Instagram', 'TikTok', '150+ Digital Platforms'
];

const coreValues = [
  {
    icon: <Globe className="w-6 h-6 text-white" />,
    title: "Global Distribution",
    description: "Reach major streaming and digital music platforms worldwide with direct API pipeline ingestion."
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-white" />,
    title: "Keep Your Rights",
    description: "Maintain 100% ownership and control of your master recordings, compositions, and catalog."
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-white" />,
    title: "Royalty Management",
    description: "Track your stream performance and manage transparent music revenue payouts directly to your bank account."
  },
  {
    icon: <Layers className="w-6 h-6 text-white" />,
    title: "Release Management",
    description: "Manage metadata, artwork, ISRCs, UPCs and release scheduling in one centralized creator dashboard."
  }
];

const processSteps = [
  {
    step: "01",
    title: "Create Your Release",
    desc: "Upload your high-fidelity audio WAV files, artwork, and release metadata."
  },
  {
    step: "02",
    title: "Review Your Music",
    desc: "Verify your release information, rights ownership, and automated ISRC/UPC barcodes."
  },
  {
    step: "03",
    title: "We Distribute",
    desc: "Your release is delivered rapidly to supported digital platforms worldwide."
  },
  {
    step: "04",
    title: "Track & Earn",
    desc: "Monitor streaming analytics and collect 100% of your earned royalties."
  }
];

const pricingPlans = [
  {
    name: 'SINGLE',
    price: '₹100',
    period: 'Release',
    description: 'For one-track releases',
    features: [
      'Worldwide digital distribution',
      'Release delivery to supported platforms',
      'ISRC support',
      'UPC/EAN support',
      'Release metadata management',
      'Basic release analytics'
    ],
    cta: 'Release a Single',
    popular: false
  },
  {
    name: 'EP',
    price: '₹500',
    period: 'Release',
    description: 'For 2–6 track releases',
    features: [
      'Worldwide digital distribution',
      'Release delivery to supported platforms',
      'ISRC support',
      'UPC/EAN support',
      'Complete metadata management',
      'Release analytics',
      'Catalog management'
    ],
    cta: 'Distribute Your EP',
    popular: true
  },
  {
    name: 'ALBUM',
    price: '₹1,000',
    period: 'Release',
    description: 'For 7+ track releases',
    features: [
      'Worldwide digital distribution',
      'Release delivery to supported platforms',
      'ISRC support',
      'UPC/EAN support',
      'Complete metadata management',
      'Release analytics',
      'Catalog management'
    ],
    cta: 'Distribute Your Album',
    popular: false
  }
];

const testimonials = [
  {
    quote: "Adventure Records made releasing my debut album feel seamless, transparent, and completely effortless.",
    author: "Shivom Tripathi",
    role: "Singer & Vocalist",
    image: shivomImg
  },
  {
    quote: "Keeping 100% of my royalties while accessing real-time daily streaming analytics transformed how I manage my independent catalog.",
    author: "Misfit Arya",
    role: "Afro & Electronic Producer",
    image: misfitImg
  },
  {
    quote: "The metadata management and automated ISRC generation saved our record label hundreds of hours of manual work.",
    author: "AEONE",
    role: "Independent Artist & Imprint Founder",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80"
  }
];

const resourcesList = [
  { title: "How Music Distribution Works", desc: "A complete guide to digital ingestion, store delivery, and streaming stores.", link: "/resources" },
  { title: "ISRC vs UPC: What's the Difference?", desc: "Learn how track ISRCs and product UPCs identify your music globally.", link: "/upc-isrc-rules" },
  { title: "How to Prepare Your Release", desc: "Audio format specifications, artwork guidelines, and submission checklists.", link: "/resources" },
  { title: "Understanding Music Royalties", desc: "How streaming revenue, mechanical royalties, and sync earnings are collected.", link: "/resources" },
  { title: "Music Distribution Checklist", desc: "Step-by-step checklist to ensure your release is approved without delays.", link: "/resources" }
];

const faqs = [
  { q: "What is music distribution?", a: "Music distribution is the process of getting your recorded music onto digital platforms like Spotify, Apple Music, YouTube Music, and Amazon Music so fans worldwide can stream and buy your tracks." },
  { q: "How long does distribution take?", a: "Standard ingestion takes 3 to 5 business days. Our priority express engine delivers releases to major digital service providers in 24 to 48 hours." },
  { q: "Do I keep ownership of my music?", a: "Yes, 100%! Adventure Records never takes ownership of your master recordings or publishing rights. You retain 100% control of your catalog." },
  { q: "What is an ISRC?", a: "An ISRC (International Standard Recording Code) is a unique 12-character identifier assigned to individual audio tracks to track sound recording plays and royalties worldwide." },
  { q: "What is a UPC?", a: "A UPC (Universal Product Code) is a unique barcode number assigned to an entire album, EP, or single release product." },
  { q: "Can I move my catalog from another distributor?", a: "Yes. Upload your tracks using the exact same ISRC and UPC barcodes and metadata to preserve stream counts and playlist placements." },
  { q: "How do royalties work?", a: "Earnings collected from digital streaming stores are credited directly to your account. You can request payouts directly to your bank account with zero commission cuts." },
  { q: "Can labels use Adventure Records?", a: "Yes! Our Label Plan supports multi-artist rosters, custom record label branding, automated revenue splits, and team access permissions." },
  { q: "What happens if my release is rejected?", a: "Our curation team reviews metadata to ensure store compliance. If any issue arises (such as low artwork resolution or missing rights), you will receive exact guidance to fix and resubmit." },
  { q: "Can I remove my release?", a: "Yes, you can request a release takedown at any time from your Artist Dashboard." }
];

const Home = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'Adventure Records',
    'url': 'https://music-b2696.web.app/',
    'logo': 'https://music-b2696.web.app/logo.png',
    'sameAs': []
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'Adventure Records',
    'url': 'https://music-b2696.web.app/',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': 'https://music-b2696.web.app/resources?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.a
      }
    }))
  };

  return (
    <div className="relative pt-12 overflow-x-hidden min-h-screen bg-[#070709] text-zinc-100 font-outfit">
      
      <SeoHead
        title="Adventure Records | Music Distribution for Artists"
        description="Music distribution and release management for independent artists. Distribute your singles, EPs, and albums to Spotify, Apple Music, JioSaavn, Wynk & 150+ stores."
        canonicalUrl="https://music-b2696.web.app/"
        structuredData={[orgSchema, websiteSchema, faqSchema]}
      />

      {/* Glow Ambient Lights */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-white/[0.03] blur-[180px] rounded-full pointer-events-none" />

      {/* 1. HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 md:pt-20 md:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Content */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left z-10">
            <div className="space-y-3">
              <p className="text-xs sm:text-sm uppercase tracking-[0.3em] font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full w-fit mx-auto lg:mx-0 shadow-sm flex items-center gap-2">
                <Disc className="w-4 h-4 animate-spin-slow text-amber-400" />
                ADVENTURE RECORDS
              </p>
              <div className="minimal-badge">
                <Sparkles className="w-3.5 h-3.5 text-white" /> Professional Music Distribution
              </div>
            </div>

            <h1 className="font-heading font-black text-5xl sm:text-7xl lg:text-8xl tracking-tight leading-[1.04] text-white">
              Adventure Records
            </h1>

            <p className="text-zinc-400 text-base sm:text-xl max-w-xl leading-relaxed mx-auto lg:mx-0 font-normal">
              Music distribution and release management for independent artists.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/signup"
                className="btn-primary px-8 py-4 rounded-xl text-base font-semibold flex items-center gap-2"
              >
                Start Distributing <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/distribution"
                className="btn-secondary px-8 py-4 rounded-xl text-base font-semibold"
              >
                Explore Distribution
              </Link>
            </div>
          </div>

          {/* Right Visual: Interactive 3D Vinyl Record */}
          <div className="lg:col-span-5 flex justify-center items-center relative z-10 w-full">
            <InteractiveVinyl />
          </div>

        </div>
      </section>

      {/* 2. TRUST BAR */}
      <section className="border-y border-white/10 bg-[#0a0a0e]/60 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">
            Built for independent artists, producers and labels.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
            {trustPlatforms.map((plat, idx) => (
              <span 
                key={idx}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-300 font-medium hover:border-white/20 transition-all"
              >
                {plat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CORE VALUE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="minimal-badge">Core Value Platform</div>
          <h2 className="font-heading font-bold text-3xl sm:text-5xl text-white">
            Everything you need to release music.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {coreValues.map((val, idx) => (
            <div
              key={idx}
              className="minimal-card minimal-card-hover p-8 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="p-3 bg-white/5 rounded-xl w-fit border border-white/10">
                  {val.icon}
                </div>
                <h3 className="font-heading font-bold text-lg text-white">
                  {val.title}
                </h3>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  {val.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="border-t border-white/10 bg-[#09090d] py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-3">
            <div className="minimal-badge">Streamlined Workflow</div>
            <h2 className="font-heading font-bold text-3xl sm:text-5xl text-white">
              From upload to worldwide release.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {processSteps.map((st, idx) => (
              <div key={idx} className="space-y-4 relative">
                <span className="font-heading font-black text-4xl text-zinc-600 block">
                  {st.step}
                </span>
                <h3 className="font-heading font-bold text-xl text-white">
                  {st.title}
                </h3>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FEATURE SECTION (SPLIT LAYOUT) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 border-t border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Abstract Visual */}
          <div className="lg:col-span-6 rounded-3xl bg-[#0b0b10] border border-white/10 p-8 sm:p-12 relative overflow-hidden flex flex-col justify-center min-h-[380px]">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
            <div className="space-y-6 z-10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-semibold text-white uppercase tracking-wider">Audio Processing Engine</span>
              </div>
              <div className="h-20 flex items-center justify-between gap-1 border-y border-white/10 py-4">
                {[40, 70, 30, 85, 50, 95, 60, 45, 80, 100, 75, 55, 90, 65, 35, 80].map((h, i) => (
                  <div 
                    key={i} 
                    className="w-1.5 bg-white/70 rounded-full animate-pulse" 
                    style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }} 
                  />
                ))}
              </div>
              <p className="text-xs text-zinc-400">Official GS1-Compliant ISRC & UPC Validation • 24-Bit 44.1kHz WAV Ingestion</p>
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="minimal-badge">Modern Infrastructure</div>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-white">
              Built around your music.
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Adventure Records gives independent artists the tools to distribute music professionally without unnecessary complexity.
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-zinc-300 font-medium">
              {[
                "Worldwide digital distribution",
                "ISRC & UPC support",
                "Release management",
                "Royalty reporting",
                "Artist and label tools",
                "Catalog management"
              ].map((feat, fIdx) => (
                <li key={fIdx} className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/5">
                  <Check className="w-4 h-4 text-white shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4">
              <Link to="/distribution" className="btn-secondary px-8 py-3.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
                Learn More <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 6. ARTIST-FIRST SECTION */}
      <section className="border-t border-white/10 bg-[#09090e] py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="minimal-badge">Artist Ownership</div>
            <h2 className="font-heading font-bold text-3xl sm:text-5xl text-white">
              Your catalog. Your identity. Your career.
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Adventure Records is built to give independent artists and labels more control over how their music is released, managed and monetized.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="minimal-card p-8 space-y-3">
              <h3 className="font-heading font-bold text-xl text-white">Control</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Manage your releases, custom release dates, and master catalog with full independence.
              </p>
            </div>
            <div className="minimal-card p-8 space-y-3">
              <h3 className="font-heading font-bold text-xl text-white">Transparency</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Understand your distribution status, geographic heatmaps, and clear royalty statements.
              </p>
            </div>
            <div className="minimal-card p-8 space-y-3">
              <h3 className="font-heading font-bold text-xl text-white">Growth</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Build a sustainable music career with professional distribution tools and YouTube Content ID protection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PRICING SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="minimal-badge">Simple Pricing</div>
          <h2 className="font-heading font-bold text-3xl sm:text-5xl text-white">
            Simple distribution. No unnecessary complexity.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {pricingPlans.map((plan, idx) => (
            <div
              key={idx}
              className={`minimal-card p-8 flex flex-col justify-between relative transition-all duration-300 ${
                plan.popular ? 'border-white/40 shadow-2xl bg-[#0d0d14]' : ''
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white text-black font-bold text-[10px] uppercase tracking-widest">
                  Most Popular
                </span>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="font-heading font-bold text-xl text-white">{plan.name}</h3>
                  <p className="text-zinc-400 text-xs mt-1">{plan.description}</p>
                </div>

                <div className="border-b border-white/10 pb-6">
                  <span className="font-heading font-extrabold text-3xl text-white">{plan.price}</span>
                  <span className="text-zinc-500 text-xs"> / {plan.period}</span>
                </div>

                <ul className="space-y-3 text-xs text-zinc-300">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-white shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <Link
                  to={plan.name === 'LABEL' ? '/contact' : '/signup'}
                  className={`block w-full py-3.5 rounded-xl font-semibold text-center text-xs transition-all ${
                    plan.popular ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>



      {/* 9. DISTRIBUTION NETWORK */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="minimal-badge">Global Network</div>
          <h2 className="font-heading font-bold text-3xl sm:text-5xl text-white">
            One release. A world of listeners.
          </h2>
        </div>

        <div className="max-w-4xl mx-auto minimal-card p-10 bg-[#09090e] border-white/15 text-center space-y-8">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {['Streaming', 'Social Platforms', 'Download Stores', 'Content ID Fingerprinting', 'Digital Outlets'].map((cat, idx) => (
              <span key={idx} className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-zinc-200">
                {cat}
              </span>
            ))}
          </div>
          <p className="text-zinc-400 text-xs max-w-xl mx-auto leading-relaxed">
            Direct ingestion API pipelines deliver your metadata and audio files into major digital infrastructure hubs automatically.
          </p>
        </div>
      </section>

      {/* 10. ISRC / UPC SECTION */}
      <section className="border-t border-white/10 bg-[#09090d] py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="minimal-badge">Metadata Infrastructure</div>
            <h2 className="font-heading font-bold text-3xl sm:text-5xl text-white">
              Professional metadata, handled properly.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="minimal-card p-8 space-y-3">
              <h3 className="font-heading font-bold text-xl text-white">ISRC</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Identify individual sound recordings with GS1-compliant codes to track plays and collect mechanical royalties.
              </p>
            </div>
            <div className="minimal-card p-8 space-y-3">
              <h3 className="font-heading font-bold text-xl text-white">UPC / EAN</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Identify complete release products (singles, EPs, albums) for global commercial tracking.
              </p>
            </div>
            <div className="minimal-card p-8 space-y-3">
              <h3 className="font-heading font-bold text-xl text-white">Metadata</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Keep artist, track, contributor, copyright line, and release information perfectly organized across stores.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link to="/upc-isrc-rules" className="btn-secondary px-8 py-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2">
              Learn About ISRC & UPC <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 11. ARTIST TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="minimal-badge">Creator Feedback</div>
          <h2 className="font-heading font-bold text-3xl sm:text-5xl text-white">
            Made for independent music.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div key={idx} className="minimal-card p-8 flex flex-col justify-between space-y-6">
              <p className="text-zinc-300 text-xs leading-relaxed italic">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3">
                {t.image && (
                  <img 
                    src={t.image} 
                    alt={t.author} 
                    className="w-10 h-10 rounded-full object-cover object-top border border-white/20 shrink-0" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/shivom-tripathi.jpg';
                    }}
                  />
                )}
                <div>
                  <p className="font-heading font-bold text-sm text-white">{t.author}</p>
                  <p className="text-[10px] text-zinc-400 font-medium">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 12. RESOURCES SECTION */}
      <section className="border-t border-white/10 bg-[#09090d] py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="minimal-badge">Knowledge Hub</div>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-white mt-2">
                Resources for independent artists.
              </h2>
            </div>
            <Link to="/resources" className="btn-secondary px-6 py-3 rounded-xl text-xs font-semibold">
              View All Resources
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resourcesList.slice(0, 3).map((res, idx) => (
              <Link key={idx} to={res.link} className="minimal-card minimal-card-hover p-8 space-y-4 block group">
                <h3 className="font-heading font-bold text-lg text-white group-hover:text-zinc-300 transition-colors flex items-center justify-between">
                  <span>{res.title}</span>
                  <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                </h3>
                <p className="text-zinc-400 text-xs leading-relaxed">{res.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 13. FAQ SECTION */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-28 border-t border-white/10">
        <div className="text-center mb-16 space-y-3">
          <div className="minimal-badge">FAQ</div>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="minimal-card overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-6 text-left font-semibold text-white text-sm sm:text-base flex justify-between items-center gap-4 hover:text-zinc-300 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-300 ${openFaq === idx ? 'rotate-180 text-white' : 'text-zinc-500'}`} />
              </button>
              {openFaq === idx && (
                <div className="px-6 pb-6 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-white/5 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 14. FINAL CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="minimal-card p-12 sm:p-16 text-center space-y-6 relative overflow-hidden bg-[#0d0d14] border-white/20">
          <h2 className="font-heading font-bold text-3xl sm:text-5xl text-white">
            Ready to release your next record?
          </h2>
          <p className="text-zinc-400 text-sm max-w-xl mx-auto leading-relaxed">
            Get your music where your listeners are.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link to="/signup" className="btn-primary px-8 py-4 rounded-xl text-sm font-semibold">
              Start Distributing
            </Link>
            <Link to="/contact" className="btn-secondary px-8 py-4 rounded-xl text-sm font-semibold">
              Talk to Us
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
