import React, { useState, useEffect } from 'react';
import { Music, Image, CheckCircle2, AlertCircle, ArrowRight, Disc, RefreshCw, Lock, ShieldCheck, QrCode, Link2, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { createFirestoreRelease, uploadArtworkToStorage, uploadAudioToStorage, fetchUserPayments } from '../services/dataService';
import UpiPaymentModal from '../components/UpiPaymentModal';

const UploadRelease = () => {
  const [formData, setFormData] = useState({
    title: '',
    artistName: '',
    primaryArtist: '',
    featuringArtists: '',
    releaseType: 'Single',
    genre: 'Hip Hop',
    language: 'Hindi',
    releaseDate: '',
    pLine: `${new Date().getFullYear()} Adventure Records`,
    cLine: `${new Date().getFullYear()} Adventure Records`,
    isrc: '',
    upc: '',
    explicit: false
  });

  const [audioFile, setAudioFile] = useState(null);
  const [artworkFile, setArtworkFile] = useState(null);
  const [artworkPreview, setArtworkPreview] = useState(null);
  const [audioDriveLink, setAudioDriveLink] = useState('');
  const [artworkDriveLink, setArtworkDriveLink] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdReleaseId, setCreatedReleaseId] = useState('');
  const [errors, setErrors] = useState({});

  // Payment Verification Lock State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [userPayments, setUserPayments] = useState([]);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [paymentPending, setPaymentPending] = useState(false);
  const [paymentUtr, setPaymentUtr] = useState('');

  const navigate = useNavigate();

  const getReleasePrice = (type) => {
    if (type === 'EP') return 500;
    if (type === 'Album') return 1000;
    return 100; // Single
  };

  const currentPrice = getReleasePrice(formData.releaseType);

  // Check user payments for verification status
  useEffect(() => {
    const checkPaymentStatus = async () => {
      const authUser = auth?.currentUser;
      const storedUserStr = localStorage.getItem('user');
      let userId = authUser?.uid;
      let userEmail = authUser?.email;
      if (storedUserStr) {
        try {
          const parsed = JSON.parse(storedUserStr);
          userId = userId || parsed.uid || parsed.id || parsed._id;
          userEmail = userEmail || parsed.email;
        } catch (e) {}
      }

      // Bypass payment lock completely for tripathihariom573@gmail.com
      if (userEmail && userEmail.toLowerCase().trim() === 'tripathihariom573@gmail.com') {
        setPaymentVerified(true);
        setPaymentPending(false);
        return;
      }

      if (userId) {
        const payments = await fetchUserPayments(userId);
        setUserPayments(payments);
        const verifiedPay = payments.find(p => p.status === 'verified' && p.amount >= currentPrice);
        const pendingPay = payments.find(p => p.status === 'pending_verification' && p.amount >= currentPrice);
        
        if (verifiedPay) {
          setPaymentVerified(true);
          setPaymentPending(false);
        } else if (pendingPay) {
          setPaymentVerified(false);
          setPaymentPending(true);
          setPaymentUtr(pendingPay.utr);
        } else {
          setPaymentVerified(false);
          setPaymentPending(false);
        }
      }
    };
    checkPaymentStatus();
  }, [formData.releaseType]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleAudioDrop = (e) => {
    if (!paymentVerified) {
      setIsPaymentModalOpen(true);
      return;
    }
    const file = e.target.files?.[0];
    if (file) {
      if (['audio/wav', 'audio/x-wav', 'audio/flac', 'audio/mpeg', 'audio/mp3'].includes(file.type) || 
          file.name.endsWith('.wav') || file.name.endsWith('.flac') || file.name.endsWith('.mp3')) {
        setAudioFile(file);
        setErrors(prev => ({ ...prev, audio: null }));
      } else {
        setErrors(prev => ({ ...prev, audio: 'Please upload a valid WAV, FLAC, or MP3 audio file.' }));
      }
    }
  };

  const handleArtworkDrop = (e) => {
    if (!paymentVerified) {
      setIsPaymentModalOpen(true);
      return;
    }
    const file = e.target.files?.[0];
    if (file) {
      setArtworkFile(file);
      setArtworkPreview(URL.createObjectURL(file));
      setErrors(prev => ({ ...prev, artwork: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!paymentVerified) {
      setIsPaymentModalOpen(true);
      return;
    }

    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Release Title is required.';
    if (!formData.artistName.trim() && !formData.primaryArtist.trim()) {
      newErrors.artistName = 'Primary Artist Name is required.';
    }
    if (!formData.releaseDate) newErrors.releaseDate = 'Target Release Date is required.';
    if (!audioDriveLink.trim()) newErrors.audio = 'Google Drive link for audio file is required.';
    if (!artworkDriveLink.trim()) newErrors.artwork = 'Google Drive link for cover artwork is required.';

    // Validate Google Drive links
    if (audioDriveLink.trim() && !audioDriveLink.includes('drive.google.com') && !audioDriveLink.includes('docs.google.com')) {
      newErrors.audio = 'Please enter a valid Google Drive sharing link.';
    }
    if (artworkDriveLink.trim() && !artworkDriveLink.includes('drive.google.com') && !artworkDriveLink.includes('docs.google.com')) {
      newErrors.artwork = 'Please enter a valid Google Drive sharing link.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const authUser = auth?.currentUser;
    const storedUserStr = localStorage.getItem('user');
    let userId = authUser?.uid;
    if (!userId && storedUserStr) {
      try { userId = JSON.parse(storedUserStr).uid || JSON.parse(storedUserStr).id; } catch (e) {}
    }

    if (!userId) {
      setErrors({ form: 'Session expired. Please log in again.' });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadStage('Uploading cover artwork...');

    try {
      const tempReleaseId = 'rel_' + Date.now();

      // Use Drive links directly
      const artworkUrl = artworkDriveLink.trim();
      const audioUrl = audioDriveLink.trim();
      setUploadProgress(50);
      setUploadStage('Saving release details...');
      setUploadProgress(95);

      const primaryArtistName = formData.primaryArtist.trim() || formData.artistName.trim();
      
      const releaseResult = await createFirestoreRelease({
        userId,
        releaseTitle: formData.title.trim(),
        releaseType: formData.releaseType,
        primaryArtist: primaryArtistName,
        featuringArtists: formData.featuringArtists.trim(),
        genre: formData.genre,
        language: formData.language,
        releaseDate: formData.releaseDate,
        explicitContent: formData.explicit,
        copyrightOwner: formData.cLine.trim() || `${new Date().getFullYear()} ${primaryArtistName}`,
        copyrightYear: new Date().getFullYear().toString(),
        pLine: formData.pLine.trim() || `${new Date().getFullYear()} Adventure Records`,
        cLine: formData.cLine.trim() || `${new Date().getFullYear()} Adventure Records`,
        upc: formData.upc.trim() || 'Not assigned',
        artworkUrl,
        tracks: [
          {
            title: formData.title.trim(),
            version: 'Original',
            audioUrl,
            duration: 0,
            isrc: formData.isrc.trim() || 'Not assigned',
            featuredArtists: formData.featuringArtists.trim(),
            explicit: formData.explicit
          }
        ]
      });

      setUploadProgress(100);

      if (releaseResult.success) {
        setCreatedReleaseId(releaseResult.release?.id || tempReleaseId);
        setSuccess(true);
      } else {
        throw new Error(releaseResult.error || 'Failed to save release document.');
      }
    } catch (err) {
      console.error('Upload Release Error:', err);
      setErrors({ form: err.message || 'An error occurred during release ingestion.' });
    } finally {
      setUploading(false);
    }
  };

  const handlePaymentModalSuccess = () => {
    setPaymentPending(false);
    setPaymentVerified(true);
  };

  return (
    <div className="relative pt-20 pb-24 min-h-screen bg-[#070709] text-zinc-100 font-outfit">
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Page Header */}
        <div className="space-y-3 border-b border-white/10 pb-8 text-center sm:text-left">
          <div className="minimal-badge">Artist Distribution Portal</div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight">
            Create New Release
          </h1>
          <p className="text-zinc-400 text-sm">
            Select release format, pay via official UPI (<span className="text-[#DEDCFF] font-mono">9691546208@ptyes</span>), and submit UTR proof for Admin verification.
          </p>
        </div>

        {/* Payment Lock Notification Banner */}
        {!paymentVerified && (
          <div className={`p-6 rounded-2xl border transition-all ${
            paymentPending 
              ? 'bg-[#585589]/20 border-[#585589]/40 text-[#DEDCFF]'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-sm text-white">
                  {paymentPending ? (
                    <>
                      <RefreshCw className="w-5 h-5 text-[#DEDCFF] animate-spin" />
                      <span>Payment Submitted — Verification Pending</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 text-red-400" />
                      <span>Audio & Artwork Upload Locked (₹{currentPrice} Payment Verification Required)</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-zinc-400">
                  {paymentPending 
                    ? `UTR UTR:${paymentUtr} is currently being verified by the Adventure Records billing desk.`
                    : `Please pay ₹${currentPrice} for ${formData.releaseType} release to merchant 9691546208@ptyes via UPI and submit UTR to unlock upload fields.`}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="btn-primary px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  {paymentPending ? 'View Payment' : `Pay ₹${currentPrice}`}
                </button>
              </div>
            </div>
          </div>
        )}

        {paymentVerified && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-white text-sm block">Payment Verified ✓</span>
              <span>Audio track and high-res cover artwork uploads are fully unlocked for distribution.</span>
            </div>
          </div>
        )}

        {errors.form && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errors.form}</span>
          </div>
        )}

        {success ? (
          <div className="minimal-card p-12 text-center space-y-6 max-w-xl mx-auto border-emerald-500/30 bg-[#0d0d14]">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="font-heading font-bold text-2xl text-white">Release Submitted Successfully!</h2>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Your release "<span className="text-white font-semibold">{formData.title}</span>" has been stored in Cloud Firestore and submitted to the curation queue.
            </p>
            <div className="flex justify-center gap-4 pt-2">
              <Link to="/dashboard" className="btn-primary px-6 py-3 rounded-xl text-xs font-semibold">
                Go to Dashboard
              </Link>
              <button 
                onClick={() => { setSuccess(false); setAudioFile(null); setArtworkFile(null); setArtworkPreview(null); }}
                className="btn-secondary px-6 py-3 rounded-xl text-xs font-semibold"
              >
                Create Another Release
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section 1: Basic Release Metadata */}
            <div className="minimal-card p-8 space-y-6 bg-[#09090d]">
              <h3 className="font-heading font-bold text-lg text-white border-b border-white/10 pb-3 flex items-center gap-2">
                <Disc className="w-5 h-5 text-white" /> 1. Release Metadata
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">Release Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Midnight Drive"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 transition-all"
                  />
                  {errors.title && <p className="text-red-400 text-[10px] mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">Primary Artist Name *</label>
                  <input
                    type="text"
                    name="artistName"
                    value={formData.artistName}
                    onChange={handleChange}
                    placeholder="e.g. Kai Nova"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 transition-all"
                  />
                  {errors.artistName && <p className="text-red-400 text-[10px] mt-1">{errors.artistName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">Featuring Artists</label>
                  <input
                    type="text"
                    name="featuringArtists"
                    value={formData.featuringArtists}
                    onChange={handleChange}
                    placeholder="e.g. Misfit Arya (Optional)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">Release Type & Pricing</label>
                  <select
                    name="releaseType"
                    value={formData.releaseType}
                    onChange={handleChange}
                    className="w-full bg-[#0d0d12] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/40 transition-all font-semibold"
                  >
                    <option value="Single">Single (1 Track) — ₹100</option>
                    <option value="EP">EP (2 - 6 Tracks) — ₹500</option>
                    <option value="Album">Album (7+ Tracks) — ₹1,000</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">Primary Genre</label>
                  <select
                    name="genre"
                    value={formData.genre}
                    onChange={handleChange}
                    className="w-full bg-[#0d0d12] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/40 transition-all"
                  >
                    <option value="Hip Hop">Hip Hop / Rap</option>
                    <option value="Pop">Pop</option>
                    <option value="Electronic">Electronic / EDM</option>
                    <option value="Lo-Fi">Lo-Fi / Chillbeat</option>
                    <option value="Rock">Rock / Alternative</option>
                    <option value="Indian Classical">Indian Classical / Folk</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">Language</label>
                  <input
                    type="text"
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    placeholder="e.g. Hindi, English, Punjabi"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/40 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">Target Release Date *</label>
                  <input
                    type="date"
                    name="releaseDate"
                    value={formData.releaseDate}
                    onChange={handleChange}
                    className="w-full bg-[#0d0d12] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/40 transition-all"
                  />
                  {errors.releaseDate && <p className="text-red-400 text-[10px] mt-1">{errors.releaseDate}</p>}
                </div>
              </div>
            </div>

            {/* Section 2: Rights & Identifiers */}
            <div className="minimal-card p-8 space-y-6 bg-[#09090d]">
              <h3 className="font-heading font-bold text-lg text-white border-b border-white/10 pb-3">
                2. Copyright & Identifiers
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">℗ Phonographic Copyright Line</label>
                  <input
                    type="text"
                    name="pLine"
                    value={formData.pLine}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/40 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">© Copyright Line</label>
                  <input
                    type="text"
                    name="cLine"
                    value={formData.cLine}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/40 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">ISRC Code (Optional)</label>
                  <input
                    type="text"
                    name="isrc"
                    value={formData.isrc}
                    onChange={handleChange}
                    placeholder="Leave blank if not assigned"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/40 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">UPC / EAN Barcode (Optional)</label>
                  <input
                    type="text"
                    name="upc"
                    value={formData.upc}
                    onChange={handleChange}
                    placeholder="Leave blank if not assigned"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/40 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Google Drive Links (LOCKED UNTIL PAYMENT VERIFIED) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Audio Drive Link */}
              <div className={`minimal-card p-8 space-y-4 bg-[#09090d] relative ${!paymentVerified ? 'opacity-70' : ''}`}>
                <div className="flex justify-between items-center">
                  <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                    <Music className="w-4 h-4 text-white" /> Audio File *
                  </h3>
                  {!paymentVerified && (
                    <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400">Supported formats: WAV, FLAC, MP3 (16-bit / 24-bit 44.1kHz)</p>

                {!paymentVerified ? (
                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="w-full border-2 border-dashed border-red-500/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-red-500/5 cursor-pointer transition-all hover:bg-red-500/10"
                  >
                    <Lock className="w-8 h-8 text-red-400 mb-2" />
                    <span className="text-xs font-bold text-white">Click to Pay ₹{currentPrice} & Unlock</span>
                    <span className="text-[10px] text-red-400/80 mt-1">Payment Verification Required</span>
                  </button>
                ) : (
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Link2 className="w-3 h-3" /> Paste Google Drive sharing link
                    </label>
                    <div className="relative">
                      <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="url"
                        value={audioDriveLink}
                        onChange={(e) => {
                          setAudioDriveLink(e.target.value);
                          if (e.target.value.trim()) {
                            setErrors(prev => ({ ...prev, audio: null }));
                          }
                        }}
                        placeholder="https://drive.google.com/file/d/..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/40 transition-all"
                      />
                      {audioDriveLink && (
                        <a 
                          href={audioDriveLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-emerald-300 transition-colors"
                          title="Open link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    {audioDriveLink && (
                      <p className="text-emerald-400/80 text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Audio Drive link attached ✓
                      </p>
                    )}
                  </div>
                )}

                {errors.audio && <p className="text-red-400 text-[10px] mt-1">{errors.audio}</p>}
              </div>

              {/* Artwork Drive Link */}
              <div className={`minimal-card p-8 space-y-4 bg-[#09090d] relative ${!paymentVerified ? 'opacity-70' : ''}`}>
                <div className="flex justify-between items-center">
                  <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                    <Image className="w-4 h-4 text-white" /> Cover Artwork *
                  </h3>
                  {!paymentVerified && (
                    <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400">Recommended: Square 3000 × 3000 px JPG/PNG file</p>

                {!paymentVerified ? (
                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="w-full border-2 border-dashed border-red-500/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-red-500/5 cursor-pointer transition-all hover:bg-red-500/10"
                  >
                    <Lock className="w-8 h-8 text-red-400 mb-2" />
                    <span className="text-xs font-bold text-white">Click to Pay ₹{currentPrice} & Unlock</span>
                    <span className="text-[10px] text-red-400/80 mt-1">Payment Verification Required</span>
                  </button>
                ) : (
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Link2 className="w-3 h-3" /> Paste Google Drive sharing link
                    </label>
                    <div className="relative">
                      <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="url"
                        value={artworkDriveLink}
                        onChange={(e) => {
                          setArtworkDriveLink(e.target.value);
                          if (e.target.value.trim()) {
                            setErrors(prev => ({ ...prev, artwork: null }));
                          }
                        }}
                        placeholder="https://drive.google.com/file/d/..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/40 transition-all"
                      />
                      {artworkDriveLink && (
                        <a 
                          href={artworkDriveLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-emerald-300 transition-colors"
                          title="Open link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    {artworkDriveLink && (
                      <p className="text-emerald-400/80 text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Artwork Drive link attached ✓
                      </p>
                    )}
                  </div>
                )}

                {errors.artwork && <p className="text-red-400 text-[10px] mt-1">{errors.artwork}</p>}
              </div>

            </div>

            {/* Real Progress Bar during Firebase Storage upload */}
            {uploading && (
              <div className="minimal-card p-6 space-y-2 bg-[#09090e]">
                <div className="flex items-center justify-between text-xs text-white font-semibold">
                  <span>{uploadStage}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }} 
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={uploading}
                className="btn-primary px-10 py-4 rounded-xl text-base font-semibold shadow-xl flex items-center gap-2 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Uploading...
                  </>
                ) : !paymentVerified ? (
                  <>
                    <Lock className="w-4 h-4 text-red-400" /> Pay ₹{currentPrice} & Unlock Upload
                  </>
                ) : (
                  <>
                    Submit Release for Distribution <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>

      {/* Official Merchant UPI Payment Modal */}
      <UpiPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        paymentType="release"
        targetId={createdReleaseId || 'pending_rel'}
        title={`${formData.releaseType} Release Distribution (${formData.title || 'Untitled'})`}
        amount={currentPrice}
        onSuccess={handlePaymentModalSuccess}
      />

    </div>
  );
};

export default UploadRelease;
