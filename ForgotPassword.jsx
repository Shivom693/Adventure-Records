import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth, isConfigured } from '../firebase';
import { Disc, ArrowRight, CheckCircle2, AlertCircle, Mail } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isConfigured && auth) {
        await sendPasswordResetEmail(auth, email);
      }
    } catch (err) {
      // Do not reveal whether email exists for security (anti-enumeration)
      console.log("Firebase reset info:", err);
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center pt-8 pb-20 px-4 sm:px-6 lg:px-8 bg-[#070709] text-zinc-100 font-outfit">
      
      <div className="max-w-md w-full minimal-card p-8 sm:p-10 bg-[#0d0d12] border-white/15 shadow-2xl space-y-8">
        
        {/* Logo & Heading */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-block group mb-2">
            <img 
              src="/logo.png" 
              alt="Adventure Records Logo" 
              className="h-16 w-auto object-contain mx-auto transition-transform duration-300 group-hover:scale-105" 
            />
          </Link>

          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-white tracking-tight">
            Reset your password
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Enter the email address associated with your artist account.
          </p>
        </div>

        {submitted ? (
          <div className="py-6 text-center space-y-4 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="font-heading font-bold text-base text-white">Check your email</h2>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
              If an account exists for <span className="text-white font-semibold">{email}</span>, you'll receive password reset instructions shortly.
            </p>
            <div className="pt-4">
              <Link to="/login" className="btn-secondary px-6 py-2.5 rounded-xl text-xs font-semibold">
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="name@domain.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pl-11 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 transition-all"
                />
                <Mail className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 rounded-xl text-sm font-semibold shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? 'Sending Instructions...' : 'Send Password Reset Email'} <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2 text-xs">
              <Link to="/login" className="text-zinc-400 hover:text-white transition-colors">
                Remember your password? Sign in
              </Link>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};

export default ForgotPassword;
