import React, { useState } from 'react';
import { QrCode, Copy, Smartphone, Check, AlertCircle, RefreshCw, X, ShieldCheck, Upload } from 'lucide-react';
import { submitUpiPaymentVerification } from '../services/dataService';
import { auth } from '../firebase';

const UpiPaymentModal = ({ isOpen, onClose, paymentType = 'release', targetId, title, amount, onSuccess }) => {
  const merchantUpi = '9691546208@ptyes';
  const merchantName = 'Adventure Records';
  
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [utr, setUtr] = useState('');
  const [upiApp, setUpiApp] = useState('Google Pay');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const upiDeepLink = `upi://pay?pa=${merchantUpi}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(title || 'Adventure Records Payment')}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiDeepLink)}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(merchantUpi);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePayWithApp = () => {
    window.location.href = upiDeepLink;
  };

  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    setError('');

    if (!utr.trim()) {
      setError('Please enter your 12-digit UTR / UPI Transaction Reference ID.');
      return;
    }

    if (utr.trim().length < 6) {
      setError('Please enter a valid UTR / Transaction ID.');
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

    try {
      const res = await submitUpiPaymentVerification({
        userId,
        userEmail: userEmail || 'user@adventurerecords.com',
        paymentType,
        targetId,
        releaseTitle: title || 'Release Payment',
        planName: title || 'Distribution Plan',
        amount,
        utr: utr.trim(),
        upiApp,
        screenshotUrl
      });

      setSubmitting(false);

      if (res.success) {
        setSubmittedSuccess(true);
        if (onSuccess) onSuccess(res.payment);
      } else {
        setError(res.error || 'Failed to submit payment verification.');
      }
    } catch (err) {
      setSubmitting(false);
      setError(err.message || 'An error occurred during submission.');
    }
  };

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
            <ShieldCheck className="w-3.5 h-3.5" /> Official Merchant UPI Gateway
          </div>
          <h2 className="font-heading font-black text-2xl text-white tracking-wide">{merchantName} Payment</h2>
          <p className="text-zinc-400 text-xs">{title || 'Official Distribution Service'}</p>
        </div>

        {/* Amount Box */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1 mb-6">
          <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Total Amount Due</span>
          <div className="font-heading font-black text-4xl text-white">₹{amount}</div>
          <span className="text-[10px] text-zinc-500 font-medium">Exact amount required for verification</span>
        </div>

        {submittedSuccess ? (
          /* Post-submission Success State */
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-white">Payment submitted for verification.</h3>
            <p className="text-zinc-300 text-xs leading-relaxed">
              Your transaction UTR <span className="font-mono font-bold text-amber-400">{utr}</span> (₹{amount}) has been recorded. Our billing team will verify it shortly.
            </p>
            <p className="text-zinc-500 text-[11px]">
              Upon admin verification, your status will change to <span className="text-emerald-400 font-semibold">Payment Verified ✓</span> and features will be unlocked.
            </p>
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
                <span className="font-mono font-bold text-amber-400 text-sm select-all">{merchantUpi}</span>
              </div>
              <button onClick={handleCopyUpi} className="text-xs text-zinc-400 hover:text-white font-semibold underline">
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            {/* Dynamic QR Code Modal Box */}
            {showQr && (
              <div className="p-4 rounded-2xl bg-white text-black text-center space-y-3 animate-fade-in shadow-2xl">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-700">Scan QR Code with any UPI App</p>
                <img 
                  src={qrCodeUrl} 
                  alt="Adventure Records Payment QR" 
                  className="w-48 h-48 mx-auto object-contain border border-zinc-200 rounded-xl" 
                />
                <p className="text-[11px] font-semibold text-zinc-600">Merchant: {merchantName} • ₹{amount}</p>
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
                  After completing payment in GPay/PhonePe/Paytm, enter your 12-digit UTR below:
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  12-Digit UTR / UPI Transaction Reference ID *
                </label>
                <input
                  type="text"
                  required
                  value={utr}
                  onChange={(e) => setUtr(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                  placeholder="e.g. 423456789012"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-emerald-500/50"
                />
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

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
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
            </form>

          </div>
        )}

      </div>
    </div>
  );
};

export default UpiPaymentModal;
