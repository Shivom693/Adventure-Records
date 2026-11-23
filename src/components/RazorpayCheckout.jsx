/**
 * Adventure Records — Razorpay Standard Web Checkout Component
 * Loads checkout.js once, opens the Razorpay modal, and verifies payment
 * server-side via HMAC-SHA256 before calling onSuccess.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CreditCard, Loader2, AlertCircle, CheckCircle2, Zap } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const RZP_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

/** Loads checkout.js once and resolves when window.Razorpay is ready */
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

/**
 * @param {object}   props
 * @param {number}   props.amountRupees     — Amount in rupees (e.g. 100 for ₹100)
 * @param {string}   props.userId
 * @param {string}   props.userEmail
 * @param {string}   [props.customerName]
 * @param {string}   [props.paymentType]    — 'release' | 'subscription'
 * @param {string}   [props.targetId]       — Release / plan ID
 * @param {string}   [props.releaseTitle]
 * @param {function} props.onSuccess        — Called with verified payment data
 * @param {function} [props.onClose]        — Called on user dismiss / failure
 */
const RazorpayCheckout = ({
  amountRupees,
  userId,
  userEmail,
  customerName = '',
  paymentType = 'release',
  targetId,
  releaseTitle = '',
  onSuccess,
  onClose
}) => {
  const [status, setStatus] = useState('idle'); // idle | loading | verifying | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const razorpayRef = useRef(null);

  // Preload checkout.js when component mounts
  useEffect(() => {
    loadRazorpayScript();
    return () => {
      if (razorpayRef.current) {
        try { razorpayRef.current.close(); } catch (_) {}
      }
    };
  }, []);

  const handlePay = useCallback(async () => {
    setStatus('loading');
    setErrorMsg('');

    // 1. Ensure checkout.js is loaded
    const loaded = await loadRazorpayScript();
    if (!loaded || !window.Razorpay) {
      setErrorMsg('Could not load Razorpay checkout. Check your internet connection.');
      setStatus('error');
      return;
    }

    if (!RZP_KEY_ID) {
      setErrorMsg('Razorpay key is not configured. Contact support.');
      setStatus('error');
      return;
    }

    // 2. Create order on backend
    let orderData;
    try {
      const res = await fetch(`${API_BASE}/api/razorpay/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(amountRupees) * 100,  // convert to paise
          currency: 'INR',
          userId,
          userEmail,
          customerName,
          paymentType,
          targetId,
          releaseTitle
        })
      });
      orderData = await res.json();
      if (!res.ok || !orderData.success || !orderData.order_id) {
        throw new Error(orderData.message || 'Failed to create payment order.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Network error. Please try again.');
      setStatus('error');
      return;
    }

    setStatus('idle'); // Modal is now in control

    // 3. Open Razorpay checkout modal
    const options = {
      key: RZP_KEY_ID,
      amount: orderData.amount,       // paise (echoed from Razorpay)
      currency: orderData.currency,
      name: 'Adventure Records',
      description: releaseTitle || 'Music Distribution',
      image: '/logo.png',             // Optional: set your brand logo path
      order_id: orderData.order_id,
      prefill: {
        name: customerName,
        email: userEmail
      },
      theme: { color: '#38bdf8' },
      modal: {
        ondismiss: () => {
          setStatus('idle');
          if (onClose) onClose();
        }
      },

      // 4. On payment success → verify server-side
      handler: async (response) => {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;
        setStatus('verifying');

        try {
          const verifyRes = await fetch(`${API_BASE}/api/razorpay/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id,
              razorpay_payment_id,
              razorpay_signature,
              userId,
              userEmail,
              customerName,
              paymentType,
              targetId,
              releaseTitle,
              amount: orderData.amount  // paise
            })
          });
          const result = await verifyRes.json();

          if (verifyRes.ok && result.success) {
            setStatus('success');
            if (onSuccess) {
              onSuccess({
                paymentId: razorpay_payment_id,
                orderId: razorpay_order_id,
                internalOrderId: result.orderId,
                verifiedAt: result.verifiedAt,
                method: 'RAZORPAY',
                amount: amountRupees,
                targetId,
                paymentType
              });
            }
          } else {
            setErrorMsg(result.message || 'Payment verification failed. Contact support with payment ID: ' + razorpay_payment_id);
            setStatus('error');
          }
        } catch (err) {
          setErrorMsg('Verification network error. Contact support with payment ID: ' + razorpay_payment_id);
          setStatus('error');
        }
      }
    };

    // Handle payment failure event from Razorpay
    const rzp = new window.Razorpay(options);
    razorpayRef.current = rzp;

    rzp.on('payment.failed', (response) => {
      const reason = response?.error?.description || response?.error?.reason || 'Payment failed.';
      setErrorMsg(`Payment failed: ${reason}`);
      setStatus('error');
    });

    rzp.open();
  }, [amountRupees, userId, userEmail, customerName, paymentType, targetId, releaseTitle, onSuccess, onClose]);

  // ── Render ───────────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="flex items-center gap-2.5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold">
        <CheckCircle2 className="w-5 h-5 shrink-0" />
        <span>Payment verified! Release is now unlocked.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={handlePay}
        disabled={status === 'loading' || status === 'verifying'}
        className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl font-bold text-sm
          bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500
          text-white shadow-lg shadow-sky-500/20 transition-all
          disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
        {status === 'verifying' && <Loader2 className="w-4 h-4 animate-spin" />}
        {status === 'idle' || status === 'error' ? (
          <CreditCard className="w-4 h-4" />
        ) : null}
        <span>
          {status === 'loading' && 'Creating order…'}
          {status === 'verifying' && 'Verifying payment…'}
          {(status === 'idle' || status === 'error') && `Pay ₹${amountRupees} with Razorpay`}
        </span>
        {(status === 'idle' || status === 'error') && (
          <Zap className="w-3.5 h-3.5 opacity-70" />
        )}
      </button>

      {errorMsg && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <p className="text-center text-[10px] text-zinc-500">
        Secured by <span className="font-bold text-zinc-400">Razorpay</span> · Cards, UPI, Net Banking &amp; more
      </p>
    </div>
  );
};

export default RazorpayCheckout;
