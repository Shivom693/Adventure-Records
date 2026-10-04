import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { sendPasswordResetEmail, confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth, isConfigured } from '../firebase';
import { mapFirebaseAuthError } from '../context/AuthContext';
import { ArrowRight, CheckCircle2, AlertCircle, Mail, Lock, RefreshCw, ShieldCheck } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';

const ForgotPassword = () => {
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get('oobCode');
  const mode = searchParams.get('mode');

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmailUser, setResetEmailUser] = useState('');

  const isResetMode = Boolean(oobCode) && (mode === 'resetPassword' || !mode);

  // If user clicked email reset link with oobCode, verify code on load
  useEffect(() => {
    if (isResetMode && isConfigured && auth) {
      verifyPasswordResetCode(auth, oobCode)
        .then((emailAddress) => {
          setResetEmailUser(emailAddress);
        })
        .catch((err) => {
          console.warn("Verify reset code error:", err);
          setError("The password reset link is invalid or has expired. Please request a new link.");
        });
    }
  }, [isResetMode, oobCode]);

  // Request Reset Email Handler (sendPasswordResetEmail)
  const handleSendResetEmail = async (e) => {
    e.preventDefault();
    const cleanEmail = email.toLowerCase().trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isConfigured && auth) {
        const actionCodeSettings = {
          url: `${window.location.origin}/login`,
          handleCodeInApp: false
        };
        await sendPasswordResetEmail(auth, cleanEmail, actionCodeSettings);
      }
    } catch (err) {
      console.warn("Send reset email notice:", err);
      // Ignore user-not-found to prevent email enumeration attack
      if (err.code !== 'auth/user-not-found') {
        if (err.code === 'auth/too-many-requests') {
          setError(mapFirebaseAuthError(err));
          setLoading(false);
          return;
        }
      }
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  // Submit New Password Handler (confirmPasswordReset)
  const handleConfirmPasswordReset = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isConfigured && auth && oobCode) {
        await confirmPasswordReset(auth, oobCode, newPassword);
        setResetComplete(true);
      } else {
        setError('Firebase Authentication is not configured or reset code is missing.');
      }
    } catch (err) {
      console.error("Confirm Password Reset Error:", err);
      setError(mapFirebaseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center pt-8 pb-20 px-4 sm:px-6 lg:px-8 bg-[#070709] text-zinc-100 font-outfit">
      
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-white/[0.02] blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full minimal-card p-8 sm:p-10 bg-[#0d0d12] border-white/15 shadow-2xl space-y-8 relative">
        
        {/* Brand Logo & Heading */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-1">
            <BrandLogo variant="auth" />
          </div>

          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-white tracking-tight">
            {resetComplete 
              ? 'Password Reset Complete' 
              : isResetMode 
              ? 'Set New Password' 
              : sent 
              ? 'Check Your Email' 
              : 'Forgot Password'}
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {resetComplete
              ? 'Your password has been updated in Firebase Authentication. You can now sign in.'
              : isResetMode
              ? resetEmailUser ? `Set a new password for ${resetEmailUser}.` : 'Enter a new password for your Adventure Records account.'
              : sent
              ? 'If an account exists for this email address, a secure password-reset link has been sent to your inbox.'
              : 'Enter your registered email address to receive an official Firebase password-reset link.'}
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Request Reset Email Form */}
        {!isResetMode && !sent && (
          <form onSubmit={handleSendResetEmail} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="name@domain.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pl-11 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#585589] transition-all"
                />
                <Mail className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 rounded-xl text-sm font-semibold shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Sending Link...
                </>
              ) : (
                <>
                  Send Password Reset Link <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2 text-xs">
              <Link to="/login" className="text-zinc-400 hover:text-white transition-colors">
                Remember your password? Sign in
              </Link>
            </div>
          </form>
        )}

        {/* 2. Email Sent Success Screen */}
        {!isResetMode && sent && (
          <div className="space-y-6 text-center animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-300 space-y-2 text-left leading-relaxed">
              <p className="font-semibold text-white">Next steps:</p>
              <ol className="list-decimal pl-4 space-y-1 text-zinc-400">
                <li>Check your email inbox (and spam folder).</li>
                <li>Click the secure link in the Firebase email.</li>
                <li>Set your new password and log in.</li>
              </ol>
            </div>

            <div className="space-y-3 pt-2">
              <Link to="/login" className="btn-primary w-full py-3.5 rounded-xl text-xs font-semibold inline-block text-center shadow-lg">
                Return to Login
              </Link>
              <button
                type="button"
                onClick={() => { setSent(false); setError(''); }}
                className="text-xs text-zinc-400 hover:text-white transition-colors block mx-auto"
              >
                Did not receive email? Try again
              </button>
            </div>
          </div>
        )}

        {/* 3. Confirm Password Reset Form (from oobCode link) */}
        {isResetMode && !resetComplete && (
          <form onSubmit={handleConfirmPasswordReset} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                  placeholder="Minimum 8 characters"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pl-11 pr-11 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#585589] transition-all"
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                  placeholder="Re-enter password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pl-11 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#585589] transition-all"
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 rounded-xl text-sm font-semibold shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Updating Password...
                </>
              ) : (
                'Save New Password'
              )}
            </button>
          </form>
        )}

        {/* 4. Password Reset Complete Screen */}
        {isResetMode && resetComplete && (
          <div className="py-6 text-center space-y-5 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="font-heading font-bold text-lg text-white">Password Reset Successfully!</h2>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
              Your new password has been updated in Firebase Authentication. You can now log into your Adventure Records account.
            </p>
            <div className="pt-2">
              <Link to="/login" className="btn-primary px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider inline-block">
                Sign In Now →
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ForgotPassword;
