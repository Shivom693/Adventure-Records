import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Copy, Smartphone, Check, AlertCircle, X, 
  ShieldCheck, Clock, CheckCircle2, Loader2, ArrowRight, RefreshCw, Sparkles
} from 'lucide-react';
import { createPaymentOrder, pollPaymentOrderStatus } from '../services/dataService';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const UpiPaymentModal = ({ 
  isOpen, 
  onClose, 
  paymentType = 'release', 
  targetId, 
  title, 
  amount, 
  onSuccess 
}) => {
  const merchantUpi = '9691546208-3@ybl';
  const merchantName = 'Adventure Records';

  // Order & Payment State
  const [order, setOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  
  // Verification State
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [verifiedPayment, setVerifiedPayment] = useState(null);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [failureReason, setFailureReason] = useState('');

  // UI state
  const [copied, setCopied] = useState(false);
  const [qrTimeLeft, setQrTimeLeft] = useState(600); // 10-minute dynamic order session
  const [qrExpired, setQrExpired] = useState(false);

  const pollIntervalRef = useRef(null);
  const timerRef = useRef(null);
  const firestoreUnsubRef = useRef(null);
  const isResolvedRef = useRef(false);

  // Initialize unique Dynamic UPI QR Order
  const initializeOrder = useCallback(async () => {
    setLoadingOrder(true);
    setOrderError('');
    setPaymentSuccess(false);
    setPaymentFailed(false);
    setVerifiedPayment(null);
    setQrExpired(false);
    setQrTimeLeft(600);
    isResolvedRef.current = false;

    const authUser = auth?.currentUser;
    const storedUserStr = localStorage.getItem('user');
    let userId = authUser?.uid;
    let userEmail = authUser?.email;
    let customerName = authUser?.displayName || '';

    if (storedUserStr) {
      try {
        const parsed = JSON.parse(storedUserStr);
        userId = userId || parsed.uid || parsed._id || parsed.id;
        userEmail = userEmail || parsed.email;
        customerName = customerName || parsed.name || parsed.username || '';
      } catch (e) {}
    }

    if (!userId) {
      setOrderError('Please log in to initiate payment.');
      setLoadingOrder(false);
      return;
    }

    try {
      const orderRes = await createPaymentOrder({
        userId,
        userEmail: userEmail || 'artist@adventurerecords.com',
        customerName,
        amount,
        paymentType,
        targetId,
        releaseTitle: title || 'Music Distribution',
        planName: title || 'Distribution Plan'
      });

      if (orderRes.success && orderRes.orderId) {
        setOrder(orderRes);
        setQrTimeLeft(600);
        setQrExpired(false);
      } else {
        setOrderError(orderRes.error || 'Failed to generate dynamic payment QR. Please try again.');
      }
    } catch (err) {
      setOrderError(err.message || 'Error communicating with payment gateway.');
    } finally {
      setLoadingOrder(false);
    }
  }, [amount, paymentType, targetId, title]);

  // Handle Confirmed Payment Completion (Automatic transition)
  const handlePaymentConfirmed = useCallback((paymentData) => {
    if (isResolvedRef.current) return;
    isResolvedRef.current = true;

    // Clear timers & polling immediately
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    if (typeof firestoreUnsubRef.current === 'function') {
      firestoreUnsubRef.current();
    }

    setPaymentSuccess(true);
    setVerifiedPayment(paymentData);

    if (onSuccess) {
      onSuccess(paymentData);
    }

    // Auto-close / transition after celebration
    setTimeout(() => {
      onClose();
    }, 2800);
  }, [onSuccess, onClose]);

  // Session timer countdown
  useEffect(() => {
    if (!isOpen || !order || paymentSuccess || paymentFailed) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

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

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, order, paymentSuccess, paymentFailed]);

  // Real-Time Automatic Detection (Firestore Snapshot Listener + Backend Polling)
  useEffect(() => {
    if (!isOpen || !order?.orderId || paymentSuccess || qrExpired || paymentFailed) {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (typeof firestoreUnsubRef.current === 'function') {
        firestoreUnsubRef.current();
      }
      return;
    }

    // 1. Live Firestore Listener for Instant Real-Time Push Notification
    if (db) {
      try {
        const q = query(collection(db, 'payments'), where('orderId', '==', order.orderId));
        firestoreUnsubRef.current = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
            const docData = snapshot.docs[0].data();
            if (docData.status === 'SUCCESS' || docData.status === 'verified') {
              handlePaymentConfirmed(docData);
            } else if (docData.status === 'FAILED') {
              setPaymentFailed(true);
              setFailureReason(docData.failureReason || 'Transaction was declined by bank.');
            }
          }
        }, (err) => {
          console.warn('Firestore payment listener notice:', err.message);
        });
      } catch (err) {}
    }

    // 2. Automated Background Status Polling Fallback (Runs every 2.5s)
    pollIntervalRef.current = setInterval(async () => {
      if (isResolvedRef.current) return;

      try {
        const statusRes = await pollPaymentOrderStatus(order.orderId);
        if (statusRes.isSuccess || statusRes.status === 'SUCCESS' || statusRes.status === 'verified') {
          handlePaymentConfirmed(statusRes.payment || { orderId: order.orderId, status: 'SUCCESS' });
        } else if (statusRes.status === 'FAILED') {
          setPaymentFailed(true);
          setFailureReason('Transaction declined by payment provider.');
          clearInterval(pollIntervalRef.current);
        } else if (statusRes.status === 'EXPIRED') {
          setQrExpired(true);
          clearInterval(pollIntervalRef.current);
        }
      } catch (e) {}
    }, 2500);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (typeof firestoreUnsubRef.current === 'function') {
        firestoreUnsubRef.current();
      }
    };
  }, [isOpen, order?.orderId, paymentSuccess, qrExpired, paymentFailed, handlePaymentConfirmed]);

  // Modal Lifecycle
  useEffect(() => {
    if (isOpen) {
      initializeOrder();
    } else {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (typeof firestoreUnsubRef.current === 'function') {
        firestoreUnsubRef.current();
      }
    }
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (typeof firestoreUnsubRef.current === 'function') {
        firestoreUnsubRef.current();
      }
    };
  }, [isOpen, initializeOrder]);

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(merchantUpi);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const upiDeepLink = order?.upiQrString || `upi://pay?pa=${merchantUpi}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tr=${order?.orderId || 'ORD'}&tn=${encodeURIComponent('Adventure Records ' + (title || 'Distribution'))}`;
  const qrCodeUrl = order?.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(upiDeepLink)}&_t=${order?.orderId || Date.now()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#07070a] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(56,189,248,0.2)] space-y-6 my-8 font-outfit">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ── SUCCESS STATE (AUTOMATICALLY DISPLAYED ON SERVER CONFIRMATION) ── */}
        {paymentSuccess ? (
          <div className="py-10 text-center space-y-5 animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border-2 border-emerald-400/50 flex items-center justify-center text-emerald-400 shadow-[0_0_40px_rgba(52,211,153,0.35)] animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Verified by Payment Gateway</span>
              </div>
              <h3 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-tight">
                PAYMENT SUCCESSFUL!
              </h3>
              <p className="text-sm font-semibold text-emerald-400">
                Your payment has been verified successfully.
              </p>
              <p className="text-xs text-zinc-300">
                Your release upload is now unlocked.
              </p>
            </div>

            <div className="max-w-xs mx-auto p-4 rounded-2xl bg-white/5 border border-white/10 text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between text-zinc-400">
                <span>Order ID:</span>
                <span className="text-white font-bold">{order?.orderId || 'Confirmed'}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Amount Paid:</span>
                <span className="text-emerald-400 font-bold">₹{amount}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Payment Status:</span>
                <span className="text-emerald-400 font-bold">SUCCESS ✓</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Release Upload:</span>
                <span className="text-emerald-400 font-bold">UNLOCKED 🔓</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 flex items-center justify-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>Redirecting you to the release upload console...</span>
            </p>
          </div>
        ) : (
          /* ── AUTOMATIC DYNAMIC UPI QR INTERFACE ── */
          <div className="space-y-5">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-sky-400 mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Adventure Records • Automated UPI Gateway</span>
              </div>
              <h2 className="font-heading font-black text-xl sm:text-2xl text-white tracking-tight">
                PAYMENT DETAILS
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Scan with any UPI app to pay. Your release unlocks automatically upon payment.
              </p>
            </div>

            {/* Amount & Plan Banner */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-zinc-400 text-[10px] uppercase font-bold block">Amount to Pay</span>
                <span className="font-heading font-black text-3xl text-emerald-400">₹{amount}</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">{title || 'Distribution Plan'}</span>
              </div>
              <div className="text-right">
                <span className="text-zinc-500 text-[10px] uppercase font-bold block">Order ID</span>
                <span className="font-mono text-xs text-sky-400 font-bold select-all">
                  {loadingOrder ? 'Generating...' : (order?.orderId || 'Active')}
                </span>
                <span className="text-[10px] text-emerald-400 block mt-0.5 font-semibold">100% Royalty Retention</span>
              </div>
            </div>

            {/* Dynamic UPI QR Code Section */}
            <div className="p-5 rounded-2xl bg-white text-black text-center space-y-3.5 shadow-2xl relative">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                Scan QR with any UPI app to complete payment.
              </p>

              {/* Dynamic QR image */}
              <div className="relative inline-block">
                {loadingOrder ? (
                  <div className="w-56 h-56 mx-auto flex flex-col items-center justify-center border-2 border-dashed border-zinc-300 rounded-2xl bg-zinc-50 space-y-2">
                    <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
                    <p className="text-xs font-semibold text-zinc-600">Generating Unique Dynamic QR...</p>
                  </div>
                ) : qrExpired ? (
                  <div className="w-56 h-56 mx-auto flex flex-col items-center justify-center border-2 border-dashed border-red-300 rounded-2xl bg-red-50 p-4 space-y-2">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                    <p className="text-xs font-bold text-red-600">QR Session Expired</p>
                    <p className="text-[10px] text-zinc-500">Each dynamic QR is valid for 10 minutes</p>
                    <button
                      onClick={initializeOrder}
                      className="mt-1 text-xs px-4 py-1.5 rounded-xl bg-red-500 text-white font-bold flex items-center gap-1.5 hover:bg-red-600 cursor-pointer transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Generate New QR</span>
                    </button>
                  </div>
                ) : (
                  <div className="relative p-2 bg-white rounded-2xl border-2 border-zinc-200 shadow-md">
                    <img
                      src={qrCodeUrl}
                      alt="Dynamic UPI QR Code"
                      className="w-52 h-52 sm:w-56 sm:h-56 mx-auto object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Supported UPI Apps Pills */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-[10px] font-bold text-zinc-700">
                <span className="px-2 py-0.5 rounded-md bg-zinc-100 border border-zinc-200">Google Pay</span>
                <span className="px-2 py-0.5 rounded-md bg-zinc-100 border border-zinc-200">PhonePe</span>
                <span className="px-2 py-0.5 rounded-md bg-zinc-100 border border-zinc-200">Paytm</span>
                <span className="px-2 py-0.5 rounded-md bg-zinc-100 border border-zinc-200">BHIM</span>
                <span className="px-2 py-0.5 rounded-md bg-zinc-100 border border-zinc-200">Cred</span>
              </div>

              {/* Merchant Details & Timer */}
              <div className="flex items-center justify-between text-[11px] text-zinc-700 font-semibold px-2 pt-1 border-t border-zinc-100">
                <span>Receiver: <strong className="font-mono text-zinc-900">{merchantUpi}</strong></span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="text-sky-600 hover:text-sky-700 font-bold text-[11px] cursor-pointer"
                >
                  {copied ? 'Copied ✓' : 'Copy UPI'}
                </button>
              </div>

              {!qrExpired && !loadingOrder && (
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Session valid for <span className="font-mono font-bold text-zinc-800">{Math.floor(qrTimeLeft / 60)}:{(qrTimeLeft % 60).toString().padStart(2, '0')}</span></span>
                </div>
              )}
            </div>

            {/* Mobile UPI Direct App Links (If user is browsing on phone) */}
            <div className="grid grid-cols-3 gap-2">
              <a
                href={upiDeepLink}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-center text-xs font-bold text-white transition-all flex flex-col items-center gap-1 cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Google Pay</span>
              </a>
              <a
                href={upiDeepLink}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-center text-xs font-bold text-white transition-all flex flex-col items-center gap-1 cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-sky-400" />
                <span>PhonePe</span>
              </a>
              <a
                href={upiDeepLink}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-center text-xs font-bold text-white transition-all flex flex-col items-center gap-1 cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-indigo-400" />
                <span>Paytm / UPI</span>
              </a>
            </div>

            {/* Errors */}
            {(orderError || (paymentFailed && failureReason)) && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{orderError || failureReason}</span>
              </div>
            )}

            {/* ── AUTOMATIC WAITING STATUS INDICATOR ── */}
            <div className="p-4 rounded-2xl bg-white/5 border border-sky-500/20 text-center">
              <div className="flex items-center justify-center gap-2.5 text-sky-400 text-xs font-bold tracking-wide">
                <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                <span>Waiting for payment confirmation...</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default UpiPaymentModal;
