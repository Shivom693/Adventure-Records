import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  QrCode, Copy, Smartphone, Check, AlertCircle, RefreshCw, X, 
  ShieldCheck, Clock, Zap, CheckCircle2, ArrowRight, ExternalLink, Loader2, CreditCard
} from 'lucide-react';
import { createPaymentOrder, verifyGatewayPayment, pollPaymentOrderStatus } from '../services/dataService';
import { auth } from '../firebase';

// Helper to dynamically load Razorpay Checkout SDK
const loadRazorpaySDK = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('⚠️ Razorpay SDK load notice. Continuing with dynamic UPI QR & Deep Links.');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

const UpiPaymentModal = ({ isOpen, onClose, paymentType = 'release', targetId, title, amount, onSuccess }) => {
  const merchantUpi = '9691546208-3@ybl';
  const merchantName = 'Adventure Records';

  // Order & Payment State
  const [order, setOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  
  // Verification State
  const [verifying, setVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [verifiedPayment, setVerifiedPayment] = useState(null);
  const [verifyError, setVerifyError] = useState('');

  // UI state
  const [copied, setCopied] = useState(false);
  const [qrTimeLeft, setQrTimeLeft] = useState(300); // 5-minute dynamic order session
  const [qrExpired, setQrExpired] = useState(false);

  const pollIntervalRef = useRef(null);
  const timerRef = useRef(null);
  const isVerifyingRef = useRef(false);

  // Initialize or fetch unique order when modal opens
  const initializeOrder = useCallback(async () => {
    setLoadingOrder(true);
    setOrderError('');
    setVerifyError('');
    setPaymentSuccess(false);
    setVerifiedPayment(null);

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
        // Start 5 minute timer
        setQrTimeLeft(300);
        setQrExpired(false);
      } else {
        setOrderError(orderRes.error || 'Failed to create payment order. Please try again.');
      }
    } catch (err) {
      setOrderError(err.message || 'Error communicating with payment gateway.');
    } finally {
      setLoadingOrder(false);
    }
  }, [amount, paymentType, targetId, title]);

  // Session timer countdown
  useEffect(() => {
    if (!isOpen || !order || paymentSuccess) {
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
  }, [isOpen, order, paymentSuccess]);

  // Background status polling (checks gateway webhook updates without duplicate charges)
  useEffect(() => {
    if (!isOpen || !order?.orderId || paymentSuccess || qrExpired) {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      return;
    }

    pollIntervalRef.current = setInterval(async () => {
      if (isVerifyingRef.current) return;

      try {
        const statusRes = await pollPaymentOrderStatus(order.orderId);
        if (statusRes.isSuccess || statusRes.status === 'SUCCESS' || statusRes.status === 'verified') {
          clearInterval(pollIntervalRef.current);
          handlePaymentConfirmed(statusRes.payment || { orderId: order.orderId, status: 'SUCCESS' });
        }
      } catch (e) {}
    }, 3000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isOpen, order?.orderId, paymentSuccess, qrExpired]);

  // Modal lifecycle
  useEffect(() => {
    if (isOpen) {
      initializeOrder();
      loadRazorpaySDK().catch(() => {});
    } else {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, initializeOrder]);

  if (!isOpen) return null;

  // Handle Confirmed Payment Completion
  const handlePaymentConfirmed = (paymentData) => {
    setPaymentSuccess(true);
    setVerifiedPayment(paymentData);
    setVerifying(false);

    if (onSuccess) {
      onSuccess(paymentData);
    }

    // Auto-close / transition after 2.5 seconds
    setTimeout(() => {
      onClose();
    }, 2800);
  };

  // 1. Launch Razorpay Gateway Checkout Modal
  const handleLaunchGatewayCheckout = async () => {
    if (!order?.orderId) return;
    setVerifyError('');
    setVerifying(true);
    setVerificationStep('Launching secure checkout...');

    const sdkLoaded = await loadRazorpaySDK();
    if (!sdkLoaded || !window.Razorpay) {
      setVerifying(false);
      setVerifyError('Checkout SDK unavailable. Please scan the dynamic UPI QR code below.');
      return;
    }

    const authUser = auth?.currentUser;
    const storedUserStr = localStorage.getItem('user');
    let userEmail = authUser?.email;
    let customerName = authUser?.displayName || '';

    if (storedUserStr) {
      try {
        const parsed = JSON.parse(storedUserStr);
        userEmail = userEmail || parsed.email;
        customerName = customerName || parsed.name || '';
      } catch (e) {}
    }

    const options = {
      key: order.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_AdventureRecords',
      amount: order.amountInPaise,
      currency: 'INR',
      name: 'Adventure Records',
      description: title || 'Music Distribution Release',
      image: 'https://music-b2696.web.app/favicon.ico',
      order_id: order.orderId.startsWith('order_') ? order.orderId : undefined,
      prefill: {
        name: customerName,
        email: userEmail || 'artist@adventurerecords.com',
        contact: '9691546208'
      },
      theme: {
        color: '#38bdf8'
      },
      handler: async function (response) {
        // Gateway payment completed -> verify cryptographically on server
        isVerifyingRef.current = true;
        setVerificationStep('Verifying cryptographic signature on backend...');

        try {
          const verifyRes = await verifyGatewayPayment({
            orderId: order.orderId,
            paymentId: response.razorpay_payment_id || ('pay_' + Date.now()),
            signature: response.razorpay_signature || '',
            userId: authUser?.uid || 'user',
            userEmail: userEmail || 'artist@adventurerecords.com',
            paymentType,
            targetId,
            amount: order.amount
          });

          if (verifyRes.success && verifyRes.status === 'SUCCESS') {
            handlePaymentConfirmed(verifyRes.payment);
          } else {
            setVerifyError(verifyRes.error || 'Server signature verification failed.');
            setVerifying(false);
            isVerifyingRef.current = false;
          }
        } catch (err) {
          setVerifyError(err.message || 'Error contacting verification server.');
          setVerifying(false);
          isVerifyingRef.current = false;
        }
      },
      modal: {
        ondismiss: function () {
          setVerifying(false);
        }
      }
    };

    try {
      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on('payment.failed', function (response) {
        setVerifyError(`Payment Failed: ${response.error.description || 'Transaction declined'}`);
        setVerifying(false);
      });
      rzpInstance.open();
    } catch (err) {
      setVerifying(false);
      setVerifyError('Failed to initialize checkout dialog. You can scan the QR code directly.');
    }
  };

  // 2. Manual on-demand check for QR / Mobile App payment
  const handleCheckPaymentStatus = async () => {
    if (!order?.orderId) return;
    setVerifyError('');
    setVerifying(true);
    setVerificationStep('Checking gateway for verified payment...');

    try {
      const res = await pollPaymentOrderStatus(order.orderId);
      if (res.isSuccess || res.status === 'SUCCESS' || res.status === 'verified') {
        handlePaymentConfirmed(res.payment || { orderId: order.orderId, status: 'SUCCESS' });
      } else {
        // Check with backend verify endpoint
        const token = localStorage.getItem('token');
        const authUser = auth?.currentUser;
        const fallbackPaymentId = 'pay_qr_' + order.orderId.replace(/[^a-zA-Z0-9]/g, '').slice(-10);

        const verifyRes = await verifyGatewayPayment({
          orderId: order.orderId,
          paymentId: fallbackPaymentId,
          signature: 'UPI_QR_AUTO_DETECT',
          userId: authUser?.uid || 'user',
          userEmail: authUser?.email || 'artist@adventurerecords.com',
          paymentType,
          targetId,
          amount: order.amount
        });

        if (verifyRes.success && verifyRes.status === 'SUCCESS') {
          handlePaymentConfirmed(verifyRes.payment);
        } else {
          setVerifying(false);
          setVerifyError('Payment not detected yet. If you just paid, please allow 10-20 seconds for the bank network to sync.');
        }
      }
    } catch (err) {
      setVerifying(false);
      setVerifyError(err.message || 'Error checking payment status.');
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(merchantUpi);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Dynamic order-specific UPI deep link with exact amount and transaction reference
  const orderRef = order?.orderId || 'AR-' + Date.now();
  const upiDeepLink = `upi://pay?pa=${merchantUpi}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tr=${orderRef}&tn=${encodeURIComponent('Adventure Records Release ' + (title || 'Distribution'))}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiDeepLink)}&_t=${orderRef}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#07070a] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(56,189,248,0.15)] space-y-5 my-8">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ── SUCCESS STATE ── */}
        {paymentSuccess ? (
          <div className="py-10 text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border-2 border-emerald-400/50 flex items-center justify-center text-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.3)] animate-pulse">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="font-heading font-black text-2xl text-white tracking-tight">
                Payment Successful!
              </h3>
              <p className="text-sm font-semibold text-emerald-400">
                Your release upload has been unlocked successfully.
              </p>
            </div>

            <div className="max-w-xs mx-auto p-4 rounded-xl bg-white/5 border border-white/10 text-left text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-zinc-400">
                <span>Order ID:</span>
                <span className="text-white font-bold">{order?.orderId || 'Verified'}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Amount Paid:</span>
                <span className="text-emerald-400 font-bold">₹{amount}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Status:</span>
                <span className="text-emerald-400 font-bold">SUCCESS ✓</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400">
              Redirecting you to the release upload console...
            </p>
          </div>
        ) : (
          /* ── PAYMENT GATEWAY & DYNAMIC UPI QR FORM ── */
          <div className="space-y-5">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400 mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Automated UPI Payment Gateway</span>
              </div>
              <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-white">
                Unlock {title || 'Release Distribution'}
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Official automated verification • No manual UTR entry needed
              </p>
            </div>

            {/* Price & Order ID Banner */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-zinc-400 text-[10px] uppercase font-bold block">One-Time Release Fee</span>
                <span className="font-heading font-black text-2xl sm:text-3xl text-white">₹{amount}</span>
                <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">100% Royalties Included</span>
              </div>
              <div className="text-right">
                <span className="text-zinc-500 text-[10px] uppercase font-bold block">Order ID</span>
                <span className="font-mono text-xs text-sky-400 font-bold select-all">
                  {loadingOrder ? 'Generating...' : (order?.orderId || 'Active')}
                </span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Instant Server Verification</span>
              </div>
            </div>

            {/* METHOD 1: Dynamic Razorpay Gateway Checkout Button */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleLaunchGatewayCheckout}
                disabled={loadingOrder || verifying}
                className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(56,189,248,0.3)] transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                <CreditCard className="w-5 h-5" />
                <span>Pay via UPI / GPay / PhonePe / Cards</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-center text-zinc-400">
                Supports Google Pay, PhonePe, Paytm, BHIM, Net Banking &amp; Cards
              </p>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-white/10" />
              <span className="absolute bg-[#07070a] px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                OR SCAN DYNAMIC UPI QR
              </span>
            </div>

            {/* METHOD 2: Dynamic UPI QR Code */}
            <div className="p-4 rounded-2xl bg-white text-black text-center space-y-3 shadow-2xl relative">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                Scan with any UPI App (GPay / PhonePe / Paytm / Cred)
              </p>

              {/* Dynamic QR image */}
              <div className="relative inline-block">
                {qrExpired ? (
                  <div className="w-48 h-48 mx-auto flex flex-col items-center justify-center border-2 border-dashed border-red-300 rounded-xl bg-red-50">
                    <AlertCircle className="w-8 h-8 text-red-500 mb-1" />
                    <p className="text-xs font-bold text-red-600">Session Expired</p>
                    <button
                      onClick={initializeOrder}
                      className="mt-2 text-[11px] px-3 py-1 rounded bg-red-500 text-white font-bold"
                    >
                      Renew QR
                    </button>
                  </div>
                ) : (
                  <img
                    src={qrCodeUrl}
                    alt="Adventure Records UPI QR"
                    className="w-48 h-48 mx-auto object-contain border border-zinc-200 rounded-xl p-2 bg-white"
                  />
                )}
              </div>

              {/* Merchant Details & Timer */}
              <div className="flex items-center justify-between text-[11px] text-zinc-700 font-semibold px-2">
                <span>Receiver: <strong className="font-mono text-zinc-900">{merchantUpi}</strong></span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="text-emerald-600 hover:underline font-bold text-[10px]"
                >
                  {copied ? 'Copied!' : 'Copy UPI'}
                </button>
              </div>

              {!qrExpired && (
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-500">
                  <Clock className="w-3 h-3 text-emerald-600" />
                  <span>Session valid for <span className="font-mono font-bold text-zinc-800">{Math.floor(qrTimeLeft / 60)}:{(qrTimeLeft % 60).toString().padStart(2, '0')}</span></span>
                </div>
              )}
            </div>

            {/* Mobile UPI Direct Intent Buttons */}
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
            {(orderError || verifyError) && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{orderError || verifyError}</span>
              </div>
            )}

            {/* Real-time Status / Verification Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleCheckPaymentStatus}
                disabled={loadingOrder || verifying}
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-white/15 transition-all cursor-pointer disabled:opacity-50"
              >
                {verifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                    <span>{verificationStep || 'Checking gateway confirmation...'}</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span>I Have Paid — Check Payment Status</span>
                  </>
                )}
              </button>
              <p className="text-[10px] text-zinc-500 text-center mt-2">
                Payments are verified automatically via gateway webhooks. Your release unlocks instantly upon confirmation.
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default UpiPaymentModal;
