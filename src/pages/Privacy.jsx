import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Search, ArrowUp, FileText, Mail, MapPin, Globe, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const privacySections = [
  {
    id: 'privacy-1',
    title: '1. Information We Collect',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-4">
          Depending on how you use our Services, we may collect the following categories of information:
        </p>

        <div className="space-y-4">
          {/* Category A */}
          <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20">
            <h4 className="font-orbitron text-sm font-semibold text-purple-300 mb-2">A. Account Information</h4>
            <p className="text-xs text-gray-400 mb-2">When you create an account, we may collect:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-gray-300">
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-purple-400" /> Full name</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-purple-400" /> Email address</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-purple-400" /> Phone number</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-purple-400" /> Username</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-purple-400" /> Authentication info</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-purple-400" /> Country / Region</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-purple-400" /> Artist name</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-purple-400" /> Label name</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-purple-400" /> Profile information</span>
            </div>
          </div>

          {/* Category B */}
          <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/20">
            <h4 className="font-orbitron text-sm font-semibold text-blue-300 mb-2">B. Music and Release Information</h4>
            <p className="text-xs text-gray-400 mb-2">When you submit music for distribution, we may collect and process:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-gray-300">
              <span>• Audio recordings</span>
              <span>• Album & Single info</span>
              <span>• Song titles & Lyrics</span>
              <span>• Artist & Label names</span>
              <span>• Album artwork</span>
              <span>• Composers & Songwriters</span>
              <span>• Producers & Remixers</span>
              <span>• Featured artists</span>
              <span>• ISRC & UPC/EAN</span>
              <span>• Copyright details</span>
              <span>• Release dates</span>
              <span>• Genre & Language</span>
            </div>
          </div>

          {/* Category C */}
          <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20">
            <h4 className="font-orbitron text-sm font-semibold text-cyan-300 mb-2">C. Payment and Royalty Information</h4>
            <p className="text-xs text-gray-300 mb-2 leading-relaxed">
              If you receive payments through our Services, we may collect information necessary to process payments (payment account details, bank/provider info, tax details, billing details, transaction & royalty history).
            </p>
            <p className="text-xs text-gray-400 italic">Payment information may be processed by authorized third-party payment providers.</p>
          </div>

          {/* Category D */}
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20">
            <h4 className="font-orbitron text-sm font-semibold text-emerald-300 mb-2">D. Identity Verification Information</h4>
            <p className="text-xs text-gray-300 leading-relaxed mb-2">
              Where required for security, payments, fraud prevention, or legal compliance, we may request government-issued identification, date of birth, or verification documents.
            </p>
            <p className="text-xs text-emerald-400 font-medium">
              We will use such information only for legitimate business, security, legal, or verification purposes.
            </p>
          </div>

          {/* Category E */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10">
            <h4 className="font-orbitron text-sm font-semibold text-gray-200 mb-2">E. Technical Information</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              We automatically collect technical data such as IP address, browser type, device type, operating system, location data, pages viewed, login activity, access timestamps, and error diagnostics.
            </p>
          </div>
        </div>
      </>
    )
  },
  {
    id: 'privacy-2',
    title: '2. How We Use Your Information',
    content: (
      <>
        <p className="text-gray-400 font-semibold mb-2">We may use collected information to:</p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-300 mb-4">
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-400 shrink-0" /> Create and manage your account</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-400 shrink-0" /> Provide music distribution services</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-400 shrink-0" /> Deliver Content to third-party stores</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-400 shrink-0" /> Process royalties and payouts</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-400 shrink-0" /> Verify identity and ownership</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-400 shrink-0" /> Detect and prevent artificial streaming</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-400 shrink-0" /> Communicate and provide support</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-400 shrink-0" /> Enforce Terms of Use and legal duties</li>
        </ul>
        <p className="text-gray-400 text-xs italic">
          We may also use aggregated or de-identified information for analytics, research, and service optimization.
        </p>
      </>
    )
  },
  {
    id: 'privacy-3',
    title: '3. Music Distribution and Third-Party Platforms',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          When you use our distribution services, we share appropriate information and Content (audio files, artist name, title, artwork, metadata, lyrics, copyright info, and release identifiers) with selected third-party music platforms.
        </p>
        <p className="text-gray-400 text-xs italic">
          These third-party platforms independently process your information under their own privacy policies. Adventure Records does not control third-party privacy practices.
        </p>
      </>
    )
  },
  {
    id: 'privacy-4',
    title: '4. Payment Processors',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          We use third-party payment processors and financial service providers to verify identity, process transactions, prevent fraud, meet financial regulations, and issue payout disbursements.
        </p>
        <p className="text-purple-300 text-xs font-semibold">
          We do not store complete payment-card information on our own systems when processing is handled by third-party providers.
        </p>
      </>
    )
  },
  {
    id: 'privacy-5',
    title: '5. Cookies and Similar Technologies',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          We use cookies and similar technologies to keep you logged in, remember preferences, maintain security, understand website usage, and analyze traffic.
        </p>
        <p className="text-gray-400 text-xs">
          You can control cookies through browser settings, though disabling certain cookies may affect some features.
        </p>
      </>
    )
  },
  {
    id: 'privacy-6',
    title: '6. Analytics',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          We use analytics tools to observe usage patterns (pages visited, time spent, device info, browser info, technical errors) to continuously improve platform performance and usability.
        </p>
      </>
    )
  },
  {
    id: 'privacy-7',
    title: '7. Communications',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          We may contact you via email or platform notifications for account verification, security alerts, release updates, royalty info, support responses, or policy changes.
        </p>
        <p className="text-gray-400 text-xs">
          You may opt out of non-essential promotional emails, but you cannot opt out of essential service/account communications.
        </p>
      </>
    )
  },
  {
    id: 'privacy-8',
    title: '8. How We Share Information',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3 font-semibold">We may share information with:</p>
        <ul className="list-disc list-inside space-y-2 text-xs text-gray-300 pl-2">
          <li><strong>Service Providers:</strong> Hosting, cloud, payment, identity verification, analytics, and security providers.</li>
          <li><strong>Distribution Platforms:</strong> Streaming services, download stores, and social platforms requested by you.</li>
          <li><strong>Legal Authorities:</strong> When reasonably necessary to comply with law, respond to legal requests, or prevent fraud.</li>
          <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, restructuring, or asset sale.</li>
        </ul>
      </>
    )
  },
  {
    id: 'privacy-9',
    title: '9. We Do Not Sell Personal Information',
    content: (
      <>
        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
          <p className="text-emerald-300 font-bold text-sm mb-1">Strict Commitment</p>
          <p className="text-gray-300 text-xs leading-relaxed">
            We do not sell your personal information as a product to third parties. Information is shared only with service providers and partners necessary to deliver Services, process payments, and distribute music.
          </p>
        </div>
      </>
    )
  },
  {
    id: 'privacy-10',
    title: '10. Data Security',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          We take reasonable technical and organizational measures to safeguard your information against unauthorized access, loss, misuse, alteration, or destruction.
        </p>
        <p className="text-gray-400 text-xs italic">
          You are responsible for keeping your login credentials confidential and notifying us immediately of any unauthorized access.
        </p>
      </>
    )
  },
  {
    id: 'privacy-11',
    title: '11. Data Retention',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          We retain personal data for as long as necessary to provide Services, maintain accounts, process royalties, resolve disputes, comply with financial/legal obligations, and prevent fraud.
        </p>
      </>
    )
  },
  {
    id: 'privacy-12',
    title: '12. Digital Personal Data Protection Act, 2023 (DPDP Act, India) Rights & Compliance',
    content: (
      <>
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 to-purple-950/40 border border-blue-500/30 space-y-3 mb-4">
          <p className="text-blue-300 font-heading font-bold text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" /> Digital Personal Data Protection Act, 2023 (DPDP Act, India)
          </p>
          <p className="text-gray-300 text-xs leading-relaxed">
            Adventure Records is fully compliant with India's <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>. As a Data Principal, you have statutory rights under the Act regarding your personal data processed by Adventure Records (acting as Data Fiduciary):
          </p>
          <ul className="space-y-2 text-xs text-gray-300 pl-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Itemized Notice & Consent (Section 5):</strong> Clear, plain-language notice before collecting personal data for specified music distribution, identity verification, and royalty processing purposes.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Right to Withdraw Consent (Section 6):</strong> You may withdraw your consent for non-essential data processing at any time via your Security Settings console.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Right to Access & Summary (Section 11):</strong> You have the right to obtain a summary of your personal data being processed and the identities of all data processors handling your records.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Right to Correction & Erasure (Section 12):</strong> You may request the correction of inaccurate data or complete erasure of your personal records and account deletion.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Right to Grievance Redressal (Section 13):</strong> Access to our designated Data Protection & Grievance Officer with guaranteed SLA responses within 72 hours.</span>
            </li>
          </ul>
        </div>
      </>
    )
  },

  {
    id: 'privacy-13',
    title: '13. Requesting Deletion of Your Account or Data',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          You may request account or data deletion through our support channels. Deletion may result in account termination, takedown of distributed releases, and loss of access.
        </p>
        <p className="text-gray-400 text-xs">
          Certain data required by law or financial regulations may be retained. Data already delivered to third parties may take additional time for removal.
        </p>
      </>
    )
  },
  {
    id: 'privacy-14',
    title: '14. Children\'s Privacy',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          Our Services are not intended for individuals under applicable legal age without parent/guardian consent. We do not knowingly collect children's personal data improperly.
        </p>
      </>
    )
  },
  {
    id: 'privacy-15',
    title: '15. International Data Transfers',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          Your information may be processed or stored in countries other than your residence, subject to appropriate legal safeguards.
        </p>
      </>
    )
  },
  {
    id: 'privacy-16',
    title: '16. Copyright and Rights-Holder Information',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          Copyright, artist identity, and metadata may be shared with digital stores, collection societies, or rights holders to resolve disputes, copyright claims, or royalty distribution issues.
        </p>
      </>
    )
  },
  {
    id: 'privacy-17',
    title: '17. Fraud Prevention',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          We analyze account, payment, and usage data to detect artificial streaming, payment manipulation, account abuse, and copyright infringement.
        </p>
      </>
    )
  },
  {
    id: 'privacy-18',
    title: '18. Third-Party Links',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          Our platform may contain links to external third-party websites. We are not responsible for their content or privacy practices.
        </p>
      </>
    )
  },
  {
    id: 'privacy-19',
    title: '19. Changes to This Privacy Policy',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          We may update this Privacy Policy from time to time. Material updates will be communicated via website, dashboard, or email. Continued use of Services constitutes acknowledgment of updated terms.
        </p>
      </>
    )
  },
  {
    id: 'privacy-20',
    title: '20. Contact Us',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-4">
          If you have questions, concerns, or requests regarding this Privacy Policy or your personal information, contact us through our official support channels:
        </p>
        <div className="glass-panel p-6 rounded-2xl border-purple-500/20 space-y-4">
          <h4 className="font-orbitron font-bold text-white text-lg">Adventure Records Privacy Helpdesk</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-purple-400 shrink-0" />
              <div>
                <p className="text-gray-400">Website</p>
                <a href="https://adventurerecords.in" target="_blank" rel="noreferrer" className="text-white font-semibold hover:underline">
                  adventurerecords.in
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <p className="text-gray-400">Privacy & Support Email</p>
                <a href="mailto:adventureof693@gmail.com" className="text-white font-semibold hover:underline">
                  adventureof693@gmail.com
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-cyan-400 shrink-0" />
              <div>
                <p className="text-gray-400">Registered Business Address</p>
                <p className="text-white font-semibold">
                  Rode bus Stand Complex, Satna, MP, 485005, India
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  },
  {
    id: 'privacy-21',
    title: '21. Acknowledgment',
    content: (
      <>
        <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 space-y-3">
          <p className="text-white font-semibold text-sm">
            By using Adventure Records, you acknowledge that you have read and understood this Privacy Policy and understand how your information may be collected, used, stored, and shared as described above.
          </p>
          <p className="text-purple-300 text-xs">
            Adventure Records is committed to handling user information responsibly and using personal information only for legitimate business, legal, security, and service-related purposes.
          </p>
        </div>
      </>
    )
  }
];

const Privacy = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState('privacy-1');

  const filteredSections = useMemo(() => {
    if (!searchTerm.trim()) return privacySections;
    const term = searchTerm.toLowerCase();
    return privacySections.filter(
      (sec) =>
        sec.title.toLowerCase().includes(term) ||
        sec.id.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative pt-20 overflow-x-hidden min-h-screen text-gray-200">
      
      {/* Background Glows */}
      <div className="absolute top-40 right-[-10%] w-[500px] h-[500px] bg-purple-500/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-40 left-[-10%] w-[500px] h-[500px] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none" />

      {/* Header Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Lock className="w-4 h-4" /> Data Protection & Trust
        </div>
        <h1 className="font-orbitron font-black text-3xl sm:text-5xl text-white">
          PRIVACY <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">POLICY</span>
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm max-w-2xl mx-auto">
          <strong>Last Updated:</strong> September 1, 2026
        </p>
        <p className="text-gray-300 text-sm max-w-3xl mx-auto leading-relaxed pt-2">
          Welcome to <strong>Adventure Records</strong> (“Adventure Records,” “we,” “us,” or “our”). This Privacy Policy explains how we collect, use, store, disclose, and protect information when you use our website, music distribution platform, applications, and related services (collectively, the “Services”).
        </p>
      </section>

      {/* Search and Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="glass-panel p-4 rounded-2xl border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search Privacy Policy (e.g. Cookies, Security, Royalties)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
            />
          </div>
          <div className="text-xs text-gray-400">
            Showing {filteredSections.length} of {privacySections.length} policy sections
          </div>
        </div>
      </section>

      {/* Main Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Table of Contents Sidebar */}
          <aside className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-28 glass-panel p-5 rounded-3xl border-white/10 max-h-[calc(100vh-140px)] overflow-y-auto space-y-2 text-xs custom-scrollbar">
              <h3 className="font-orbitron font-bold text-white uppercase text-xs tracking-wider mb-3 px-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" /> Policy Index
              </h3>
              {privacySections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl transition-all duration-200 truncate ${
                    activeSection === sec.id
                      ? 'bg-blue-600/30 border border-blue-500/40 text-blue-200 font-semibold'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {sec.title}
                </button>
              ))}
            </div>
          </aside>

          {/* Main Privacy Content */}
          <main className="lg:col-span-8 space-y-6">
            {filteredSections.length === 0 ? (
              <div className="glass-panel p-12 rounded-3xl text-center space-y-4">
                <p className="text-gray-400 text-sm">No policy section matches "{searchTerm}".</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-2 rounded-xl bg-[#585589] hover:bg-[#53527D] text-white text-xs font-semibold"
                >
                  Clear Search Filter
                </button>
              </div>
            ) : (
              filteredSections.map((sec) => (
                <motion.div
                  key={sec.id}
                  id={sec.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3 }}
                  className="glass-panel p-6 sm:p-8 rounded-3xl border-white/5 hover:border-blue-500/30 transition-all scroll-mt-28"
                >
                  <h2 className="font-orbitron font-bold text-lg sm:text-xl text-white mb-4 pb-3 border-b border-white/5">
                    {sec.title}
                  </h2>
                  <div className="text-xs sm:text-sm text-gray-300">
                    {sec.content}
                  </div>
                </motion.div>
              ))
            )}

            {/* Floating Back to top */}
            <div className="flex justify-between items-center pt-8 border-t border-white/5">
              <Link to="/contact" className="text-xs text-blue-400 hover:underline">
                Questions about your privacy data? Contact Support
              </Link>
              <button
                onClick={scrollToTop}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-blue-600 hover:border-blue-500 text-xs text-white transition-all"
              >
                <ArrowUp className="w-3.5 h-3.5" /> Back to Top
              </button>
            </div>
          </main>

        </div>
      </section>

    </div>
  );
};

export default Privacy;
