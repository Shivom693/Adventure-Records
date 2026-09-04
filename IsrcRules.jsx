import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Disc, FileText, Search, ArrowUp, CheckCircle, Mail, MapPin, Globe, AlertTriangle, ListChecks, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const isrcSections = [
  {
    id: 'isrc-1',
    title: '1. What Is an ISRC?',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          <strong>ISRC (International Standard Recording Code)</strong> is a unique identifier used to identify an individual sound recording or music video recording.
        </p>
        <p className="text-purple-300 text-xs font-semibold mb-3">
          An ISRC identifies the <u>recording itself</u>, not the artist, songwriter, composition, album, or product.
        </p>
        <p className="text-gray-300 text-xs leading-relaxed mb-4">
          Each distinct recording should have one unique ISRC, and an ISRC must not be reused for another recording.
        </p>
        
        {/* Example Box */}
        <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 space-y-2">
          <p className="text-xs text-purple-400 font-bold uppercase tracking-wider">Example Usage</p>
          <p className="text-xs text-gray-300">A studio recording of: <strong>Artist:</strong> Shiv Om | <strong>Track:</strong> Example Song</p>
          <div className="p-2.5 rounded-xl bg-black/40 font-mono text-xs text-purple-300 border border-purple-500/30 w-fit">
            ISRC: IN-XXX-26-00001
          </div>
          <p className="text-[11px] text-gray-400">
            The same recording should continue using that ISRC even if it is distributed through different platforms or territories.
          </p>
        </div>
      </>
    )
  },
  {
    id: 'isrc-2',
    title: '2. ISRC Rules',
    content: (
      <>
        <div className="space-y-4 text-xs sm:text-sm">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <h4 className="font-orbitron font-semibold text-white text-xs mb-1">Rule 1 — One ISRC Per Recording</h4>
            <p className="text-gray-300">Each distinct sound recording must have its own ISRC. You must not assign the same ISRC to two different recordings.</p>
          </div>

          <div className="p-4 rounded-2xl bg-yellow-950/20 border border-yellow-500/20">
            <h4 className="font-orbitron font-semibold text-yellow-300 text-xs mb-1">Rule 2 — Do Not Create a New ISRC for the Same Recording</h4>
            <p className="text-gray-300 mb-2">If a recording already has a valid ISRC and the recording has not materially changed, the existing ISRC should be used.</p>
            <p className="text-gray-400 text-xs">Do not create another ISRC simply because you changed distributor, changed label, changed country, re-uploaded, or transferred ownership.</p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/20">
            <h4 className="font-orbitron font-semibold text-blue-300 text-xs mb-1">Rule 3 — New Version May Require a New ISRC</h4>
            <p className="text-gray-300 mb-2">A materially different recording requires a new ISRC (e.g. new recording, new mix, different edit, different playing time, new edit, remix, or changed master).</p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20">
            <h4 className="font-orbitron font-semibold text-purple-300 text-xs mb-1">Rule 4 — Remixes</h4>
            <p className="text-gray-300 mb-2">A remix that constitutes a different recording should receive a separate ISRC.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                <span className="text-gray-400">Original:</span> Example Song<br />
                <span className="text-purple-400">ISRC:</span> IN-XXX-26-00001
              </div>
              <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                <span className="text-gray-400">Remix:</span> Example Song (Remix)<br />
                <span className="text-purple-400">ISRC:</span> IN-XXX-26-00002
              </div>
            </div>
          </div>
        </div>
      </>
    )
  },
  {
    id: 'isrc-3',
    title: '3. ISRC for Music Videos',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          A music video is considered a different recording from its associated sound recording.
        </p>
        <div className="flex flex-wrap gap-4 text-xs font-mono mb-2">
          <span className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300">Audio Recording → One ISRC</span>
          <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300">Music Video → Separate ISRC</span>
        </div>
        <p className="text-gray-400 text-xs">The audio ISRC should not simply be reused as the music-video ISRC.</p>
      </>
    )
  },
  {
    id: 'isrc-4',
    title: '4. ISRC and Ownership',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          ISRC assignment is normally the responsibility of the recording owner or an authorized ISRC Manager. A distributor may assign ISRCs on behalf of rights holders where properly authorized.
        </p>
        <p className="text-red-400 font-semibold text-xs">
          If you are not the owner or authorized representative of a recording, you must not create a new ISRC for that recording.
        </p>
      </>
    )
  },
  {
    id: 'isrc-5',
    title: '5. ISRC Format',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          An ISRC consists of <strong>12 alphanumeric characters</strong> structured as:
        </p>
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-center font-mono text-base text-purple-400 mb-3 tracking-widest">
          ISRC AA-6QZ-26-00001
        </div>
        <p className="text-gray-400 text-xs italic">
          Prefix Code + Year of Reference + Designation Code. Do not create random prefixes; prefixes are allocated through official ISRC agencies.
        </p>
      </>
    )
  },
  {
    id: 'isrc-6',
    title: '6. Existing ISRC',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          If your recording has already been released, check whether it already has an identifier. If unchanged, use the existing ISRC rather than creating a duplicate.
        </p>
        <p className="text-gray-400 text-xs">
          Adventure Records may request supporting documentation if an existing ISRC appears to conflict.
        </p>
      </>
    )
  },
  {
    id: 'isrc-7',
    title: '7. What Is UPC / EAN / GTIN?',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          UPC, EAN, and GTIN identifiers are used to identify <strong>products/releases</strong> (albums, EPs, singles), whereas ISRCs identify individual tracks within that release.
        </p>
      </>
    )
  },
  {
    id: 'isrc-8',
    title: '8. UPC/EAN Rules',
    content: (
      <>
        <div className="space-y-3 text-xs">
          <p><strong>Rule 1 — Release-Level Identifier:</strong> Album: "My First Album" → UPC: 123456789012. Tracks inside have individual ISRCs.</p>
          <p><strong>Rule 2 — Do Not Reuse UPC:</strong> Do not reuse a UPC/EAN/GTIN for an unrelated release.</p>
          <p><strong>Rule 3 — Existing UPC:</strong> Provide existing UPC/EAN when switching distributors.</p>
          <p><strong>Rule 4 — Single Releases:</strong> Release → UPC/EAN/GTIN | Track Inside → ISRC.</p>
          <p><strong>Rule 5 — Albums & EPs:</strong> Album gets one UPC; each track gets its own unique ISRC.</p>
        </div>
      </>
    )
  },
  {
    id: 'isrc-9',
    title: '9. ISRC vs UPC/EAN Comparison',
    content: (
      <>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-purple-300 font-orbitron">
                <th className="py-2.5 px-3">Identifier</th>
                <th className="py-2.5 px-3">Identifies</th>
                <th className="py-2.5 px-3">Example Use</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              <tr>
                <td className="py-2 px-3 font-bold text-purple-400">ISRC</td>
                <td className="py-2 px-3">Individual recording</td>
                <td className="py-2 px-3">Song / music video</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-blue-400">UPC / EAN / GTIN</td>
                <td className="py-2 px-3">Product / release</td>
                <td className="py-2 px-3">Single / EP / Album</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-center font-orbitron font-bold text-xs text-white">
          ISRC = Track &nbsp;|&nbsp; UPC/EAN/GTIN = Release
        </div>
      </>
    )
  },
  {
    id: 'isrc-10',
    title: '10. Metadata Must Match',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          Metadata (ISRC, UPC, Artist, Track Title, Version, Duration, Release Date, Copyright) must correspond accurately.
        </p>
      </>
    )
  },
  {
    id: 'isrc-11',
    title: '11. Duplicate or Incorrect ISRC',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          Releases with invalid, duplicated, or manipulated ISRCs may be flagged, delayed, or rejected.
        </p>
      </>
    )
  },
  {
    id: 'isrc-12',
    title: '12. Duplicate or Incorrect UPC/EAN',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          Releases with reused or mismatched UPC/EAN codes will be delayed or rejected.
        </p>
      </>
    )
  },
  {
    id: 'isrc-13',
    title: '13. Distributor-Assigned ISRC',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          Where Adventure Records assigns ISRCs, we do so on behalf of rights holders. ISRC assignment identifies recordings but does not establish copyright ownership.
        </p>
      </>
    )
  },
  {
    id: 'isrc-14',
    title: '14. Previously Released Music',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          Moving catalog from another distributor? <strong>Do not create new ISRCs!</strong> Provide existing ISRCs to preserve stream stats and track continuity.
        </p>
      </>
    )
  },
  {
    id: 'isrc-15',
    title: '15. Re-Releases',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          Re-releasing identical recordings retains original ISRCs. A new UPC is used if it forms a new album package.
        </p>
      </>
    )
  },
  {
    id: 'isrc-16',
    title: '16. Incorrect Information',
    content: (
      <>
        <p className="text-red-400 text-xs font-semibold">
          Submitting false identifiers results in release rejection, revenue withholding, or account termination.
        </p>
      </>
    )
  },
  {
    id: 'isrc-17',
    title: '17. Artist Responsibility',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          By submitting releases, you confirm all provided codes are accurate, authorized, and non-duplicate.
        </p>
      </>
    )
  },
  {
    id: 'isrc-18',
    title: '18. Adventure Records Review Rights',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          Adventure Records reserves rights to inspect identifiers and request verification documentation prior to ingestion.
        </p>
      </>
    )
  },
  {
    id: 'isrc-19',
    title: '19. Submission Checklist',
    content: (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 space-y-2">
            <h4 className="font-orbitron font-bold text-purple-300 flex items-center gap-2">
              <ListChecks className="w-4 h-4" /> ISRC Checklist
            </h4>
            <ul className="space-y-1 text-gray-300">
              <li>☐ Does each recording have the correct ISRC?</li>
              <li>☐ Is the ISRC assigned to the same recording?</li>
              <li>☐ Are you authorized to use it?</li>
              <li>☐ Have you avoided creating a duplicate ISRC?</li>
              <li>☐ Does ISRC match the correct audio file?</li>
            </ul>
          </div>
          <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/20 space-y-2">
            <h4 className="font-orbitron font-bold text-blue-300 flex items-center gap-2">
              <ListChecks className="w-4 h-4" /> UPC/EAN Checklist
            </h4>
            <ul className="space-y-1 text-gray-300">
              <li>☐ Does the release have the correct release identifier?</li>
              <li>☐ Does the identifier belong to this release?</li>
              <li>☐ Have you avoided reusing another release's code?</li>
              <li>☐ Is the release metadata accurate?</li>
            </ul>
          </div>
        </div>
      </>
    )
  },
  {
    id: 'isrc-20',
    title: '20. Golden Rule',
    content: (
      <>
        <div className="p-6 rounded-2xl bg-gradient-to-r from-red-900/30 to-purple-900/30 border border-red-500/30 space-y-2 text-center">
          <h4 className="font-orbitron font-bold text-red-400 text-sm">GOLDEN RULE</h4>
          <p className="text-white font-bold text-sm">
            Never create a new ISRC just because you changed your distributor.
          </p>
          <p className="text-gray-300 text-xs">
            If the recording is the same, the existing ISRC should generally remain the same.
          </p>
        </div>
      </>
    )
  },
  {
    id: 'isrc-21',
    title: '21. Contact Support',
    content: (
      <>
        <div className="glass-panel p-6 rounded-2xl border-purple-500/20 space-y-4">
          <h4 className="font-orbitron font-bold text-white text-lg">Adventure Records Code Verification Desk</h4>
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
                <p className="text-gray-400">Email Support</p>
                <a href="mailto:adventureof693@gmail.com" className="text-white font-semibold hover:underline">
                  adventureof693@gmail.com
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-cyan-400 shrink-0" />
              <div>
                <p className="text-gray-400">Office Address</p>
                <p className="text-white font-semibold">
                  Rode bus Stand Complex, Satna, MP, 485005, India
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }
];

const IsrcRules = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState('isrc-1');

  const filteredSections = useMemo(() => {
    if (!searchTerm.trim()) return isrcSections;
    const term = searchTerm.toLowerCase();
    return isrcSections.filter(
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
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Disc className="w-4 h-4" /> Identifier Guidelines
        </div>
        <h1 className="font-orbitron font-black text-3xl sm:text-5xl text-white">
          UPC / ISRC <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">RULES</span>
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm max-w-2xl mx-auto">
          <strong>Last Updated:</strong> September 1, 2026
        </p>
        <p className="text-gray-300 text-sm max-w-3xl mx-auto leading-relaxed pt-2">
          At <strong>Adventure Records</strong>, accurate identifiers are an important part of music distribution. This policy explains the rules for <strong>ISRC</strong> and <strong>UPC/EAN/GTIN</strong> codes when submitting music for distribution.
        </p>
      </section>

      {/* Search Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="glass-panel p-4 rounded-2xl border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search code rules (e.g. Remix, Video, Format)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
            />
          </div>
          <div className="text-xs text-gray-400">
            Showing {filteredSections.length} of {isrcSections.length} rules sections
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
                <FileText className="w-4 h-4 text-purple-400" /> Rules Index
              </h3>
              {isrcSections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl transition-all duration-200 truncate ${
                    activeSection === sec.id
                      ? 'bg-purple-600/30 border border-purple-500/40 text-purple-200 font-semibold'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {sec.title}
                </button>
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-8 space-y-6">
            {filteredSections.length === 0 ? (
              <div className="glass-panel p-12 rounded-3xl text-center space-y-4">
                <p className="text-gray-400 text-sm">No rules section matches "{searchTerm}".</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold"
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
                  className="glass-panel p-6 sm:p-8 rounded-3xl border-white/5 hover:border-purple-500/30 transition-all scroll-mt-28"
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

            {/* Back to top */}
            <div className="flex justify-between items-center pt-8 border-t border-white/5">
              <Link to="/contact" className="text-xs text-purple-400 hover:underline">
                Questions about code identifiers? Contact Support
              </Link>
              <button
                onClick={scrollToTop}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-purple-600 hover:border-purple-500 text-xs text-white transition-all"
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

export default IsrcRules;
