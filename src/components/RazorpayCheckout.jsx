/**
 * Adventure Records — Razorpay Standard Web Checkout Component
 * Loads checkout.js once, opens the Razorpay modal, and verifies payment
 * server-side via HMAC-SHA256 before calling onSuccess.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CreditCard, Loader2, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import { API_URL } from '../config';
import { auth } from '../firebase';

const RZP_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

/** Loads checkout.js safely (reusing the tag from index.html if present) */
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector('script[src*="checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      const onLoad = () => resolve(Boolean(window.Razorpay));
      const onError = () => {
        existing.remove();
        resolve(false);
      };
      existing.addEventListener('load', onLoad, { once: true });
      existing.addEventListener('error', onError, { once: true });
      // Fallback poll in case the script finished loading before listeners attached
      setTimeout(() => {
        if (window.Razorpay) resolve(true);
      }, 300);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => {
      script.remove();
      resolve(false);
    };
    document.body.appendChild(script);
  });

const resolveUserIdentity = (userId, userEmail, customerName) => {
  if (userId && userEmail) {
    return { userId, userEmail, customerName };
  }
  const authUser = auth?.currentUser;
  let resolvedId = userId || authUser?.uid || '';
  let resolvedEmail = userEmail || authUser?.email || '';
  let resolvedName = customerName || authUser?.displayName || '';
  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      const parsed = JSON.parse(raw);
      resolvedId = resolvedId || parsed.uid || parsed._id || parsed.id || '';
      resolvedEmail = resolvedEmail || parsed.email || '';
      resolvedName = resolvedName || parsed.name || parsed.artistName || '';
    }
  } catch (_) {}
  return { userId: resolvedId, userEmail: resolvedEmail, customerName: resolvedName };
};

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

    const identity = resolveUserIdentity(userId, userEmail, customerName);

    // 2. Create order on backend
    let orderData;
    try {
      const res = await fetch(`${API_URL}/api/razorpay/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(amountRupees) * 100,  // convert to paise
          currency: 'INR',
          userId: identity.userId || 'guest',
          userEmail: identity.userEmail || 'customer@adventurerecords.com',
          customerName: identity.customerName || '',
          paymentType,
          targetId,
          releaseTitle
        })
      });
      orderData = await res.json().catch(() => ({}));
      if (!res.ok || !orderData.success || !orderData.order_id) {
        throw new Error(
          orderData.message ||
          orderData.error ||
          `Payment gateway returned HTTP ${res.status}.`
        );
      }
    } catch (err) {
      const isNetworkFailure = err instanceof TypeError || /failed to fetch|network/i.test(err.message || '');
      setErrorMsg(
        isNetworkFailure
          ? `Unable to reach payment backend (${API_URL}). Please verify your backend server is deployed and online.`
          : (err.message || 'Could not initialize Razorpay checkout.')
      );
      setStatus('error');
      return;
    }

    const checkoutKey = orderData.key_id || RZP_KEY_ID;
    if (!checkoutKey) {
      setErrorMsg('Razorpay key is not configured. Contact support.');
      setStatus('error');
      return;
    }

    setStatus('idle'); // Modal is now in control

    // 3. Open Razorpay checkout modal (using exact matching key that created the order)
    const options = {
      key: checkoutKey,
      amount: orderData.amount,       // paise (echoed from Razorpay)
      currency: orderData.currency,
      name: 'Adventure Records',
      description: releaseTitle || 'Music Distribution',
      image: 'https://adventurerecords.web.app/logo.png',
      order_id: orderData.order_id,
      prefill: {
        ...(identity.customerName ? { name: identity.customerName } : {}),
        ...(identity.userEmail ? { email: identity.userEmail } : {})
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
          const verifyRes = await fetch(`${API_URL}/api/razorpay/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id,
              razorpay_payment_id,
              razorpay_signature,
              userId: identity.userId || 'guest',
              userEmail: identity.userEmail || 'customer@adventurerecords.com',
              customerName: identity.customerName || '',
              paymentType,
              targetId,
              releaseTitle,
              amount: orderData.amount  // paise
            })
          });
          const result = await verifyRes.json().catch(() => ({}));

          if (verifyRes.ok && result.success) {
            setStatus('success');
            if (onSuccess) {
              onSuccess({
                paymentId: razorpay_payment_id,
                orderId: razorpay_order_id,
                internalOrderId: result.orderId || `AR_RZP_${razorpay_order_id}`,
                verifiedAt: result.verifiedAt,
                method: 'RAZORPAY',
                amount: amountRupees,
                targetId,
                paymentType
              });
            }
          } else {
            setErrorMsg(
              result.message ||
              result.error ||
              'Payment verification failed. Contact support with payment ID: ' + razorpay_payment_id
            );
            setStatus('error');
          }
        } catch (err) {
          setErrorMsg('Verification network error. Contact support with payment ID: ' + razorpay_payment_id);
          setStatus('error');
        }
      }
    };

    try {
      const rzp = new window.Razorpay(options);
      razorpayRef.current = rzp;

      rzp.on('payment.failed', (response) => {
        const reason = response?.error?.description || response?.error?.reason || 'Payment failed.';
        setErrorMsg(`Payment failed: ${reason}`);
        setStatus('error');
      });

      rzp.open();
    } catch (sdkErr) {
      setErrorMsg(sdkErr?.message || 'Could not open Razorpay Checkout modal.');
      setStatus('error');
    }
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
