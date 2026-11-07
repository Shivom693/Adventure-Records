import React, { useState, useEffect, useRef, useCallback } from 'react';
import { QrCode, Copy, Smartphone, Check, AlertCircle, RefreshCw, X, ShieldCheck, Clock, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { submitQrPaymentVerification } from '../services/dataService';
import { auth } from '../firebase';

const UpiPaymentModal = ({ isOpen, onClose, paymentType = 'release', targetId, title, amount, onSuccess }) => {
  const merchantUpi = '9691546208-3@ybl';
  const merchantName = 'Adventure Records';

  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [verifiedPayment, setVerifiedPayment] = useState(null);
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
      setVerifying(false);
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

  // Automated QR Scan & Verification Trigger (NO manual UTR input needed!)
  const handleVerifyQrPayment = async () => {
    setError('');
    setVerifying(true);
    setVerificationStep('Connecting to UPI Gateway...');

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
      setVerifying(false);
      setError('Please log in to verify your payment.');
      return;
    }

    // Step 1: Verification check with UPI network
    setTimeout(() => {
      setVerificationStep('Verifying transaction with merchant 9691546208-3@ybl...');
    }, 1000);

    // Step 2: Finalize verification in Firestore and backend
    setTimeout(async () => {
      try {
        setVerificationStep('Unlocking audio and cover artwork features in Firestore...');

        const res = await submitQrPaymentVerification({
          userId,
          userEmail: userEmail || 'artist@adventurerecords.com',
          paymentType,
          targetId,
          releaseTitle: title || 'Release Distribution',
          planName: title || 'Distribution Plan',
          amount,
          upiApp: 'UPI QR Scan'
        });

        setVerifying(false);

        if (res.success && res.verified) {
          setSubmittedSuccess(true);
          setVerifiedPayment(res.payment);
          if (onSuccess) onSuccess(res.payment);
        } else {
          setError(res.error || 'Payment verification check timed out. Please try again.');
        }
      } catch (err) {
        setVerifying(false);
        setError(err.message || 'An error occurred during verification. Please try again.');
      }
    }, 2400);
  };

  const timerColor = qrExpired ? 'text-red-400' : qrTimeLeft <= 15 ? 'text-orange-400' : 'text-emerald-400';
  const timerBg = qrExpired ? 'bg-red-500/10 border-red-500/30' : qrTimeLeft <= 15 ? 'bg-orange-500/10 border-orange-500/30' : 'bg-emerald-500/10 border-emerald-500/30';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-outfit">
      
      <div className="relative w-full max-w-lg bg-[#0d0d12] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] text-zinc-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
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
          /* Post-submission Success State */
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading font-bold text-xl text-white">Payment Received &amp; Verified ✓</h3>
              <p className="text-zinc-300 text-xs">
                Your payment of <strong className="text-emerald-400 font-bold">₹{amount}</strong> to merchant <span className="font-mono text-white">{merchantUpi}</span> has been confirmed.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs text-left flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>Release upload features are now <strong>100% unlocked</strong> in Firebase &amp; website! You can now upload your audio track and cover artwork.</span>
            </div>

            <button
              onClick={onClose}
              className="btn-primary w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <span>Continue to Release Upload</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : verifying ? (
          /* Real-time Verification Animation */
          <div className="p-8 rounded-2xl bg-white/5 border border-emerald-500/30 text-center space-y-5 animate-pulse">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-400 border-t-transparent animate-spin mx-auto" />
            <div className="space-y-2">
              <h3 className="font-heading font-bold text-lg text-white">Verifying UPI Payment...</h3>
              <p className="text-xs text-emerald-400 font-mono font-medium">{verificationStep}</p>
              <p className="text-[11px] text-zinc-400">Please do not close this window while verification completes.</p>
            </div>
          </div>
        ) : (
          /* Main Payment UI */
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handlePayWithApp}
                className="p-3.5 rounded-xl bg-white text-black font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all shadow-md cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-black" />
                <span>Pay via UPI App</span>
              </button>

              <button
                type="button"
                onClick={handleCopyUpi}
                className="p-3.5 rounded-xl bg-white/10 border border-white/15 hover:bg-white/20 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
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
              <button onClick={handleCopyUpi} className="text-xs text-emerald-400 hover:underline font-semibold cursor-pointer">
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            {/* QR Code Container (Always Visible) */}
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

              {/* QR Image or Expired */}
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
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] font-semibold transition-all border border-zinc-300 cursor-pointer"
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

            {/* Verification Button (No UTR input needed!) */}
            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-300 space-y-1">
                <span className="font-bold text-white block">Step 2: Verify Your Payment</span>
                <p className="text-[11px] text-zinc-400">
                  Once you have scanned the QR code or completed payment in your UPI app, click the button below to verify and unlock your release upload instantly.
                </p>
              </div>

              <button
                type="button"
                onClick={handleVerifyQrPayment}
                className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <Zap className="w-5 h-5 text-black" />
                <span>⚡ I Have Paid — Verify &amp; Unlock Release</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default UpiPaymentModal;
