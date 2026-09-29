import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, RefreshCw, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import { isConfigured, auth, googleProvider } from '../firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { API_URL } from '../config';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  React.useEffect(() => {
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

  // Email + Password Login Handler
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setError('');
    setLoading(true);

    const cleanEmail = email.toLowerCase().trim();

    try {
      const backendUrl = API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';
      let firebaseUser = null;

      // Try Firebase auth first if configured
      if (isConfigured && auth) {
        try {
          const userCred = await signInWithEmailAndPassword(auth, cleanEmail, password);
          firebaseUser = userCred.user;
        } catch (firebaseErr) {
          if (firebaseErr.code === 'auth/user-not-found' || firebaseErr.code === 'auth/wrong-password' || firebaseErr.code === 'auth/invalid-credential') {
            setError('Invalid email or password credentials.');
            setLoading(false);
            return;
          } else if (firebaseErr.code === 'auth/too-many-requests') {
            setError('Too many failed attempts. Please try again later or reset your password.');
            setLoading(false);
            return;
          }
          // For other Firebase errors, continue to try backend auth
        }
      }

      // Try authenticating via backend server to get a real JWT
      try {
        const response = await fetch(`${backendUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password })
        });

        if (response.ok) {
          const data = await response.json();
          const userResponse = { ...data.user };
          delete userResponse.password;
          delete userResponse.otpCode;
          delete userResponse.resetOtpCode;

          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(userResponse));
          window.dispatchEvent(new Event('auth-change'));

          if (userResponse.role === 'Admin') {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
          return;
        } else if (!firebaseUser) {
          const data = await response.json().catch(() => ({}));
          setError(data.message || 'Invalid email or password credentials.');
          setLoading(false);
          return;
        }
      } catch (backendFetchErr) {
        // Backend server is offline / unreachable
        if (!firebaseUser) {
          setError('Unable to connect to authentication server. Please try again.');
          setLoading(false);
          return;
        }
      }

      // If Firebase auth succeeded but backend fetch was offline/unavailable, fallback to Firebase session
      if (firebaseUser) {
        const userObj = {
          email: firebaseUser.email,
          name: firebaseUser.displayName || cleanEmail.split('@')[0],
          artistName: firebaseUser.displayName || cleanEmail.split('@')[0],
          role: 'Artist',
          uid: firebaseUser.uid,
          isOtpVerified: true
        };

        localStorage.setItem('token', `firebase-${firebaseUser.uid}`);
        localStorage.setItem('user', JSON.stringify(userObj));
        window.dispatchEvent(new Event('auth-change'));

        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to authentication server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Login Handler
  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const backendUrl = API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';
      let googleEmail = '';
      let googleName = 'Independent Artist';
      let uid = '';

      if (isConfigured && auth) {
        const result = await signInWithPopup(auth, googleProvider);
        if (result.user && result.user.email) {
          googleEmail = result.user.email;
          googleName = result.user.displayName || googleEmail.split('@')[0];
          uid = result.user.uid || '';
        }
      }

      if (!googleEmail) {
        setError('Google Sign-In failed. No email received.');
        setLoading(false);
        return;
      }

      // Sync with backend to get a real JWT token if server is online
      try {
        const response = await fetch(`${backendUrl}/api/auth/firebase-sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: googleEmail,
            name: googleName,
            artistName: googleName,
            firebaseUid: uid
          })
        });

        if (response.ok) {
          const data = await response.json();
          const userResponse = { ...data.user };
          delete userResponse.password;
          delete userResponse.otpCode;

          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(userResponse));
          window.dispatchEvent(new Event('auth-change'));

          navigate('/dashboard');
          return;
        }
      } catch (syncErr) {
        // Backend offline fallback to Firebase user session
      }

      // Fallback: Log in directly with Firebase Google user profile
      const userObj = {
        email: googleEmail,
        name: googleName,
        artistName: googleName,
        role: 'Artist',
        uid: uid,
        isOtpVerified: true
      };

      localStorage.setItem('token', `firebase-google-${uid}`);
      localStorage.setItem('user', JSON.stringify(userObj));
      window.dispatchEvent(new Event('auth-change'));

      navigate('/dashboard');
    } catch (err) {
      let errorMsg = err.message || 'Google Sign-In failed.';
      if (err.code === 'auth/popup-blocked') {
        errorMsg = 'Popup was blocked by your browser. Please enable popups for this site.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        errorMsg = 'Sign-in popup was closed before completing.';
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
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-1">
            <BrandLogo variant="auth" />
          </div>

          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-white tracking-tight">
            Welcome back.
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Sign in to manage your music, releases and royalties.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-6">
          
          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="btn-secondary w-full py-3.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-3 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-6.887 4.114-4.68 0-8.46-3.87-8.46-8.514 0-4.644 3.78-8.514 8.46-8.514 2.428 0 4.103.951 5.03 1.802l3.076-3.076C18.285.926 15.547 0 12.24 0 5.58 0 0 5.485 0 12.285S5.58 24.57 12.24 24.57c6.643 0 11.237-4.671 11.237-11.43 0-.759-.09-1.346-.225-1.855H12.24z" />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-white/10"></div>
            <span className="bg-[#0d0d12] px-3 text-[10px] uppercase font-bold tracking-widest text-zinc-500 absolute">OR</span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pl-11 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 transition-all"
                />
                <Mail className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-zinc-300">Password</label>
                <Link to="/forgot-password" className="text-xs text-zinc-400 hover:text-white transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 rounded-xl text-sm font-semibold shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Sign In
                </>
              )}
            </button>

          </form>

          {/* Footer Link */}
          <div className="text-center pt-2 text-xs text-zinc-400 space-y-2">
            <div>
              Don't have an artist account?{' '}
              <Link to="/signup" className="text-white font-semibold underline">
                Create an account
              </Link>
            </div>
            <div className="pt-2 border-t border-white/5">
              <Link to="/admin-login" className="inline-flex items-center gap-1.5 text-[11px] text-red-400/80 hover:text-red-400 font-semibold tracking-wide transition-colors">
                <ShieldAlert className="w-3.5 h-3.5" /> Admin Console Portal
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Login;
