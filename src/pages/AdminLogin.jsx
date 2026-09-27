import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, AlertCircle, RefreshCw, Key, Eye, EyeOff, CheckCircle2, ShieldAlert } from 'lucide-react';
import { API_URL } from '../config';
import { sendOtpToEmail, verifyOtpCode } from '../services/authService';

const AdminLogin = () => {
  const [step, setStep] = useState(1); // 1: Credentials, 2: OTP Verification
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');
  
  const navigate = useNavigate();

  // Generate a random 6 character text Captcha code
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
  };

  useEffect(() => {
    generateCaptcha();
    const storedUserStr = localStorage.getItem('user');
    if (storedUserStr) {
      try {
        const u = JSON.parse(storedUserStr);
        if (u.role === 'Admin' || u.email === 'adventureof693@gmail.com') {
          navigate('/admin');
        }
      } catch (e) {}
    }
  }, [navigate]);

  // Step 1: Credentials & Captcha check -> Trigger OTP
  const handleAdminCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 1. Verify captcha
    if (captchaInput !== captchaCode) {
      setError('CAPTCHA verification failed. Please try again.');
      generateCaptcha();
      setCaptchaInput('');
      return;
    }

    // 2. Validate email is the owner's email
    if (email.trim().toLowerCase() !== 'adventureof693@gmail.com') {
      setError('Unauthorized. Access restricted to authorized platform administrators.');
      return;
    }

    // 3. Validate password
    if (password !== 'Raje@456') {
      setError('Invalid admin credentials. Access denied.');
      return;
    }

    const adminUser = {
      _id: 'local_op9fec4z0mpycs604',
      email: 'adventureof693@gmail.com',
      name: 'Admin Control',
      artistName: 'Adventure Admin',
      role: 'Admin',
      otpVerified: true,
      streams: 9800000,
      listeners: 450000,
      balance: 85900,
      totalRoyalties: 125000,
      payouts: []
    };

    localStorage.setItem('token', 'admin_jwt_session_token');
    localStorage.setItem('user', JSON.stringify(adminUser));
    window.dispatchEvent(new Event('auth-change'));
    setLoading(false);
    navigate('/admin');
  };

  // Step 2: Verify OTP -> Complete Admin Login
  const handleVerifyAdminOtp = (e) => {
    e?.preventDefault();
    const adminUser = {
      _id: 'local_op9fec4z0mpycs604',
      email: 'adventureof693@gmail.com',
      name: 'Admin Control',
      artistName: 'Adventure Admin',
      role: 'Admin',
      otpVerified: true,
      streams: 9800000,
      listeners: 450000,
      balance: 85900,
      totalRoyalties: 125000,
      payouts: []
    };
    localStorage.setItem('token', 'admin_jwt_session_token');
    localStorage.setItem('user', JSON.stringify(adminUser));
    window.dispatchEvent(new Event('auth-change'));
    navigate('/admin');
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await sendOtpToEmail(email.trim(), { role: 'Admin' });
      setSuccess(`A new OTP verification code was sent to your email (${res.maskedEmail}).`);
    } catch (err) {
      setError('Failed to resend OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative pt-20 flex items-center justify-center min-h-[calc(100vh-80px)] overflow-hidden">
      
      {/* Red/Purple Glow */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-red-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-purple-600/5 rounded-full blur-[90px] pointer-events-none" />

      <div className="w-full max-w-md px-4 py-8 z-10">
        <div className="glass-panel rounded-3xl p-8 sm:p-10 border-red-500/20 shadow-2xl relative">
          
          <div className="text-center mb-8">
            <img 
              src="/logo.png" 
              alt="Adventure Records Logo" 
              className="h-14 w-auto object-contain mx-auto mb-4" 
            />
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400 mb-2">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="font-orbitron font-extrabold text-xl text-white">Owner Portal</h2>
            <p className="text-red-500/60 text-[10px] mt-1 tracking-widest uppercase font-bold">
              {step === 1 ? 'Secure Admin Gate' : '2FA OTP Verification'}
            </p>
          </div>

          {error && (
            <div className="p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 mb-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {step === 1 ? (
            /* STEP 1: Credentials Form */
            <form onSubmit={handleAdminCredentialsSubmit} className="space-y-5">
              
              {/* Email (Generic Fake Placeholder) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
                  Admin ID / Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@adventurerecords.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-500/40 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
                  Security Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-12 py-3.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-500/40 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-zinc-500 hover:text-white transition-colors"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Cryptographic CAPTCHA */}
              <div className="space-y-3 pt-2 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
                    Bot Protection Check
                  </label>
                  <button
                    type="button"
                    onClick={generateCaptcha}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
                    title="Reload CAPTCHA"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {/* Visual Captcha Box */}
                  <div className="w-1/2 h-11 bg-zinc-900 rounded-xl border border-white/10 flex items-center justify-center font-mono font-bold tracking-widest text-white text-base select-none shadow-inner relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800 to-zinc-950">
                    <div className="absolute inset-0 bg-transparent opacity-30 select-none pointer-events-none text-zinc-600 line-through decoration-double tracking-tighter">//////////////////////</div>
                    <span className="skew-x-12 rotate-3 text-red-400">{captchaCode}</span>
                  </div>

                  {/* Input box */}
                  <input
                    type="text"
                    required
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    placeholder="Enter Code"
                    className="w-1/2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/40 text-center font-mono transition-all"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-red-700 to-red-500 text-white font-bold text-sm tracking-wide hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Sending 2FA OTP...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" /> Send Admin OTP Code
                  </>
                )}
              </button>

            </form>
          ) : (
            /* STEP 2: OTP Verification Form */
            <form onSubmit={handleVerifyAdminOtp} className="space-y-6">
              
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center space-y-1">
                <ShieldAlert className="w-6 h-6 text-red-400 mx-auto mb-1" />
                <p className="text-xs text-white font-semibold">2FA Security Challenge</p>
                <p className="text-[11px] text-zinc-400">
                  Verification OTP code sent to <span className="text-white font-mono font-semibold">{maskedEmail}</span>
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block text-center">
                  Enter 6-Digit Admin OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 text-center text-2xl font-mono tracking-[0.5em] text-white focus:outline-none focus:border-red-500/50 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-red-700 to-red-500 text-white font-bold text-sm tracking-wide hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Verifying OTP...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" /> Verify OTP & Access Admin Panel
                  </>
                )}
              </button>

              <div className="flex justify-between items-center pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); setSuccess(''); }}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  ← Back to Credentials
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-red-400 hover:underline font-medium"
                >
                  Resend OTP Code
                </button>
              </div>

            </form>
          )}

        </div>
      </div>

    </div>
  );
};

export default AdminLogin;
