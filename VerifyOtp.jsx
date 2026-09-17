import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Disc, CheckCircle2, ArrowRight, RefreshCw, AlertCircle, Mail } from 'lucide-react';
import { verifyOtpCode, resendOtpCode, maskEmail } from '../services/authService';

const VerifyOtp = () => {
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [maskedUserEmail, setMaskedUserEmail] = useState('');
  const [rawUserEmail, setRawUserEmail] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  const inputRefs = useRef([]);
  const navigate = useNavigate();

  // Load session email and demo OTP
  useEffect(() => {
    const sessionData = sessionStorage.getItem('pending_otp_session');
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        setRawUserEmail(session.email);
        setMaskedUserEmail(maskEmail(session.email));
        if (session.otp) {
          setDemoOtp(session.otp);
        }
      } catch (e) {
        setMaskedUserEmail('u***@domain.com');
      }
    } else {
      // Check if user is already logged in & verified
      const currentUser = localStorage.getItem('user');
      if (currentUser) {
        try {
          const u = JSON.parse(currentUser);
          if (u.otpVerified) {
            navigate('/dashboard');
            return;
          }
          setMaskedUserEmail(maskEmail(u.email));
        } catch (e) {
          navigate('/login');
          return;
        }
      } else {
        navigate('/login');
        return;
      }
    }

    // Focus first input box
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [navigate]);

  // Cooldown countdown timer (60s)
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Handle single digit input
  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Numeric only

    const newOtp = [...otpDigits];
    newOtp[index] = value.slice(-1);
    setOtpDigits(newOtp);
    setError('');

    // Move to next input box if filled
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are filled
    if (newOtp.every(digit => digit !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  // Handle Backspace navigation
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Paste (Pasting a 6-digit code)
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtpDigits(digits);
      setError('');
      digits.forEach((digit, idx) => {
        if (inputRefs.current[idx]) {
          inputRefs.current[idx].value = digit;
        }
      });
      handleVerify(pastedData);
    }
  };

  // Verify OTP submission
  const handleVerify = (codeToVerify) => {
    const code = codeToVerify || otpDigits.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setLoading(true);
    setError('');

    setTimeout(() => {
      const result = verifyOtpCode(code);
      setLoading(false);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        setError(result.error);
      }
    }, 300);
  };

  // Auto-fill demo OTP
  const handleAutoFillDemoOtp = () => {
    if (demoOtp && demoOtp.length === 6) {
      const digits = demoOtp.split('');
      setOtpDigits(digits);
      setError('');
      handleVerify(demoOtp);
    }
  };

  // Resend OTP Code to Email
  const handleResend = async () => {
    if (cooldown > 0) return;
    setResending(true);
    setError('');
    setResendSuccess(false);

    const result = await resendOtpCode();
    setResending(false);

    if (result.success) {
      setCooldown(60);
      setResendSuccess(true);
      setOtpDigits(['', '', '', '', '', '']);
      if (result.otp) {
        setDemoOtp(result.otp);
      }
      inputRefs.current[0]?.focus();
      setTimeout(() => setResendSuccess(false), 4000);
    } else {
      setError(result.error);
    }
  };

  // Change Account (Clear pending session and restart)
  const handleChangeAccount = () => {
    sessionStorage.removeItem('pending_otp_session');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('auth-change'));
    navigate('/login');
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center pt-8 pb-20 px-4 sm:px-6 lg:px-8 bg-[#070709] text-zinc-100 font-outfit">
      
      {/* Glow Ambient Lights */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-white/[0.02] blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full minimal-card p-8 sm:p-10 bg-[#0d0d12] border-white/15 shadow-2xl relative space-y-7">
        
        {/* Brand Logo & Header */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-block group mb-1">
            <img 
              src="/logo.png" 
              alt="Adventure Records Logo" 
              className="h-16 w-auto object-contain mx-auto transition-transform duration-300 group-hover:scale-105" 
            />
          </Link>

          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-white tracking-tight">
            Verify your email
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            We've sent a 6-digit verification code to
          </p>
          <p className="text-sm font-semibold text-white bg-white/5 border border-white/10 px-4 py-1.5 rounded-full w-fit mx-auto">
            {maskedUserEmail}
          </p>
        </div>

        {/* Resend success notice */}
        {resendSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>New verification code generated! Check code above or in console.</span>
          </div>
        )}

        {/* Success State Overlay */}
        {success ? (
          <div className="py-8 text-center space-y-4 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="font-heading font-bold text-xl text-white">✓ Email verified</h2>
            <p className="text-xs text-zinc-400">Redirecting to your Artist Dashboard...</p>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }} className="space-y-6">
            
            {/* 6 Digit Input Boxes */}
            <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  disabled={loading}
                  className="w-11 h-13 sm:w-12 sm:h-14 bg-white/5 border border-white/15 focus:border-white text-center text-xl font-heading font-bold text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-white transition-all disabled:opacity-50"
                />
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Verify Code Button */}
            <button
              type="submit"
              disabled={loading || otpDigits.some(d => d === '')}
              className="btn-primary w-full py-3.5 rounded-xl text-sm font-semibold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Verifying...
                </>
              ) : (
                <>
                  Verify Code <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Resend Code & Timer */}
            <div className="pt-2 text-center space-y-3 text-xs border-t border-white/10">
              <div className="flex items-center justify-between text-zinc-400">
                <span>Didn't receive code?</span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0 || resending}
                  className="font-semibold text-white hover:underline disabled:text-zinc-500 disabled:no-underline"
                >
                  {resending ? 'Sending to email...' : cooldown > 0 ? `Resend in 00:${cooldown < 10 ? '0' : ''}${cooldown}` : 'Resend Code to Email'}
                </button>
              </div>

              {/* Change Account Link */}
              <div>
                <button
                  type="button"
                  onClick={handleChangeAccount}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors text-[11px]"
                >
                  Change account / Log out
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};

export default VerifyOtp;
