import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Play, Users, CircleDollarSign, Landmark, Upload, 
  ShieldCheck, Smartphone, Eye, CheckCircle, Info, Send, 
  ShieldAlert, UserCheck, KeyRound, Clock, Laptop, FileText, AlertCircle, RefreshCw, MessageSquare,
  Disc
} from 'lucide-react';
import { auth, db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { 
  fetchUserReleases, fetchUserRoyalties, fetchUserPayouts, 
  fetchUserTickets, submitSupportTicket, requestPayoutFirestore 
} from '../services/dataService';
import { API_URL } from '../config';

const Dashboard = () => {
  const { user: contextUser, authLoading } = useAuth();
  const [user, setUser] = useState(null);
  const [releases, setReleases] = useState([]);
  const [royalties, setRoyalties] = useState({ totalEarnings: 0, totalStreams: 0, items: [] });
  const [payouts, setPayouts] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('analytics');

  // Payout Request Modal
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('UPI / Bank Transfer');
  const [accountDetails, setAccountDetails] = useState('');
  const [payoutModal, setPayoutModal] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState('');
  const [payoutError, setPayoutError] = useState('');
  const [submittingPayout, setSubmittingPayout] = useState(false);

  // New Ticket State
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('General Support');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState('');
  const [ticketError, setTicketError] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);

  // Edit Profile State
  const [profileData, setProfileData] = useState({
    artistName: '',
    fullName: '',
    phone: '',
    genre: 'Pop',
    bio: '',
    spotifyUrl: '',
    instagramUrl: ''
  });
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const navigate = useNavigate();

  const loadDashboardData = async () => {
    try {
      let currentUser = contextUser;
      if (!currentUser) {
        const storedUserStr = localStorage.getItem('user');
        if (storedUserStr) {
          try { currentUser = JSON.parse(storedUserStr); } catch (e) {}
        }
      }

      if (!currentUser) {
        setLoading(false);
        return;
      }

      setUser(currentUser);
      
      // Initialize profile fields
      setProfileData({
        artistName: currentUser.artistName || currentUser.displayName || '',
        fullName: currentUser.name || currentUser.fullName || '',
        phone: currentUser.phone || '',
        genre: currentUser.genre || 'Pop',
        bio: currentUser.bio || '',
        spotifyUrl: currentUser.spotifyUrl || '',
        instagramUrl: currentUser.instagramUrl || ''
      });

      const uid = currentUser?.uid || currentUser?.id || auth?.currentUser?.uid;

      if (uid) {
        // Run all queries concurrently with timeouts
        const [userReleases, userRoyalties, userPayouts, userTickets] = await Promise.all([
          fetchUserReleases(uid).catch(() => []),
          fetchUserRoyalties(uid).catch(() => ({ totalEarnings: 0, totalStreams: 0, items: [] })),
          fetchUserPayouts(uid).catch(() => []),
          fetchUserTickets(uid).catch(() => [])
        ]);

        setReleases(userReleases || []);
        setRoyalties(userRoyalties || { totalEarnings: 0, totalStreams: 0, items: [] });
        setPayouts(userPayouts || []);
        setTickets(userTickets || []);
      }
    } catch (err) {
      console.warn("Notice loading dashboard catalog:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      loadDashboardData();
    }
  }, [contextUser, authLoading]);

  // Real Payout Request Submit
  const handlePayoutSubmit = async (e) => {
    e.preventDefault();
    setPayoutError('');
    setPayoutSuccess('');
    
    const uid = user?.uid || user?.id || auth?.currentUser?.uid;
    const amount = Number(payoutAmount);

    if (!amount || amount < 100) {
      setPayoutError('Minimum withdrawal threshold is ₹100.');
      return;
    }

    if (amount > royalties.totalEarnings) {
      setPayoutError('Withdrawal amount exceeds available verified balance.');
      return;
    }

    setSubmittingPayout(true);
    const res = await requestPayoutFirestore(uid, amount, payoutMethod, accountDetails);
    setSubmittingPayout(false);

    if (res.success) {
      setPayoutSuccess(`Payout request of ₹${amount} submitted successfully! Status: Pending Approval.`);
      setPayoutAmount('');
      setAccountDetails('');
      loadDashboardData();
      setTimeout(() => setPayoutModal(false), 2500);
    } else {
      setPayoutError(res.error || 'Failed to submit payout request.');
    }
  };

  // Real Support Ticket Submit
  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    setTicketError('');
    setTicketSuccess('');

    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      setTicketError('Subject and message description are required.');
      return;
    }

    setSubmittingTicket(true);

    const res = await submitSupportTicket({
      userId: user?.uid || user?.id || auth?.currentUser?.uid,
      name: user?.artistName || user?.email?.split('@')[0] || 'Artist',
      email: user?.email,
      subject: ticketSubject.trim(),
      category: ticketCategory,
      message: ticketMessage.trim()
    });

    setSubmittingTicket(false);

    if (res.success) {
      setTicketSuccess('Support ticket logged successfully! Email notification dispatched to adventureof693@gmail.com.');
      setTicketSubject('');
      setTicketMessage('');
      loadDashboardData();
    } else {
      setTicketError(res.error || 'Failed to log support ticket.');
    }
  };

  // Real Profile Update Submit
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!profileData.artistName.trim()) {
      setProfileError('Artist / Stage Name is required.');
      return;
    }

    setSavingProfile(true);

    try {
      const storedUserStr = localStorage.getItem('user');
      const currentUser = storedUserStr ? JSON.parse(storedUserStr) : {};

      const updatedUser = {
        ...currentUser,
        artistName: profileData.artistName.trim(),
        name: profileData.fullName.trim(),
        fullName: profileData.fullName.trim(),
        phone: profileData.phone.trim(),
        genre: profileData.genre,
        bio: profileData.bio.trim(),
        spotifyUrl: profileData.spotifyUrl.trim(),
        instagramUrl: profileData.instagramUrl.trim()
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      window.dispatchEvent(new Event('auth-change'));

      setProfileSuccess('Artist Profile updated successfully!');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      setProfileError('Failed to save profile updates.');
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 flex flex-col items-center justify-center min-h-[500px] text-zinc-100 font-outfit">
        <div className="w-8 h-8 rounded-full border-2 border-t-white border-zinc-800 animate-spin mb-4" />
        <span className="font-heading font-semibold text-zinc-400 text-xs tracking-widest uppercase">Connecting Real Firestore Catalog...</span>
      </div>
    );
  }

  // Calculate stats safely with default fallbacks
  const safeReleases = Array.isArray(releases) ? releases : [];
  const safeRoyalties = royalties || { totalEarnings: 0, totalStreams: 0, items: [] };
  const safePayouts = Array.isArray(payouts) ? payouts : [];
  const safeTickets = Array.isArray(tickets) ? tickets : [];

  const totalReleasesCount = safeReleases.length;
  const totalTracksCount = safeReleases.reduce((sum, r) => sum + (Array.isArray(r.tracks) ? r.tracks.length : 1), 0);
  const totalStreamsDisplay = Number(safeRoyalties.totalStreams || 0).toLocaleString();
  const totalEarningsDisplay = Number(safeRoyalties.totalEarnings || 0).toLocaleString();

  return (
    <div className="relative pt-20 pb-16 min-h-screen bg-[#070709] text-zinc-100 font-outfit">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 relative z-10 space-y-8">
        
        {/* Header Title Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-extrabold text-3xl text-white">{user?.artistName || 'Artist Catalog'}</h1>
              {user?.role === 'Admin' && (
                <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase tracking-wider">
                  Platform Admin
                </span>
              )}
            </div>
            <p className="text-zinc-400 text-xs tracking-wide">
              {user?.email || 'Registered Artist Account'} • Verified Artist Dashboard
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {user?.role === 'Admin' && (
              <Link 
                to="/admin" 
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold uppercase tracking-wider transition-all"
              >
                <ShieldAlert className="w-4 h-4" />
                Admin Panel
              </Link>
            )}
            <Link
              to="/upload"
              className="btn-primary px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Create Release
            </Link>
          </div>
        </div>

        {/* Real Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Total Releases */}
          <div className="minimal-card p-6 bg-[#0d0d12] border-white/10 space-y-2">
            <div className="flex justify-between items-center text-zinc-400 text-xs uppercase font-bold tracking-wider">
              <span>Total Releases</span>
              <Disc className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-heading font-extrabold text-3xl text-white">{totalReleasesCount}</h3>
            <p className="text-zinc-500 text-[11px]">Actual catalog releases</p>
          </div>

          {/* Total Tracks */}
          <div className="minimal-card p-6 bg-[#0d0d12] border-white/10 space-y-2">
            <div className="flex justify-between items-center text-zinc-400 text-xs uppercase font-bold tracking-wider">
              <span>Total Tracks</span>
              <Play className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-heading font-extrabold text-3xl text-white">{totalTracksCount}</h3>
            <p className="text-zinc-500 text-[11px]">Submitted sound recordings</p>
          </div>

          {/* Total Verified Streams */}
          <div className="minimal-card p-6 bg-[#0d0d12] border-white/10 space-y-2">
            <div className="flex justify-between items-center text-zinc-400 text-xs uppercase font-bold tracking-wider">
              <span>Verified Streams</span>
              <Users className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-heading font-extrabold text-3xl text-white">
              {totalStreamsDisplay}
            </h3>
            <p className="text-zinc-500 text-[11px]">
              {totalStreamsDisplay === '0' ? 'No reporting streams yet' : 'Platform reported streams'}
            </p>
          </div>

          {/* Available Earnings */}
          <div className="minimal-card p-6 bg-[#0d0d12] border-white/10 space-y-2">
            <div className="flex justify-between items-center text-zinc-400 text-xs uppercase font-bold tracking-wider">
              <span>Available Earnings</span>
              <CircleDollarSign className="w-4 h-4 text-[#DEDCFF]" />
            </div>
            <h3 className="font-heading font-extrabold text-3xl text-white">₹{totalEarningsDisplay}</h3>
            <button
              onClick={() => setPayoutModal(true)}
              className="text-[11px] text-[#DEDCFF] font-semibold hover:underline block text-left"
            >
              Withdraw Funds →
            </button>
          </div>

        </div>

        {/* Dashboard Sub-nav tabs */}
        <div className="flex border-b border-white/10 pb-1 gap-6 overflow-x-auto">
          {[
            { id: 'analytics', label: 'Overview & Analytics' },
            { id: 'catalog', label: 'My Releases Catalog' },
            { id: 'payouts', label: 'Payout History' },
            { id: 'tickets', label: 'Support Tickets' },
            { id: 'profile', label: 'Edit Profile' }
          ].map(sub => (
            <button
              key={sub.id}
              onClick={() => setActiveSubTab(sub.id)}
              className={`pb-3 text-xs font-bold uppercase tracking-widest transition-colors relative whitespace-nowrap ${
                activeSubTab === sub.id ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {sub.label}
              {activeSubTab === sub.id && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* VIEW 1: OVERVIEW & ANALYTICS */}
        {activeSubTab === 'analytics' && (
          <div className="space-y-8 animate-fade-in">
            <div className="minimal-card p-8 bg-[#09090d] border-white/10 space-y-6">
              <h3 className="font-heading font-bold text-lg text-white border-b border-white/10 pb-4">
                Streaming & Royalty Performance
              </h3>
              {(!safeRoyalties.items || safeRoyalties.items.length === 0) ? (
                <div className="p-12 text-center space-y-4 border border-dashed border-white/10 rounded-2xl bg-white/2">
                  <Info className="w-10 h-10 text-zinc-500 mx-auto" />
                  <h4 className="font-heading font-bold text-base text-white">No Analytics Data Available Yet</h4>
                  <p className="text-zinc-400 text-xs max-w-md mx-auto leading-relaxed">
                    Analytics & royalty statements will appear here automatically after verified store reporting data is processed for your catalog releases.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {safeRoyalties.items.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-white">{item.platform || 'Digital Service Provider'}</p>
                        <p className="text-zinc-400 text-[10px]">{item.period || 'Reporting Cycle'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">₹{item.netRevenue}</p>
                        <p className="text-zinc-500 text-[10px]">{item.streams} plays</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: MY RELEASES CATALOG */}
        {activeSubTab === 'catalog' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg text-white">Submitted Releases ({releases.length})</h3>
              <Link to="/upload" className="btn-secondary px-4 py-2 rounded-xl text-xs font-semibold">
                + New Release
              </Link>
            </div>

            {releases.length === 0 ? (
              <div className="minimal-card p-14 text-center space-y-4 bg-[#0d0d12] border-white/10">
                <Disc className="w-12 h-12 text-zinc-600 mx-auto" />
                <h4 className="font-heading font-bold text-xl text-white">No releases yet</h4>
                <p className="text-zinc-400 text-xs max-w-md mx-auto leading-relaxed">
                  Create your first release and start your global music distribution journey with Adventure Records.
                </p>
                <div className="pt-2">
                  <Link to="/upload" className="btn-primary px-6 py-3 rounded-xl text-xs font-semibold">
                    Create Release
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {releases.map((rel, idx) => (
                  <div key={idx} className="minimal-card p-6 bg-[#09090d] border-white/10 space-y-4">
                    <div className="flex items-start gap-4">
                      <img 
                        src={rel.artworkUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&auto=format&fit=crop'}
                        alt={rel.releaseTitle}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&auto=format&fit=crop';
                        }}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white/10 shadow-md"
                      />
                      <div className="space-y-1 flex-grow truncate">
                        <h4 className="font-heading font-bold text-base text-white truncate">{rel.releaseTitle}</h4>
                        <p className="text-zinc-400 text-xs">{rel.primaryArtist} • {rel.releaseType}</p>
                        <div className="flex items-center gap-2 pt-1 text-[11px] text-zinc-500 font-mono">
                          <span>UPC: {rel.upc || 'Not assigned'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="text-zinc-500 font-mono">Date: {rel.releaseDate || rel.createdAt?.split('T')[0]}</span>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          rel.paymentStatus === 'paid' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' :
                          rel.paymentStatus === 'pending_verification' ? 'bg-[#585589]/20 border border-[#585589]/40 text-[#DEDCFF]' :
                          'bg-red-500/10 border border-red-500/30 text-red-400'
                        }`}>
                          {rel.paymentStatus === 'paid' ? 'Payment Verified ✓' :
                           rel.paymentStatus === 'pending_verification' ? 'Payment Pending Verification' :
                           'Payment Locked'}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          rel.status === 'approved' || rel.status === 'distributed' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' :
                          rel.status === 'rejected' ? 'bg-red-500/10 border border-red-500/30 text-red-400' :
                          rel.status === 'changes_required' ? 'bg-[#585589]/20 border border-[#585589]/40 text-[#DEDCFF]' :
                          'bg-white/10 border border-white/20 text-zinc-300'
                        }`}>
                          {rel.status?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Show Rejection / Changes required reason if applicable */}
                    {rel.rejectionReason && (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                        <strong>Rejection Reason:</strong> {rel.rejectionReason}
                      </div>
                    )}
                    {rel.changesRequired && (
                      <div className="p-3 rounded-xl bg-[#585589]/20 border border-[#585589]/40 text-[#DEDCFF] text-xs">
                        <strong>Action Required:</strong> {rel.changesRequired}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: PAYOUT HISTORY */}
        {activeSubTab === 'payouts' && (
          <div className="minimal-card p-8 bg-[#09090d] border-white/10 space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg text-white">Payout History</h3>
              <button onClick={() => setPayoutModal(true)} className="btn-primary px-4 py-2 rounded-xl text-xs font-semibold">
                Request Payout
              </button>
            </div>

            {payouts.length === 0 ? (
              <div className="p-10 text-center space-y-3 border border-dashed border-white/10 rounded-2xl bg-white/2">
                <Landmark className="w-10 h-10 text-zinc-500 mx-auto" />
                <h4 className="font-heading font-bold text-base text-white">No Payout History Yet</h4>
                <p className="text-zinc-400 text-xs max-w-sm mx-auto">
                  When you request earnings withdrawals, transaction records will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {payouts.map((pay, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white text-sm">₹{pay.amount.toLocaleString()}</p>
                      <p className="text-zinc-400 text-[10px]">{pay.method || 'Bank Transfer'} • {pay.createdAt?.split('T')[0]}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      pay.status === 'Paid' || pay.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                      pay.status === 'Cancelled' || pay.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                      'bg-[#585589]/20 text-[#DEDCFF] border border-[#585589]/40'
                    }`}>
                      {pay.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: SUPPORT TICKETS & EMAIL DISPATCH */}
        {activeSubTab === 'tickets' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
            {/* Create Support Ticket Form */}
            <div className="lg:col-span-6 minimal-card p-8 bg-[#09090d] border-white/10 space-y-6">
              <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-white" /> Open Support Ticket
              </h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Need help with release metadata, ISRCs, or store status? Submitting a ticket notifies our curation desk at <span className="text-white font-semibold">adventureof693@gmail.com</span>.
              </p>

              {ticketSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{ticketSuccess}</span>
                </div>
              )}
              {ticketError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{ticketError}</span>
                </div>
              )}

              <form onSubmit={handleTicketSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Category</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="w-full bg-[#0d0d12] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/40"
                  >
                    <option value="General Support">General Support</option>
                    <option value="Release Distribution">Release Distribution</option>
                    <option value="ISRC / UPC Queries">ISRC / UPC Queries</option>
                    <option value="Royalty & Earnings">Royalty & Earnings</option>
                    <option value="Copyright & Ownership">Copyright & Ownership</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Subject *</label>
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="e.g. Issue with track metadata"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Message Description *</label>
                  <textarea
                    rows={4}
                    required
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Describe your question or issue in detail..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/40 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingTicket}
                  className="btn-primary w-full py-3.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
                >
                  {submittingTicket ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {submittingTicket ? 'Submitting Ticket...' : 'Submit Support Ticket'}
                </button>
              </form>
            </div>

            {/* User Ticket History */}
            <div className="lg:col-span-6 minimal-card p-8 bg-[#09090d] border-white/10 space-y-6">
              <h3 className="font-heading font-bold text-lg text-white">Your Tickets ({tickets.length})</h3>

              {tickets.length === 0 ? (
                <div className="p-8 text-center space-y-2 border border-dashed border-white/10 rounded-2xl bg-white/2">
                  <p className="text-zinc-500 text-xs">You're all caught up! No active support tickets.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((tic, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{tic.subject}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          tic.status === 'Open' ? 'bg-[#585589]/20 text-[#DEDCFF] border border-[#585589]/40' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {tic.status}
                        </span>
                      </div>
                      <p className="text-zinc-400 text-[11px] line-clamp-2">{tic.message}</p>
                      <div className="flex justify-between text-[10px] text-zinc-500 pt-1 border-t border-white/5">
                        <span>Category: {tic.category}</span>
                        <span>{tic.createdAt?.split('T')[0]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 5: EDIT ARTIST PROFILE */}
        {activeSubTab === 'profile' && (
          <div className="max-w-3xl minimal-card p-8 bg-[#09090d] border-white/10 space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-heading font-bold text-lg text-white">Edit Artist Profile</h3>
                <p className="text-zinc-400 text-xs mt-0.5">Update your stage name, contact information, and public artist metadata.</p>
              </div>
              <UserCheck className="w-5 h-5 text-[#DEDCFF]" />
            </div>

            {profileSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}
            {profileError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Artist / Stage Name */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Artist / Stage Name *</label>
                  <input
                    type="text"
                    required
                    value={profileData.artistName}
                    onChange={(e) => setProfileData({ ...profileData, artistName: e.target.value })}
                    placeholder="e.g. Alex Rivera"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/40 transition-all"
                  />
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Full Name (Legal Name)</label>
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    placeholder="e.g. Alexander Vance"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/40 transition-all"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Phone / WhatsApp Number</label>
                  <input
                    type="text"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/40 transition-all"
                  />
                </div>

                {/* Primary Music Genre */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Primary Music Genre</label>
                  <select
                    value={profileData.genre}
                    onChange={(e) => setProfileData({ ...profileData, genre: e.target.value })}
                    className="w-full bg-[#0d0d12] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/40 transition-all"
                  >
                    <option value="Pop">Pop</option>
                    <option value="Hip-Hop / Rap">Hip-Hop / Rap</option>
                    <option value="Electronic / EDM">Electronic / EDM</option>
                    <option value="Bollywood / Film">Bollywood / Film</option>
                    <option value="Classical / Traditional">Classical / Traditional</option>
                    <option value="Rock / Alternative">Rock / Alternative</option>
                    <option value="Lo-Fi / Chill">Lo-Fi / Chill</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Spotify Artist URL */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Spotify Artist Profile URL</label>
                  <input
                    type="url"
                    value={profileData.spotifyUrl}
                    onChange={(e) => setProfileData({ ...profileData, spotifyUrl: e.target.value })}
                    placeholder="https://open.spotify.com/artist/..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/40 transition-all"
                  />
                </div>

                {/* Instagram Handle / URL */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Instagram Profile Link</label>
                  <input
                    type="text"
                    value={profileData.instagramUrl}
                    onChange={(e) => setProfileData({ ...profileData, instagramUrl: e.target.value })}
                    placeholder="https://instagram.com/yourhandle"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/40 transition-all"
                  />
                </div>

              </div>

              {/* Bio / Description */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Artist Bio & Description</label>
                <textarea
                  rows={3}
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="Tell your fans and curation team about your music background..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/40 resize-none transition-all"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn-primary px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  {savingProfile ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                  {savingProfile ? 'Saving Changes...' : 'Save Profile Updates'}
                </button>
              </div>
            </form>
          </div>
        )}

      </main>

      {/* Payout Request Modal */}
      {payoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md minimal-card rounded-3xl p-8 bg-[#0d0d12] border-white/15 relative space-y-6">
            <h3 className="font-heading font-bold text-xl text-white">Request Earnings Withdrawal</h3>
            
            {payoutSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                {payoutSuccess}
              </div>
            )}
            {payoutError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {payoutError}
              </div>
            )}

            <form onSubmit={handlePayoutSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Withdrawal Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="100"
                  max={royalties.totalEarnings || 0}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/40"
                />
                <span className="text-[10px] text-zinc-500 block text-right mt-1">Available: ₹{royalties.totalEarnings}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Payout Method</label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  className="w-full bg-[#0d0d12] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/40"
                >
                  <option value="UPI / GPay">UPI / GPay ID</option>
                  <option value="Direct Bank Transfer">Direct Bank Transfer (NEFT/IMPS)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Account / UPI Details</label>
                <input
                  type="text"
                  required
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  placeholder="e.g. name@upi or Bank Account + IFSC Code"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/40"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setPayoutModal(false)}
                  className="btn-secondary w-1/2 py-3 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayout}
                  className="btn-primary w-1/2 py-3 rounded-xl text-xs font-semibold"
                >
                  {submittingPayout ? 'Submitting...' : 'Confirm Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
