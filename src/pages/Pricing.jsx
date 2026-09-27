import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Star, HelpCircle, ChevronDown, Music, Disc, Disc2 } from 'lucide-react';
import SeoHead from '../components/SeoHead';

const pricingPlans = [
  {
    icon: <Music className="w-6 h-6 text-white" />,
    emoji: '🎵',
    name: 'SINGLE',
    price: '₹100',
    period: 'Release',
    subtitle: 'For one-track releases',
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
    icon: <Disc className="w-6 h-6 text-white" />,
    emoji: '💿',
    name: 'EP',
    price: '₹500',
    period: 'Release',
    subtitle: 'For 2–6 track releases',
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
    icon: <Disc2 className="w-6 h-6 text-white" />,
    emoji: '💽',
    name: 'ALBUM',
    price: '₹1,000',
    period: 'Release',
    subtitle: 'For 7+ track releases',
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

const faqs = [
  {
    question: "Do I keep 100% of my music royalties?",
    answer: "Yes, absolutely! Adventure Records takes 0% commission on your digital sales and streams. All royalties collected from Spotify, Apple, and other platforms are passed directly to your account balance."
  },
  {
    question: "Are these one-time payments per release?",
    answer: "Yes! There are no annual recurring fees or hidden account charges. Pay once per release (₹100 for Single, ₹500 for EP, ₹1,000 for Album) and your music stays online."
  },
  {
    question: "Are ISRC and UPC codes included?",
    answer: "Yes, Adventure Records automatically generates GS1-compliant UPC barcodes and ISRC codes for all your releases completely free."
  },
  {
    question: "How long does distribution delivery take?",
    answer: "Our priority express ingestion engine delivers tracks to major digital service providers in 24 to 48 hours."
  }
];

const Pricing = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const breadcrumbs = [
    { name: 'Home', url: 'https://music-b2696.web.app/' },
    { name: 'Pricing', url: 'https://music-b2696.web.app/pricing' }
  ];

  return (
    <div className="relative pt-12 pb-24 overflow-x-hidden min-h-screen bg-[#070709] text-zinc-100 font-outfit">
      
      <SeoHead
        title="Music Distribution Pricing | Single ₹100, EP ₹500, Album ₹1,000 | Adventure Records"
        description="Transparent one-time release pricing for independent music distribution. Single ₹100, EP ₹500, Album ₹1,000 with 0% royalty commission and zero annual fees."
        canonicalUrl="https://music-b2696.web.app/pricing"
        breadcrumbs={breadcrumbs}
      />
      
      {/* Background Lights */}
      <div className="absolute top-20 left-[10%] w-[500px] h-[500px] bg-white/[0.03] blur-[150px] rounded-full pointer-events-none" />

      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12 text-center space-y-4">
        <div className="minimal-badge mx-auto">One-Time Payment Per Release</div>
        <h1 className="font-heading font-black text-4xl sm:text-6xl text-white tracking-tight">
          Distribution Pricing
        </h1>
        <p className="text-zinc-300 text-lg sm:text-xl font-medium max-w-xl mx-auto">
          Release your music. Reach the world.
        </p>
        <p className="text-zinc-400 text-sm max-w-2xl mx-auto leading-relaxed">
          Simple, transparent pricing with one-time payment per release. No hidden renewal fees.
        </p>
      </section>

      {/* Pricing Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {pricingPlans.map((plan, idx) => (
            <div
              key={idx}
              className={`minimal-card p-8 flex flex-col justify-between relative transition-all duration-300 ${
                plan.popular ? 'border-white/40 shadow-2xl bg-[#0d0d14]' : ''
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-white text-black font-extrabold text-[10px] uppercase tracking-widest">
                  Most Popular
                </span>
              )}

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{plan.emoji}</span>
                    <h3 className="font-heading font-black text-2xl text-white tracking-wide">{plan.name}</h3>
                  </div>
                  <p className="text-zinc-400 text-xs font-medium">{plan.subtitle}</p>
                </div>

                <div className="border-b border-white/10 pb-6">
                  <span className="font-heading font-black text-4xl text-white">{plan.price}</span>
                  <span className="text-zinc-400 text-xs font-semibold"> / {plan.period}</span>
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
                  to="/upload"
                  className={`block w-full py-4 rounded-xl font-bold text-center text-xs tracking-wide transition-all ${
                    plan.popular ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {plan.cta} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ⭐ Simple Pricing. No Confusion Banner */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="minimal-card p-8 sm:p-10 bg-[#0c0c12] border-white/20 text-center space-y-6">
          <div className="inline-flex items-center gap-2 text-white font-extrabold text-lg sm:text-xl">
            <Star className="w-5 h-5 fill-white text-white" />
            <span>Simple Pricing. No Confusion.</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <p className="font-heading font-black text-2xl text-white">₹100</p>
              <p className="text-xs text-zinc-400 font-semibold">Single Release</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <p className="font-heading font-black text-2xl text-white">₹500</p>
              <p className="text-xs text-zinc-400 font-semibold">EP Release</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <p className="font-heading font-black text-2xl text-white">₹1,000</p>
              <p className="text-xs text-zinc-400 font-semibold">Album Release</p>
            </div>
          </div>

          <p className="text-xs text-zinc-400 font-medium pt-2">
            One-time distribution fee per release. Keep 100% of your earnings.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t border-white/10 py-20 bg-[#09090d]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="font-heading font-bold text-3xl text-white">
              Pricing FAQs
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="minimal-card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-6 text-left font-semibold text-white text-sm sm:text-base flex justify-between items-center gap-4 hover:text-zinc-300 transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-300 ${openFaq === idx ? 'rotate-180 text-white' : 'text-zinc-500'}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-6 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-white/5 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Pricing;
