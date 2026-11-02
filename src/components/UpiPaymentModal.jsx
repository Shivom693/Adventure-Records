import React, { useState, useEffect, useRef, useCallback } from 'react';
import { QrCode, Copy, Smartphone, Check, AlertCircle, RefreshCw, X, ShieldCheck, Clock, ArrowRight, Hourglass } from 'lucide-react';
import { submitUpiPaymentVerification, detectFakeUtr } from '../services/dataService';
import { auth } from '../firebase';

const UpiPaymentModal = ({ isOpen, onClose, paymentType = 'release', targetId, title, amount, onSuccess }) => {
  const merchantUpi = '9691546208-3@ybl';
  const merchantName = 'Adventure Records';

  const [copied, setCopied] = useState(false);
  const [utr, setUtr] = useState('');
  const [upiApp, setUpiApp] = useState('Google Pay');
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [submittedPayment, setSubmittedPayment] = useState(null);
  const [error, setError] = useState('');

  // Dynamic QR session state (refreshes every 60s)
  const [qrTimeLeft, setQrTimeLeft] = useState(60);
  const [qrExpired, setQrExpired] = useState(false);
  const [qrKey, setQrKey] = useState(Date.now());
  const timerRef = useRef(null);

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

  useEffect(() => {
    if (isOpen) {
      startQrTimer();
      setSubmittedSuccess(false);
      setSubmitting(false);
      setUtr('');
      setError('');
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, startQrTimer]);

  if (!isOpen) return null;

  // Real UPI deep link for any UPI app
  const upiDeepLink = `upi://pay?pa=${merchantUpi}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(title || 'Adventure Records Payment')}&ts=${qrKey}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiDeepLink)}&_t=${qrKey}`;

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

  // Submit payment proof (UTR) for real Admin review
  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    setError('');

    const cleanUtr = utr.trim();

    if (!cleanUtr) {
      setError('Please enter the 12-digit UTR / UPI reference number from your payment receipt.');
      return;
    }

    if (!/^\d{12}$/.test(cleanUtr)) {
      setError('UTR must be exactly 12 numeric digits. Please check your UPI transaction history.');
      return;
    }

    // Fraud prevention: detect fake / sequential UTRs
    const fakeCheck = detectFakeUtr(cleanUtr);
    if (fakeCheck.isFake) {
      setError(`⚠️ Invalid UTR: ${fakeCheck.reason} Please enter the genuine UTR from your bank/UPI app.`);
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
        userEmail: userEmail || 'artist@adventurerecords.com',
        paymentType,
        targetId,
        releaseTitle: title || 'Release Distribution',
        planName: title || 'Distribution Plan',
        amount,
        utr: cleanUtr,
        upiApp
      });

      setSubmitting(false);

      if (res.success) {
        setSubmittedSuccess(true);
        setSubmittedPayment(res.payment);
        if (onSuccess) onSuccess(res.payment);
      } else {
        setError(res.error || 'Failed to submit payment. Please try again.');
      }
    } catch (err) {
      setSubmitting(false);
      setError(err.message || 'Error submitting payment verification.');
    }
  };

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
            <ShieldCheck className="w-3.5 h-3.5" /> Official Merchant UPI Payment
          </div>
          <h2 className="font-heading font-black text-2xl text-white tracking-wide">{merchantName}</h2>
          <p className="text-zinc-400 text-xs">{title || 'Distribution Service'}</p>
        </div>

        {/* Amount Box */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1 mb-6">
          <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Total Amount Due</span>
          <div className="font-heading font-black text-4xl text-emerald-400">₹{amount}</div>
          <span className="text-[10px] text-zinc-500 font-medium">One-time release fee • Zero recurring charges</span>
        </div>

        {submittedSuccess ? (
          /* Post-submission Pending Review State (NEVER fake verified) */
          <div className="p-6 rounded-2xl bg-[#585589]/20 border border-[#585589]/40 text-center space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
              <Hourglass className="w-9 h-9 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading font-bold text-xl text-white">Payment Proof Submitted</h3>
              <p className="text-xs font-mono font-bold text-amber-400">
                UTR: {submittedPayment?.utr || utr}
              </p>
              <p className="text-zinc-300 text-xs pt-1">
                Amount: <strong className="text-white">₹{amount}</strong> to merchant <span className="font-mono text-white">{merchantUpi}</span>
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-zinc-300 text-xs text-left space-y-1.5">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wide">
                <Clock className="w-4 h-4 shrink-0" />
                <span>Verification Under Review</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Our billing team is checking your transaction in our bank records. As soon as the admin verifies your payment, your release upload will <strong>unlock automatically in real-time</strong>.
              </p>
            </div>

            <button
              onClick={onClose}
              className="btn-primary w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Done (View Upload Status)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Main Payment UI */
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handlePayWithApp}
                className="p-3.5 rounded-xl bg-white text-black font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all shadow-md"
              >
                <Smartphone className="w-4 h-4 text-black" />
                <span>Pay via UPI App</span>
              </button>

              <button
                type="button"
                onClick={handleCopyUpi}
                className="p-3.5 rounded-xl bg-white/10 border border-white/15 hover:bg-white/20 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-sky-400" />}
                <span>{copied ? 'Copied!' : 'Copy UPI ID'}</span>
              </button>
            </div>

            {/* Merchant UPI Bar */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between text-xs">
              <div>
                <span className="text-zinc-500 text-[10px] uppercase font-bold block">Receiver Merchant UPI ID</span>
                <span className="font-mono font-bold text-[#DEDCFF] text-sm select-all">{merchantUpi}</span>
              </div>
              <button onClick={handleCopyUpi} className="text-xs text-emerald-400 hover:underline font-semibold">
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            {/* QR Code Container */}
            <div className="p-5 rounded-2xl bg-white text-black text-center space-y-3 shadow-2xl relative">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                Scan QR with GPay / PhonePe / Paytm / Any UPI App
              </p>
              
              {/* Timer Bar */}
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-bold ${timerBg} ${timerColor}`}>
                <Clock className="w-3.5 h-3.5" />
                {qrExpired ? (
                  <span>QR Expired — Click refresh to generate new QR</span>
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

              {/* QR Image */}
              {qrExpired ? (
                <div className="w-52 h-52 mx-auto flex flex-col items-center justify-center border-2 border-dashed border-red-300 rounded-xl bg-red-50">
                  <AlertCircle className="w-10 h-10 text-red-400 mb-2" />
                  <p className="text-xs font-bold text-red-500">QR Expired</p>
                  <p className="text-[10px] text-red-400 mt-1">Click refresh below to renew</p>
                </div>
              ) : (
                <img
                  key={qrKey}
                  src={qrCodeUrl}
                  alt="Adventure Records Payment QR"
                  className="w-52 h-52 mx-auto object-contain border border-zinc-200 rounded-xl p-2 bg-white"
                />
              )}

              <p className="text-[11px] font-semibold text-zinc-700">
                Merchant: {merchantName} • <span className="text-emerald-600 font-bold">₹{amount}</span>
              </p>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={handleRefreshQr}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] font-semibold transition-all border border-zinc-300"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{qrExpired ? 'Generate New QR' : 'Refresh QR'}</span>
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Real Submission Form: Enter 12-Digit UTR for Admin Review */}
            <form onSubmit={handleSubmitPayment} className="space-y-4 pt-3 border-t border-white/10">
              <div className="space-y-1">
                <label className="text-xs font-bold text-white uppercase tracking-wider block">
                  Submit Payment UTR Proof *
                </label>
                <p className="text-[11px] text-zinc-400">
                  After paying ₹{amount} in your UPI app, enter the <strong className="text-white">12-digit numeric UTR</strong> from your transaction receipt:
                </p>
              </div>

              <div>
                <input
                  type="text"
                  required
                  maxLength={12}
                  placeholder="e.g. 419271023823"
                  value={utr}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 12);
                    setUtr(val);
                    if (error) setError('');
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 focus:border-emerald-500 text-white font-mono text-sm tracking-wider focus:outline-none transition-all placeholder:text-zinc-600"
                />
                <span className="text-[10px] text-zinc-500 block pt-1">
                  Digits entered: {utr.length} / 12
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  UPI App Used
                </label>
                <select
                  value={upiApp}
                  onChange={(e) => setUpiApp(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="Google Pay" className="bg-zinc-900">Google Pay</option>
                  <option value="PhonePe" className="bg-zinc-900">PhonePe</option>
                  <option value="Paytm" className="bg-zinc-900">Paytm</option>
                  <option value="BHIM UPI" className="bg-zinc-900">BHIM UPI</option>
                  <option value="Cred UPI" className="bg-zinc-900">Cred UPI</option>
                  <option value="Other Bank UPI" className="bg-zinc-900">Other Bank UPI</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting || utr.length !== 12}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting for Review...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Submit Payment for Verification</span>
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
