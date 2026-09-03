import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Play, Users, CircleDollarSign, Landmark, Upload, 
  ShieldCheck, Smartphone, Eye, CheckCircle, Info, Send, 
  ShieldAlert, UserCheck, KeyRound, Clock, Laptop, FileText, AlertCircle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { API_URL } from '../config';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [releases, setReleases] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('analytics'); // 'analytics', 'security', 'verification'
  
  // Payout request
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutModal, setPayoutModal] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState('');
  const [payoutError, setPayoutError] = useState('');

  // 2FA variables
  const [twoFactor, setTwoFactor] = useState(false);
  const [twoFactorSuccess, setTwoFactorSuccess] = useState('');

  // Verification variables
  const [legalName, setLegalName] = useState('');
  const [idFile, setIdFile] = useState(null);
  const [idFileName, setIdFileName] = useState('');
  const [verificationSuccess, setVerificationSuccess] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [uploadingId, setUploadingId] = useState(false);

  const navigate = useNavigate();

  const loadDashboardData = async () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      navigate('/login');
      return;
    }

    try {
      // Fetch latest profile first to get active statuses
      const profRes = await fetch(`${API_URL}/api/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const profData = await profRes.json();
      
      let currentUserProfile;
      if (profRes.ok) {
        currentUserProfile = profData.user;
        localStorage.setItem('user', JSON.stringify(profData.user));
      } else {
        currentUserProfile = JSON.parse(storedUser);
      }
      
      setUser(currentUserProfile);
      setTwoFactor(currentUserProfile.twoFactorEnabled || false);

      // Fetch releases
      const relRes = await fetch(`${API_URL}/api/releases`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const relData = await relRes.json();
      if (relRes.ok) {
        setReleases(relData.releases || []);
      }

      // Fetch analytics
      const analRes = await fetch(`${API_URL}/api/analytics/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const analData = await analRes.json();
      if (analRes.ok) {
        setAnalytics(analData);
      }
    } catch (error) {
      console.log('Backend offline. Loading local simulation.');
      const simulatedUser = JSON.parse(storedUser);
      setUser(simulatedUser);
      setTwoFactor(simulatedUser.twoFactorEnabled || false);

      const currentStreams = simulatedUser.streams || 0;
      const currentListeners = simulatedUser.listeners || 0;
      const hasReleasesSimulated = currentStreams > 0;

      setAnalytics({
        summary: {
          totalStreams: currentStreams,
          monthlyListeners: currentListeners,
          balance: simulatedUser.balance || 0,
          totalRoyalties: simulatedUser.totalRoyalties || 0
        },
        streamHistory: [
          { month: 'Jan', streams: Math.floor(currentStreams * 0.5), listeners: Math.floor(currentListeners * 0.45) },
          { month: 'Feb', streams: Math.floor(currentStreams * 0.6), listeners: Math.floor(currentListeners * 0.58) },
          { month: 'Mar', streams: Math.floor(currentStreams * 0.7), listeners: Math.floor(currentListeners * 0.7) },
          { month: 'Apr', streams: Math.floor(currentStreams * 0.8), listeners: Math.floor(currentListeners * 0.82) },
          { month: 'May', streams: Math.floor(currentStreams * 0.9), listeners: Math.floor(currentListeners * 0.9) },
          { month: 'Jun', streams: currentStreams, listeners: currentListeners }
        ],
        platformData: [
          { name: 'Spotify', value: Math.floor(currentStreams * 0.48), percentage: currentStreams > 0 ? 48 : 0, color: '#1DB954' },
          { name: 'Apple Music', value: Math.floor(currentStreams * 0.22), percentage: currentStreams > 0 ? 22 : 0, color: '#FC3C44' },
          { name: 'YouTube Music', value: Math.floor(currentStreams * 0.18), percentage: currentStreams > 0 ? 18 : 0, color: '#FF0000' },
          { name: 'Amazon Music', value: Math.floor(currentStreams * 0.08), percentage: currentStreams > 0 ? 8 : 0, color: '#00A8E1' },
          { name: 'Others', value: Math.floor(currentStreams * 0.04), percentage: currentStreams > 0 ? 4 : 0, color: '#A855F7' }
        ],
        countryData: [
          { name: 'India', value: Math.floor(currentStreams * 0.45), flag: '🇮🇳' },
          { name: 'United States', value: Math.floor(currentStreams * 0.25), flag: '🇺🇸' },
          { name: 'United Kingdom', value: Math.floor(currentStreams * 0.12), flag: '🇬🇧' },
          { name: 'Others', value: Math.floor(currentStreams * 0.18), flag: '🌐' }
        ],
        recentActivity: [
          { type: 'Security', title: 'Session Activated', description: 'Simulated IP: 192.168.1.1', timestamp: new Date().toISOString() }
        ]
      });

      setReleases(hasReleasesSimulated ? [
        {
          _id: 'mock_1',
          title: 'Neon Odyssey (Simulated Upload)',
          artistName: simulatedUser.artistName || 'Artist',
          releaseDate: new Date().toISOString().split('T')[0],
          upc: 'UPC-987654321012',
          coverArtUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&auto=format&fit=crop',
          status: 'Distributed',
          tracks: [{ title: 'Cosmic Gateway', isrc: 'AR-98765432' }]
        }
      ] : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Request payout
  const handlePayoutSubmit = async (e) => {
    e.preventDefault();
    setPayoutError('');
    setPayoutSuccess('');
    const token = localStorage.getItem('token');
    const amount = Number(payoutAmount);

    try {
      const response = await fetch(`${API_URL}/api/payouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      setPayoutSuccess(`Payout request of ₹${amount} submitted successfully!`);
      setPayoutAmount('');
      const updatedUser = { ...user, balance: data.balance, payouts: data.payouts };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      loadDashboardData();
      setTimeout(() => setPayoutModal(false), 2000);
    } catch (err) {
      // Mock payout
      const newBal = (analytics?.summary?.balance || 0) - amount;
      const mockPayouts = [...(user.payouts || []), { amount, date: new Date().toISOString(), status: 'Pending' }];
      const updatedUser = { ...user, balance: newBal, payouts: mockPayouts };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setPayoutSuccess(`Payout of ₹${amount} simulated successfully!`);
      loadDashboardData();
      setTimeout(() => setPayoutModal(false), 2000);
    }
  };

  // Toggle 2FA switch
  const handle2FAToggle = async () => {
    const token = localStorage.getItem('token');
    const targetState = !twoFactor;
    setTwoFactorSuccess('');

    try {
      const response = await fetch(`${API_URL}/api/auth/profile/2fa`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ enabled: targetState })
      });
      const data = await response.json();

      if (response.ok) {
        setTwoFactor(targetState);
        setTwoFactorSuccess(targetState ? 'Two-Factor Authentication is active.' : 'Two-Factor Authentication disabled.');
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch (err) {
      // Simulated 2FA toggle
      setTwoFactor(targetState);
      setTwoFactorSuccess(targetState ? 'Simulated: 2FA is active.' : 'Simulated: 2FA disabled.');
      const updatedUser = { ...user, twoFactorEnabled: targetState };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  // Handle verification file select
  const handleIdFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIdFile(file);
      setIdFileName(file.name);
    }
  };

  // Upload ID document scans
  const handleVerifyUpload = async (e) => {
    e.preventDefault();
    setVerificationError('');
    setVerificationSuccess('');

    if (!legalName || !idFile) {
      setVerificationError('Please enter your legal name and choose an ID file scan.');
      return;
    }

    setUploadingId(true);
    const token = localStorage.getItem('token');

    const form = new FormData();
    form.append('legalName', legalName);
    form.append('idFile', idFile);

    try {
      const response = await fetch(`${API_URL}/api/verify-profile`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      setVerificationSuccess('Verification file uploaded! Admin review is pending.');
      loadDashboardData();
    } catch (err) {
      // Offline fallback mock success
      setVerificationSuccess('Verification scan simulated successfully! Admin review status is pending.');
      const updatedUser = { ...user, verificationStatus: 'Pending', legalName };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } finally {
      setUploadingId(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-8 h-8 rounded-full border-2 border-t-purple-500 border-zinc-800 animate-spin mb-4" />
        <span className="font-orbitron font-semibold text-zinc-600 text-[10px] tracking-widest uppercase">Syncing Dashboard...</span>
      </div>
    );
  }

  const summary = analytics?.summary || { totalStreams: 0, monthlyListeners: 0, balance: 0, totalRoyalties: 0 };
  
  // Default mock logs for display
  const sessionLogs = user?.loginHistory || [
    { ip: '122.170.81.42', userAgent: 'Chrome / Windows 11', timestamp: new Date().toISOString() },
    { ip: '122.170.81.42', userAgent: 'Safari / iPhone 15', timestamp: new Date(Date.now() - 3600000 * 24).toISOString() }
  ];

  return (
    <div className="relative pt-20 pb-16 min-h-screen">
      
      {/* Background Dot grid overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 hologram-grid opacity-50" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 relative z-10 space-y-8">
        
        {/* Header Title Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800/60 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="font-orbitron font-extrabold text-2xl text-zinc-100">{user?.artistName || 'Unknown Artist'}</h1>
              
              {/* Blue verification checkmark */}
              {user?.verificationStatus === 'Verified' && (
                <div className="p-0.5 rounded-full bg-blue-500 text-white" title="Verified Creator Badge">
                  <CheckCircle className="w-4 h-4 fill-white text-blue-500" />
                </div>
              )}
            </div>
            <p className="text-zinc-500 text-xs uppercase tracking-widest font-semibold flex items-center gap-1.5">
              <span>{user?.role} Node</span>
              <span>•</span>
              <span className="text-zinc-400">Class: Premium</span>
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {user?.role === 'Admin' && (
              <Link 
                to="/admin" 
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-xs font-semibold uppercase tracking-wider transition-all"
              >
                <ShieldAlert className="w-4 h-4" />
                Admin
              </Link>
            )}
            <Link
              to="/upload"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-purple-500/10 transition-all flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Release
            </Link>
          </div>
        </div>

        {/* Dashboard Sub-nav toggler */}
        <div className="flex border-b border-zinc-800/60 pb-1 gap-6">
          {[
            { id: 'analytics', label: 'Analytics Summary' },
            { id: 'security', label: 'Security & 2FA Logs' },
            { id: 'verification', label: 'Verification Badge' }
          ].map(sub => (
            <button
              key={sub.id}
              onClick={() => setActiveSubTab(sub.id)}
              className={`pb-3 text-xs font-bold uppercase tracking-widest transition-colors relative ${
                activeSubTab === sub.id ? 'text-brand-purple' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {sub.label}
              {activeSubTab === sub.id && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-brand-purple rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* VIEW 1: ANALYTICS SUMMARY */}
        {activeSubTab === 'analytics' && (
          <div className="space-y-8 animate-fade-in">
            {/* 2 Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">

              {/* Unpaid Balance */}
              <div className="bg-[#0b0b0e] border border-zinc-800/60 rounded-2xl p-6 hover:border-zinc-700/60 transition-colors">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Withdrawable Balance</span>
                  <CircleDollarSign className="w-4 h-4 text-cyan-400" />
                </div>
                <h3 className="font-orbitron font-extrabold text-2xl text-zinc-100">₹{summary.balance.toLocaleString()}</h3>
                <button
                  onClick={() => setPayoutModal(true)}
                  className="text-[10px] text-brand-purple font-bold hover:underline mt-1.5 block text-left"
                >
                  Withdraw Earnings →
                </button>
              </div>

              {/* Total Earned */}
              <div className="bg-[#0b0b0e] border border-zinc-800/60 rounded-2xl p-6 hover:border-zinc-700/60 transition-colors">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Life Earnings</span>
                  <Landmark className="w-4 h-4 text-pink-400" />
                </div>
                <h3 className="font-orbitron font-extrabold text-2xl text-zinc-100">₹{summary.totalRoyalties.toLocaleString()}</h3>
                <span className="text-[10px] text-zinc-500 block mt-1">100% royalty contract rate</span>
              </div>
            </div>

            {/* Graphs division */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Recharts plays */}
              <div className="lg:col-span-8 bg-[#0b0b0e] border border-zinc-800/60 rounded-3xl p-6 sm:p-8">
                <h3 className="font-orbitron font-bold text-sm text-zinc-100 uppercase tracking-widest mb-6">Catalog Stream Logs</h3>
                <div className="w-full h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics?.streamHistory || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="playsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#c084fc" stopOpacity={0.12}/>
                          <stop offset="95%" stopColor="#c084fc" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="#52525b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#52525b" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px' }} labelStyle={{ color: '#fff', fontSize: 11 }} />
                      <Area type="monotone" dataKey="streams" stroke="#c084fc" strokeWidth={2.5} fillOpacity={1} fill="url(#playsGrad)" name="Streams" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Platforms */}
              <div className="lg:col-span-4 bg-[#0b0b0e] border border-zinc-800/60 rounded-3xl p-6 sm:p-8 flex flex-col">
                <h3 className="font-orbitron font-bold text-sm text-zinc-100 uppercase tracking-widest mb-6">Store breakdown</h3>
                
                <div className="w-full h-[130px] relative flex justify-center items-center mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics?.platformData || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={55}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {(analytics?.platformData || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3 overflow-y-auto pr-1 flex-grow">
                  {(analytics?.platformData || []).map((plat, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: plat.color }} />
                        <span className="text-zinc-400 font-medium">{plat.name}</span>
                      </div>
                      <span className="font-bold text-zinc-200">{plat.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Releases Catalog List */}
            <div className="bg-[#0b0b0e] border border-zinc-800/60 rounded-3xl p-6 sm:p-8">
              <h3 className="font-orbitron font-bold text-sm text-zinc-100 uppercase tracking-widest mb-6">Submitted Catalog</h3>
              {releases.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-zinc-800 rounded-2xl">
                  <Info className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                  <p className="text-xs text-zinc-500">No tracks released yet. Click 'Upload Release' to begin.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {releases.map((rel, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-white/2 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img 
                          src={rel.coverArtUrl && rel.coverArtUrl.startsWith('http') ? rel.coverArtUrl : `${API_URL}${rel.coverArtUrl}`}
                          alt={rel.title}
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=150&auto=format&fit=crop';
                          }}
                          className="w-12 h-12 rounded-lg object-cover shrink-0 border border-white/10"
                        />
                        <div className="truncate">
                          <h5 className="font-bold text-sm text-zinc-200 truncate">{rel.title}</h5>
                          <p className="text-[10px] text-zinc-500 font-mono">ISRC: {rel.tracks?.[0]?.isrc || 'Pending'}</p>
                          <p className="text-[10px] text-zinc-500">Date: {rel.releaseDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded ${
                          rel.status === 'Distributed' ? 'bg-green-500/10 text-green-400' :
                          rel.status === 'Processing' ? 'bg-blue-500/10 text-blue-400' : 'bg-yellow-500/10 text-yellow-400'
                        }`}>
                          {rel.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: SECURITY & SESSION LOGS */}
        {activeSubTab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
            {/* 2FA Configuration Switcher */}
            <div className="lg:col-span-5 bg-[#0b0b0e] border border-zinc-800/60 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-brand-purple border border-purple-500/20">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-orbitron font-bold text-sm text-white">Two-Factor Auth (2FA)</h4>
                  <p className="text-[10px] text-zinc-500 font-semibold uppercase">OTP Account Protection</p>
                </div>
              </div>

              <p className="text-zinc-400 text-xs leading-relaxed">
                Add an extra layer of security. When 2FA is active, signing in requires resolving a dynamic code generated in your email authenticator app.
              </p>

              {twoFactorSuccess && (
                <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-brand-purple text-xs">
                  {twoFactorSuccess}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-white/5 pt-6">
                <div>
                  <span className="text-xs font-semibold text-white block">Authenticator Protection</span>
                  <span className="text-[10px] text-zinc-500 mt-0.5">Currently: {twoFactor ? 'Active' : 'Disabled'}</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={twoFactor}
                    onChange={handle2FAToggle}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600 peer-checked:after:bg-white" />
                </label>
              </div>
            </div>

            {/* IP/Device Active Sessions Log */}
            <div className="lg:col-span-7 bg-[#0b0b0e] border border-zinc-800/60 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-brand-blue border border-blue-500/20">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-orbitron font-bold text-sm text-white">Active Login Sessions</h4>
                  <p className="text-[10px] text-zinc-500 font-semibold uppercase">Device & IP Log History</p>
                </div>
              </div>

              <div className="space-y-4">
                {sessionLogs.map((log, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/2 border border-white/5 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/5 border border-white/10 rounded-lg text-zinc-400">
                        <Laptop className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-zinc-200">{log.userAgent || 'Unknown Device'}</p>
                        <p className="text-[10px] text-zinc-500 font-semibold tracking-wider font-mono">{log.ip}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(log.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: ARTIST VERIFICATION BADGE */}
        {activeSubTab === 'verification' && (
          <div className="max-w-2xl mx-auto bg-[#0b0b0e] border border-zinc-800/60 rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-in">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-brand-cyan border border-brand-cyan/20">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-orbitron font-bold text-sm text-white">Artist Verification</h4>
                <p className="text-[10px] text-zinc-500 font-semibold uppercase">Verify Creator Identity</p>
              </div>
            </div>

            <p className="text-zinc-400 text-xs leading-relaxed">
              Verify your catalog profile to add a verified checkmark check badge `[✓]` next to your release records. This locks security protections and accelerates payout clear times.
            </p>

            {/* Current verification status check */}
            {user?.verificationStatus === 'Verified' && (
              <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/30 text-center space-y-3">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto fill-green-500/10" />
                <h4 className="font-orbitron font-bold text-sm text-white">Identity Verified</h4>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Profile Badge Active</p>
              </div>
            )}

            {user?.verificationStatus === 'Pending' && (
              <div className="p-6 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 text-center space-y-3">
                <Clock className="w-10 h-10 text-yellow-500 mx-auto animate-pulse" />
                <h4 className="font-orbitron font-bold text-sm text-white">Review Pending</h4>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Verification Request under review</p>
              </div>
            )}

            {(!user?.verificationStatus || user?.verificationStatus === 'None') && (
              <form onSubmit={handleVerifyUpload} className="space-y-5 border-t border-white/5 pt-6">
                {verificationSuccess && (
                  <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-brand-purple text-xs">
                    {verificationSuccess}
                  </div>
                )}
                {verificationError && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                    {verificationError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="legalName" className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
                    Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    id="legalName"
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    placeholder="As listed on government ID"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block">
                    Upload Identification Document (PDF/JPG/PNG)
                  </label>
                  {idFileName ? (
                    <div className="p-4 rounded-xl bg-white/3 border border-white/10 flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-6 h-6 text-brand-cyan shrink-0" />
                        <span className="font-semibold text-zinc-200 truncate">{idFileName}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => { setIdFile(null); setIdFileName(''); }}
                        className="text-red-400 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-white/10 hover:border-purple-500/30 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/2 transition-colors min-h-[140px]">
                      <Upload className="w-6 h-6 text-zinc-500" />
                      <span className="text-xs text-zinc-400 font-semibold">Choose PAN, Passport or National ID scan</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleIdFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={uploadingId}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold text-xs uppercase tracking-wider hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {uploadingId ? 'Uploading Scan...' : 'Submit Verification Ticket'}
                </button>
              </form>
            )}
          </div>
        )}

      </main>

      {/* Payout Modal */}
      {payoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md glass-panel rounded-3xl p-8 border-purple-500/20 relative">
            <h3 className="font-orbitron font-extrabold text-lg text-white mb-4">Request Withdrawal</h3>
            <p className="text-xs text-zinc-500 mb-6">
              Earnings are cleared and wired directly to your local bank account. Minimum payout threshold is ₹100.
            </p>

            {payoutSuccess && (
              <div className="p-3.5 mb-6 rounded-xl bg-purple-500/10 border border-purple-500/30 text-brand-purple text-xs">
                {payoutSuccess}
              </div>
            )}
            {payoutError && (
              <div className="p-3.5 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {payoutError}
              </div>
            )}

            <form onSubmit={handlePayoutSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
                  Withdrawal Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  min="100"
                  max={summary.balance}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                />
                <span className="text-[10px] text-zinc-500 block text-right">Available Balance: ₹{summary.balance}</span>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setPayoutModal(false)}
                  className="w-1/2 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-xs text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-xs text-white font-bold"
                >
                  Confirm Withdrawal
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
