import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Music, Star, Zap, Award, ArrowRight, CheckCircle2 } from 'lucide-react';

const featuredArtists = [
  {
    name: 'SHIVOM TRIPATHI',
    genre: 'Hip Hop',
    streams: '20K+',
    image: '/shivom-tripathi.jpg',
    spotifyUrl: 'https://open.spotify.com/artist/439G7qeiwPOXymD0TKanAv',
    quote: 'Adventure Records got my debut EP onto Spotify Editorial Playlists in under 48 hours. Retaining 100% of my earnings is a game changer.'
  },
  {
    name: 'MISFIT ARYA',
    genre: 'AFRO/HIP HOP',
    streams: '8.9K+',
    image: '/misfit-arya.jpg',
    spotifyUrl: 'https://open.spotify.com/artist/2q02mJiPRekSgsmqD10bDT?si=f9R6daQWT7OTb72pe32uUg',
    quote: 'The real-time streaming analytics console gives me exact geographic data on where my tracks are popping off.'
  },
  {
    name: 'AEONE',
    genre: 'Lo-Fi / Hip-Hop',
    streams: '12.5K+',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
    spotifyUrl: 'https://open.spotify.com/artist/0OqX8liVJffnBwoumeVU4R?si=r64ARjmvTMahDnuadmD-vA',
    quote: 'Free ISRC and UPC codes with zero hidden account renewal fees. Adventure Records is the best platform for independent creators.'
  }
];

const artistTools = [
  {
    title: 'Instant Spotify & Apple Artist Verification',
    description: 'Get your blue checkmark on Spotify for Artists and Apple Music for Artists with direct API registration.'
  },
  {
    title: '100% Royalty Retention',
    description: 'Keep every rupee and cent earned from your streams, downloads, and sync licensing.'
  },
  {
    title: 'Smart Release Scheduling',
    description: 'Set custom release dates, pre-save links, and pitch to store editors weeks in advance.'
  },
  {
    title: 'Automated Split Pay',
    description: 'Automatically divide earnings with producers, featured vocalists, and songwriters seamlessly.'
  }
];

const Artists = () => {
  return (
    <div className="relative pt-12 pb-24 overflow-x-hidden min-h-screen">

      {/* Background Ambient Glows */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-purple-600/10 blur-[160px] rounded-full pointer-events-none" />

      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-purple-400" /> Empowering Independent Creators
        </div>
        <h1 className="font-heading font-black text-4xl sm:text-6xl text-white tracking-tight">
          Built for <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Independent Artists</span>
        </h1>
        <p className="text-zinc-400 text-base max-w-2xl mx-auto leading-relaxed">
          From bedroom producers to headlining festival acts, Adventure Records gives you professional distribution tools without taking a cut of your royalties.
        </p>
      </section>

      {/* Featured Artists Roster */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-16">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-2xl text-white">Thriving on Adventure Records</h2>
          <p className="text-zinc-400 text-xs mt-1">Discover artists reaching millions of listeners worldwide.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredArtists.map((artist, idx) => {
            const CardComponent = artist.spotifyUrl ? 'a' : 'div';
            const cardProps = artist.spotifyUrl ? { href: artist.spotifyUrl, target: '_blank', rel: 'noopener noreferrer' } : {};

            return (
              <CardComponent
                key={idx}
                {...cardProps}
                className={`glass-panel glass-panel-hover rounded-3xl overflow-hidden border border-white/10 flex flex-col justify-between transition-all duration-300 ${
                  artist.spotifyUrl ? 'hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.25)] cursor-pointer group' : ''
                }`}
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-heading font-bold text-xl text-white flex items-center gap-1.5 group-hover:text-emerald-300 transition-colors">
                        {artist.name}
                        {artist.spotifyUrl && (
                          <span className="text-[10px] text-emerald-400 font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 ml-1">
                            Spotify ↗
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-purple-400 font-medium">{artist.genre}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-bold text-white">
                      {artist.streams} Streams
                    </span>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-zinc-300 text-xs leading-relaxed italic">
                    "{artist.quote}"
                  </p>
                  {artist.spotifyUrl && (
                    <div className="pt-2">
                      <span className="inline-flex items-center gap-2 text-emerald-400 text-xs font-semibold group-hover:underline">
                        Listen on Spotify ↗
                      </span>
                    </div>
                  )}
                </div>
              </CardComponent>
            );
          })}
        </div>
      </section>

      {/* Artist Tools & Benefits Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <h2 className="font-heading font-bold text-3xl text-white">Everything an Artist Needs</h2>
          <p className="text-zinc-400 text-sm">Professional suite of services tailored specifically for solo acts and bands.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {artistTools.map((tool, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2 hover:border-purple-500/30 transition-all">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0" />
                <h3 className="font-heading font-semibold text-base text-white">{tool.title}</h3>
              </div>
              <p className="text-zinc-400 text-xs pl-8 leading-relaxed">{tool.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8">
        <div className="p-10 rounded-3xl bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-purple-950/40 border border-purple-500/30 space-y-6">
          <h2 className="font-heading font-bold text-3xl text-white">Ready to Join 50,000+ Independent Artists?</h2>
          <p className="text-zinc-300 text-sm max-w-xl mx-auto">
            Upload your tracks today and get delivered to Spotify, Apple Music, JioSaavn, and Wynk in under 24 hours.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all"
          >
            Get Started Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Artists;
