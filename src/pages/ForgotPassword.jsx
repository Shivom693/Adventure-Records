import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth, isConfigured } from '../firebase';
import { forgotPasswordBackend, resetPasswordBackend } from '../services/authService';
import { ArrowRight, CheckCircle2, AlertCircle, Mail, Key, Lock, RefreshCw, ShieldCheck } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email Request, 2: OTP & New Password Entry, 3: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();

  // Step 1: Request Password Reset OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Firebase Reset Mail (if configured)
      if (isConfigured && auth) {
        try {
          await sendPasswordResetEmail(auth, email);
        } catch (e) {}
      }

      // 2. Backend OTP Dispatch
      const res = await forgotPasswordBackend(email.toLowerCase().trim());
      if (res.success) {
        setStep(2);
        setSuccessMsg('A 6-digit verification OTP code has been dispatched to your email.');
      } else {
        setError(res.error || 'Failed to dispatch password reset code.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Submit New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await resetPasswordBackend(email.toLowerCase().trim(), otp.trim(), newPassword);
      if (res.success) {
        setStep(3);
      } else {
        setError(res.error || 'Invalid or expired OTP code.');
      }
    } catch (err) {
      setError('Failed to reset password. Please verify your OTP code and try again.');
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
            {step === 1 ? 'Reset Password' : step === 2 ? 'Enter Reset OTP' : 'Password Reset Complete'}
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {step === 1 
              ? 'Enter your account email to receive a 6-digit verification code.'
              : step === 2
              ? `Enter the OTP sent to ${email} along with your new password.`
              : 'Your password has been successfully updated. You can now sign in.'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && step === 2 && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="name@domain.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pl-11 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 transition-all"
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
                  <RefreshCw className="w-4 h-4 animate-spin" /> Dispatching OTP...
                </>
              ) : (
                <>
                  Send Verification OTP <ArrowRight className="w-4 h-4" />
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

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">6-Digit Verification OTP</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value); setError(''); }}
                  placeholder="123456"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pl-11 text-sm font-mono tracking-widest text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 transition-all"
                />
                <Key className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                  placeholder="Minimum 8 characters"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pl-11 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 transition-all"
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                  placeholder="Re-enter password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pl-11 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 transition-all"
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
                'Reset Password & Sign In'
              )}
            </button>

            <div className="text-center pt-2 text-xs">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                ← Change Email Address
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="py-6 text-center space-y-5 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="font-heading font-bold text-lg text-white">Password Updated!</h2>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
              Your password has been changed securely. You can now access your Adventure Records account.
            </p>
            <div className="pt-2">
              <Link to="/login" className="btn-primary px-8 py-3 rounded-xl text-xs font-semibold inline-block">
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
