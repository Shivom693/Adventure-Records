import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Sparkles,
  Zap
} from 'lucide-react';
import RazorpayCheckout from './RazorpayCheckout';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';

const UpiPaymentModal = ({
  isOpen,
  onClose,
  paymentType = 'release',
  targetId,
  title,
  amount,
  onSuccess
}) => {
  const { user: authContextUser } = useAuth();

  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [verifiedPayment, setVerifiedPayment] = useState(null);
  const [userInfo, setUserInfo] = useState({ userId: '', userEmail: '', customerName: '' });

  const closeTimerRef = useRef(null);
  const isResolvedRef = useRef(false);

  const getResolvedUser = useCallback(() => {
    const authUser = auth?.currentUser;
    const storedUserStr = localStorage.getItem('user');
    let userId = authContextUser?.uid || authContextUser?.id || authContextUser?._id || authUser?.uid || '';
    let userEmail = authContextUser?.email || authUser?.email || '';
    let customerName = authContextUser?.name || authContextUser?.artistName || authUser?.displayName || '';

    if (storedUserStr) {
      try {
        const parsed = JSON.parse(storedUserStr);
        userId = userId || parsed.uid || parsed._id || parsed.id || '';
        userEmail = userEmail || parsed.email || '';
        customerName = customerName || parsed.name || parsed.artistName || parsed.username || '';
      } catch (_) {}
    }

    return {
      userId,
      userEmail: userEmail || 'artist@adventurerecords.com',
      customerName
    };
  }, [authContextUser]);

  const handlePaymentConfirmed = useCallback((paymentData) => {
    if (isResolvedRef.current) return;
    isResolvedRef.current = true;

    setPaymentSuccess(true);
    setVerifiedPayment(paymentData);

    if (onSuccess) {
      onSuccess(paymentData);
    }

    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      onClose();
    }, 2800);
  }, [onSuccess, onClose]);

  useEffect(() => {
    if (isOpen) {
      isResolvedRef.current = false;
      setPaymentSuccess(false);
      setVerifiedPayment(null);
      setUserInfo(getResolvedUser());
    } else if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, [isOpen, getResolvedUser]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0e0e14] border border-black/15 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 font-outfit text-zinc-900 dark:text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-all cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {paymentSuccess ? (
          <div className="py-10 text-center space-y-5 animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border-2 border-emerald-400/50 flex items-center justify-center text-emerald-400 shadow-[0_0_40px_rgba(52,211,153,0.35)] animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Verified by Razorpay</span>
              </div>
              <h3 className="font-heading font-black text-2xl sm:text-3xl text-zinc-900 dark:text-white tracking-tight">
                PAYMENT SUCCESSFUL!
              </h3>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                Your payment has been verified successfully.
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-300">
                Your release upload is now unlocked.
              </p>
            </div>

            <div className="max-w-xs mx-auto p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                <span>Order ID:</span>
                <span className="text-zinc-900 dark:text-white font-bold">{verifiedPayment?.orderId || 'Confirmed'}</span>
              </div>
              <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                <span>Amount Paid:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">₹{amount}</span>
              </div>
              <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                <span>Payment Status:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">SUCCESS ✓</span>
              </div>
              <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                <span>Release Upload:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">UNLOCKED 🔓</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500 dark:text-emerald-400" />
              <span>Redirecting you to the release upload console...</span>
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Adventure Records • Razorpay Checkout</span>
              </div>
              <h2 className="font-heading font-black text-xl sm:text-2xl text-zinc-900 dark:text-white tracking-tight">
                PAYMENT DETAILS
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                Complete payment via Razorpay (Cards, UPI, NetBanking, Wallets). Your release unlocks immediately.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-between">
              <div>
                <span className="text-zinc-600 dark:text-zinc-400 text-[10px] uppercase font-bold block">Amount to Pay</span>
                <span className="font-heading font-black text-3xl text-emerald-600 dark:text-emerald-400">₹{amount}</span>
                <span className="text-[10px] text-zinc-600 dark:text-zinc-400 block mt-0.5">{title || 'Distribution Plan'}</span>
              </div>
              <div className="text-right">
                <span className="text-zinc-500 dark:text-zinc-400 text-[10px] uppercase font-bold block">Order Ref</span>
                <span className="font-mono text-xs text-sky-600 dark:text-sky-400 font-bold select-all">
                  {`RZP_${targetId || 'READY'}`}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5 font-semibold">100% Royalty Retention</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400">
                  <Zap className="w-4 h-4" />
                  <span>Instant Verification & Instant Unlock</span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Pay securely using Cards, UPI (GPay/PhonePe/Paytm), Net Banking, or Wallets via Razorpay Standard Checkout.
                </p>
              </div>

              <RazorpayCheckout
                amountRupees={amount}
                userId={userInfo.userId}
                userEmail={userInfo.userEmail}
                customerName={userInfo.customerName}
                paymentType={paymentType}
                targetId={targetId}
                releaseTitle={title}
                onSuccess={(paymentData) => {
                  handlePaymentConfirmed({
                    ...paymentData,
                    status: 'SUCCESS',
                    amount
                  });
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpiPaymentModal;
