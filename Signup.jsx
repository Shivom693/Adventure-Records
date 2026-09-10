import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle, RefreshCw, Eye, EyeOff, Disc, CheckCircle2 } from 'lucide-react';
import { isConfigured, auth } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { sendOtpToEmail } from '../services/authService';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setError('');
  };

  // Password strength logic (min 8 chars, upper, lower, number, special char)
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: 'Empty', color: 'bg-zinc-800', width: 'w-0' };
    
    let checks = {
      length: pwd.length >= 8,
      upper: /[A-Z]/.test(pwd),
      lower: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[^A-Za-z0-9]/.test(pwd)
    };

    const passed = Object.values(checks).filter(Boolean).length;

    switch (passed) {
      case 1:
      case 2:
        return { score: 1, label: 'Weak', color: 'bg-red-500', width: 'w-1/4' };
      case 3:
        return { score: 2, label: 'Fair', color: 'bg-amber-500', width: 'w-2/4' };
      case 4:
        return { score: 3, label: 'Strong', color: 'bg-blue-500', width: 'w-3/4' };
      case 5:
        return { score: 4, label: 'Exceptional', color: 'bg-emerald-500', width: 'w-full' };
      default:
        return { score: 0, label: 'Empty', color: 'bg-zinc-800', width: 'w-0' };
    }
  };

  const strength = getPasswordStrength(formData.password);

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please enter your Full Name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      let registeredEmail = formData.email.toLowerCase().trim();
      let displayName = formData.name.trim();

      if (isConfigured && auth) {
        const userCredential = await createUserWithEmailAndPassword(auth, registeredEmail, formData.password);
        if (userCredential.user) {
          await updateProfile(userCredential.user, { displayName: displayName });
        }
      }

      // Generate & send OTP to registered email address
      const otpResponse = await sendOtpToEmail(registeredEmail, {
        displayName: displayName,
        authProvider: 'email',
        role: 'Artist'
      });

      if (otpResponse.success) {
        navigate('/verify-otp');
      } else {
        setError('Failed to dispatch email verification code. Please try again.');
      }
    } catch (err) {
      console.error("Signup Error:", err);
      let errorMsg = err.message || "Failed to create account.";
      if (err.code === 'auth/email-already-in-use') {
        errorMsg = "An account with this email address already exists. Please sign in.";
      } else if (err.code === 'auth/weak-password') {
        errorMsg = "Password is too weak. Please use at least 8 characters with numbers and symbols.";
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center pt-8 pb-20 px-4 sm:px-6 lg:px-8 bg-[#070709] text-zinc-100 font-outfit">
      
      {/* Glow Ambient Light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-white/[0.02] blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full minimal-card p-8 sm:p-10 bg-[#0d0d12] border-white/15 shadow-2xl space-y-8 relative">
        
        {/* Brand Logo & Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block group mb-2">
            <img 
              src="/logo.png" 
              alt="Adventure Records Logo" 
              className="h-16 w-auto object-contain mx-auto transition-transform duration-300 group-hover:scale-105" 
            />
          </Link>

          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-white tracking-tight">
            Create an Account
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Join Adventure Records to distribute your music worldwide.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignupSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pl-11 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 transition-all"
              />
              <User className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="name@domain.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pl-11 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 transition-all"
              />
              <Mail className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                id="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Minimum 8 characters"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pl-11 pr-11 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 transition-all"
              />
              <Lock className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Strength Meter */}
            {formData.password && (
              <div className="space-y-1 mt-2">
                <div className="flex justify-between items-center text-[10px] text-zinc-400 font-medium">
                  <span>Password Strength</span>
                  <span className="font-bold text-white">{strength.label}</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Confirm Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Re-enter password"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pl-11 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 transition-all"
              />
              <Lock className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 rounded-xl text-sm font-semibold shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Registering...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

        </form>

        {/* Footer Link */}
        <div className="text-center pt-2 text-xs text-zinc-400">
          Already have an account?{' '}
          <Link to="/login" className="text-white font-semibold underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Signup;
