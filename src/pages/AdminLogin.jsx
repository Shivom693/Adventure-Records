import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, AlertCircle, RefreshCw, Key, Eye, EyeOff, CheckCircle2, ShieldAlert } from 'lucide-react';
import { API_URL } from '../config';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
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
        if (u.role === 'Admin') {
          navigate('/admin');
        }
      } catch (e) {}
    }
  }, [navigate]);

  // Admin Login: Authenticate via backend server only
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

    // 2. Basic client-side validation only (no credential checking in frontend)
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);

    try {
      // 3. Send credentials to backend for server-side validation
      const backendUrl = API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          password: password.trim() 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Invalid admin credentials. Access denied.');
        generateCaptcha();
        setCaptchaInput('');
        return;
      }

      // 4. Verify the user has Admin role (server-side validated)
      if (!data.user || data.user.role !== 'Admin') {
        setError('Unauthorized. Access restricted to authorized platform administrators.');
        return;
      }

      // 5. Store the real server-issued JWT token
      const userResponse = { ...data.user };
      delete userResponse.password;
      delete userResponse.otpCode;
      delete userResponse.resetOtpCode;

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userResponse));
      window.dispatchEvent(new Event('auth-change'));

      navigate('/admin');
    } catch (err) {
      setError('Unable to connect to authentication server. Please try again.');
      generateCaptcha();
      setCaptchaInput('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative pt-20 flex items-center justify-center min-h-[calc(100vh-80px)] overflow-hidden">
      
      {/* Red/Purple Glow */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#585589]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-[#53527D]/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="w-full max-w-md px-4 py-8 z-10">
        <div className="glass-panel rounded-3xl p-8 sm:p-10 border-[#585589]/30 shadow-2xl relative">
          
          <div className="text-center mb-8">
            <img 
              src="/logo.png" 
              alt="Adventure Records Logo" 
              className="h-14 w-auto object-contain mx-auto mb-4" 
            />
            <div className="w-10 h-10 rounded-xl bg-[#585589]/20 border border-[#585589]/40 flex items-center justify-center mx-auto text-[#DEDCFF] mb-2">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="font-heading font-extrabold text-xl text-white">Owner Portal</h2>
            <p className="text-[#DEDCFF]/70 text-[10px] mt-1 tracking-widest uppercase font-bold">
              Secure Admin Gate
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

          {/* Admin Credentials Form — validated server-side */}
          <form onSubmit={handleAdminCredentialsSubmit} className="space-y-5">
            
            {/* Email */}
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#585589] transition-all"
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-12 py-3.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#585589] transition-all"
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

            {/* CAPTCHA */}
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
                  <span className="skew-x-12 rotate-3 text-[#DEDCFF]">{captchaCode}</span>
                </div>

                {/* Input box */}
                <input
                  type="text"
                  required
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="Enter Code"
                  className="w-1/2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#585589] text-center font-mono transition-all"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-[#585589] hover:bg-[#53527D] text-white font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(88,85,137,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" /> Authenticate & Access
                </>
              )}
            </button>

          </form>

        </div>
      </div>

    </div>
  );
};

export default AdminLogin;
