import React, { useState, useEffect, useRef, useCallback } from 'react';
import { QrCode, Copy, Smartphone, Check, AlertCircle, RefreshCw, X, ShieldCheck, Clock, Lock, AlertTriangle, ShieldX } from 'lucide-react';
import { submitUpiPaymentVerification, detectFakeUtr } from '../services/dataService';
import { auth } from '../firebase';

const UpiPaymentModal = ({ isOpen, onClose, paymentType = 'release', targetId, title, amount, onSuccess }) => {
  const merchantUpi = '9691546208-3@ybl';
  const merchantName = 'Adventure Records';

  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [utr, setUtr] = useState('');
  const [upiApp, setUpiApp] = useState('Google Pay');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [error, setError] = useState('');

  // QR Timer state — 60 seconds per QR session
  const [qrTimeLeft, setQrTimeLeft] = useState(60);
  const [qrExpired, setQrExpired] = useState(false);
  const [qrKey, setQrKey] = useState(Date.now()); // forces QR image refresh
  const timerRef = useRef(null);

  // Live UTR fake detection
  const [utrFakeWarning, setUtrFakeWarning] = useState('');

  // Rate-limiting: max 3 submission attempts
  const [submitAttempts, setSubmitAttempts] = useState(0);
  const MAX_ATTEMPTS = 3;

  // UTR validation: strict 12-digit numeric only
  const isValidUtr = (value) => /^[0-9]{12}$/.test(value);

  // Start/restart QR countdown timer
  const startQrTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setQrTimeLeft(60);
    setQrExpired(false);
    setQrKey(Date.now());

    timerRef.current = setInterval(() => {
      setQrTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setQrExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Start timer when QR is shown
  useEffect(() => {
    if (showQr) {
      startQrTimer();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setQrTimeLeft(60);
      setQrExpired(false);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [showQr, startQrTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!isOpen) return null;

  // Generate a fresh UPI deep link (timestamp prevents caching)
  const upiDeepLink = `upi://pay?pa=${merchantUpi}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(title || 'Adventure Records Payment')}&ts=${qrKey}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiDeepLink)}&_t=${qrKey}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(merchantUpi);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePayWithApp = () => {
    window.location.href = upiDeepLink;
  };

  const handleRefreshQr = () => {
    startQrTimer();
  };

  // Prevent paste in UTR field (security: user must manually type)
  const handleUtrPaste = (e) => {
    e.preventDefault();
    setError('Please type your UTR manually. Paste is not allowed for security.');
  };

  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    setError('');

    // Rate limiting
    if (submitAttempts >= MAX_ATTEMPTS) {
      setError(`Too many attempts. Please wait and try again later or contact support.`);
      return;
    }

    const trimmedUtr = utr.trim();

    // Strict UTR validation: must be exactly 12 digits
    if (!trimmedUtr) {
      setError('Please enter your 12-digit UTR / UPI Transaction Reference ID.');
      return;
    }

    if (!/^[0-9]{12}$/.test(trimmedUtr)) {
      setError('Invalid UTR. Must be exactly 12 numeric digits (no letters or spaces). Check your UPI app transaction history.');
      return;
    }

    // Final fake UTR gate before submitting
    const fakeCheck = detectFakeUtr(trimmedUtr, upiApp);
    if (fakeCheck.isFake) {
      setError(`⚠️ Fake UTR Detected: ${fakeCheck.reason}`);
      return;
    }

    const authUser = auth?.currentUser;
    const storedUserStr = localStorage.getItem('user');
    let userId = authUser?.uid;
    let userEmail = authUser?.email;

    if (storedUserStr) {
      try {
        const parsed = JSON.parse(storedUserStr);
        userId = userId || parsed.uid || parsed._id || parsed.id;
        userEmail = userEmail || parsed.email;
      } catch (e) {}
    }

    if (!userId) {
      setError('Please sign in to submit payment verification.');
      return;
    }

    setSubmitting(true);
    setSubmitAttempts(prev => prev + 1);

    try {
      const res = await submitUpiPaymentVerification({
        userId,
        userEmail: userEmail || 'user@adventurerecords.com',
        paymentType,
        targetId,
        releaseTitle: title || 'Release Payment',
        planName: title || 'Distribution Plan',
        amount,
        utr: trimmedUtr,
        upiApp,
        screenshotUrl
      });

      setSubmitting(false);

      if (res.success) {
        setSubmittedSuccess(true);
        if (onSuccess) onSuccess(res.payment);
      } else {
        // Check for duplicate UTR error
        if (res.error && (res.error.toLowerCase().includes('duplicate') || res.error.toLowerCase().includes('already'))) {
          setError('This UTR has already been submitted. Please check your transaction history or contact support.');
        } else {
          setError(res.error || 'Failed to submit payment verification. Please try again.');
        }
      }
    } catch (err) {
      setSubmitting(false);
      setError(err.message || 'An error occurred during submission. Please try again.');
    }
  };

  // Timer color logic
  const timerColor = qrExpired ? 'text-red-400' : qrTimeLeft <= 15 ? 'text-orange-400' : 'text-emerald-400';
  const timerBg = qrExpired ? 'bg-red-500/10 border-red-500/30' : qrTimeLeft <= 15 ? 'bg-orange-500/10 border-orange-500/30' : 'bg-emerald-500/10 border-emerald-500/30';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-outfit">
      
      <div className="relative w-full max-w-lg bg-[#0d0d12] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] text-zinc-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" /> Secure UPI Payment Gateway
          </div>
          <h2 className="font-heading font-bold text-2xl text-white tracking-wide">{merchantName} Payment</h2>
          <p className="text-zinc-400 text-xs">{title || 'Distribution Service'}</p>
        </div>

        {/* Amount Box */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1 mb-6">
          <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Total Amount Due</span>
          <div className="font-heading font-black text-4xl text-white">₹{amount}</div>
          <span className="text-[10px] text-zinc-500 font-medium">Exact amount required for verification</span>
        </div>

        {/* Rate limit warning */}
        {submitAttempts >= MAX_ATTEMPTS && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5">
            <Lock className="w-4 h-4 shrink-0" />
            <span>Maximum submission attempts reached. Please contact support if you need help.</span>
          </div>
        )}

        {submittedSuccess ? (
          /* Post-submission Success State */
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-white">Payment Submitted for Verification</h3>
            <p className="text-zinc-300 text-xs leading-relaxed">
              Your transaction UTR <span className="font-mono font-bold text-[#DEDCFF]">{utr}</span> (₹{amount}) has been recorded. Our billing team will verify it shortly.
            </p>
            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-300 text-[11px] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Upload access will be unlocked <strong>only after admin manually verifies</strong> your payment. This may take up to 24 hours.</span>
            </div>
            <button
              onClick={onClose}
              className="btn-primary w-full py-3 rounded-xl text-xs font-semibold"
            >
              Done
            </button>
          </div>
        ) : (
          /* Main Payment UI */
          <div className="space-y-6">
            
            {/* UPI Actions Bar */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <button
                onClick={handlePayWithApp}
                className="p-3 rounded-xl bg-white text-black font-bold text-xs flex flex-col items-center justify-center gap-1.5 hover:bg-zinc-200 transition-all shadow-lg"
              >
                <Smartphone className="w-4 h-4 text-black" />
                <span>Pay with App</span>
              </button>

              <button
                onClick={() => setShowQr(!showQr)}
                className="p-3 rounded-xl bg-white/10 border border-white/15 hover:bg-white/20 text-white font-semibold text-xs flex flex-col items-center justify-center gap-1.5 transition-all"
              >
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span>{showQr ? 'Hide QR' : 'Show QR'}</span>
              </button>

              <button
                onClick={handleCopyUpi}
                className="p-3 rounded-xl bg-white/10 border border-white/15 hover:bg-white/20 text-white font-semibold text-xs flex flex-col items-center justify-center gap-1.5 transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-sky-400" />}
                <span>{copied ? 'Copied!' : 'Copy UPI ID'}</span>
              </button>
            </div>

            {/* Merchant UPI Box */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between text-xs">
              <div>
                <span className="text-zinc-500 text-[10px] uppercase font-bold block">Receiver Merchant UPI ID</span>
                <span className="font-mono font-bold text-[#DEDCFF] text-sm select-all">{merchantUpi}</span>
              </div>
              <button onClick={handleCopyUpi} className="text-xs text-zinc-400 hover:text-white font-semibold underline">
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            {/* Dynamic QR Code with Timer */}
            {showQr && (
              <div className="p-4 rounded-2xl bg-white text-black text-center space-y-3 animate-fade-in shadow-2xl relative">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-700">Scan QR Code with any UPI App</p>
                
                {/* Timer Bar */}
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-bold ${timerBg} ${timerColor}`}>
                  <Clock className="w-3.5 h-3.5" />
                  {qrExpired ? (
                    <span>QR Expired — Refresh to generate new QR</span>
                  ) : (
                    <span>QR valid for <span className="font-mono text-sm">{String(qrTimeLeft).padStart(2, '0')}s</span></span>
                  )}
                </div>

                {/* Progress bar */}
                {!qrExpired && (
                  <div className="w-full h-1 bg-zinc-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${(qrTimeLeft / 60) * 100}%`,
                        backgroundColor: qrTimeLeft <= 15 ? '#f97316' : '#10b981'
                      }}
                    />
                  </div>
                )}

                {/* QR Image or Expired State */}
                {qrExpired ? (
                  <div className="w-48 h-48 mx-auto flex flex-col items-center justify-center border-2 border-dashed border-red-300 rounded-xl bg-red-50">
                    <AlertCircle className="w-10 h-10 text-red-400 mb-2" />
                    <p className="text-xs font-bold text-red-500">QR Code Expired</p>
                    <p className="text-[10px] text-red-400 mt-1">Click refresh below</p>
                  </div>
                ) : (
                  <img
                    key={qrKey}
                    src={qrCodeUrl}
                    alt="Adventure Records Payment QR"
                    className="w-48 h-48 mx-auto object-contain border border-zinc-200 rounded-xl"
                  />
                )}

                <p className="text-[11px] font-semibold text-zinc-600">Merchant: {merchantName} • ₹{amount}</p>

                {/* Refresh Button */}
                <button
                  onClick={handleRefreshQr}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 text-white text-xs font-bold hover:bg-zinc-700 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {qrExpired ? 'Generate New QR' : 'Refresh QR'}
                </button>
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Post Payment Verification Form */}
            <form onSubmit={handleSubmitVerification} className="space-y-4 pt-3 border-t border-white/10">
              <div className="space-y-1">
                <label className="text-xs font-bold text-white uppercase tracking-wider block">
                  Submit Payment Verification Proof *
                </label>
                <p className="text-[11px] text-zinc-400">
                  After completing payment in GPay/PhonePe/Paytm, enter your <strong className="text-white">12-digit numeric UTR</strong> below:
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  12-Digit UTR / UPI Transaction Reference ID *
                </label>
                <input
                  type="text"
                  required
                  maxLength={12}
                  value={utr}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 12);
                    setUtr(val);
                    if (error) setError('');
                    // Live fake UTR detection
                    if (val.length === 12) {
                      const check = detectFakeUtr(val, upiApp);
                      setUtrFakeWarning(check.isFake ? check.reason : '');
                    } else {
                      setUtrFakeWarning('');
                    }
                  }}
                  onPaste={handleUtrPaste}
                  placeholder="e.g. 423456789012 (12 digits)"
                  className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none transition-all ${
                    utrFakeWarning
                      ? 'border-red-500/60 focus:border-red-500'
                      : utr.length === 12
                      ? 'border-emerald-500/50 focus:border-emerald-500'
                      : 'border-white/15 focus:border-emerald-500/50'
                  }`}
                />
                <div className="flex items-center justify-between mt-1">
                  <span className={`text-[10px] ${
                    utrFakeWarning ? 'text-red-400' : utr.length === 12 ? 'text-emerald-400' : 'text-zinc-500'
                  }`}>
                    {utr.length}/12 digits
                    {utr.length === 12 && !utrFakeWarning && ' ✓ Valid length'}
                    {utr.length === 12 && utrFakeWarning && ' ✗ Suspicious pattern'}
                  </span>
                  {utr.length > 0 && utr.length < 12 && (
                    <span className="text-[10px] text-orange-400">{12 - utr.length} more digits needed</span>
                  )}
                </div>

                {/* Live Fake UTR Warning */}
                {utrFakeWarning && (
                  <div className="mt-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 animate-fade-in">
                    <ShieldX className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-400 text-[11px] font-bold">⚠️ Fake UTR Detected</p>
                      <p className="text-red-300 text-[10px] mt-0.5 leading-relaxed">{utrFakeWarning}</p>
                      <p className="text-zinc-400 text-[10px] mt-1">Please open your UPI app → Transaction History → Copy the exact 12-digit UTR reference number.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">UPI App Used</label>
                  <select
                    value={upiApp}
                    onChange={(e) => setUpiApp(e.target.value)}
                    className="w-full bg-[#121218] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="Google Pay">Google Pay</option>
                    <option value="PhonePe">PhonePe</option>
                    <option value="Paytm">Paytm</option>
                    <option value="BHIM UPI">BHIM UPI</option>
                    <option value="Amazon Pay">Amazon Pay</option>
                    <option value="Other Bank UPI">Other Bank UPI</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Payment Date</label>
                  <input
                    type="text"
                    disabled
                    value={new Date().toLocaleDateString()}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-zinc-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Screenshot Reference URL (Optional)
                </label>
                <input
                  type="url"
                  value={screenshotUrl}
                  onChange={(e) => setScreenshotUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
              </div>

              {/* Attempts indicator */}
              {submitAttempts > 0 && submitAttempts < MAX_ATTEMPTS && (
                <p className="text-[10px] text-orange-400">
                  Attempts: {submitAttempts}/{MAX_ATTEMPTS}. Make sure your UTR is correct before submitting.
                </p>
              )}

              <button
                type="submit"
                disabled={submitting || utr.length !== 12 || submitAttempts >= MAX_ATTEMPTS || !!utrFakeWarning}
                className="btn-primary w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Submitting Verification...
                  </>
                ) : (
                  <>
                    Submit Payment for Verification
                  </>
                )}
              </button>

              <p className="text-[10px] text-zinc-500 text-center leading-relaxed">
                🔒 Your upload access will be activated <strong className="text-zinc-400">only after our admin verifies</strong> your payment. Submitting wrong UTR will delay verification.
              </p>
            </form>

          </div>
        )}

      </div>
    </div>
  );
};

export default UpiPaymentModal;
