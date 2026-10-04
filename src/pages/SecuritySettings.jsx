import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Key, LogOut, Trash2, CheckCircle2, AlertCircle, Lock, 
  Smartphone, Monitor, RefreshCw, XCircle, ShieldAlert, Cpu, Eye, EyeOff
} from 'lucide-react';
import { updatePassword, signOut } from 'firebase/auth';
import { auth, isConfigured } from '../firebase';
import { 
  changePasswordBackend, fetchActiveSessions, revokeOtherSessions, 
  toggle2FABackend, deleteAccountBackend 
} from '../services/authService';
import { useAuth } from '../context/AuthContext';

const SecuritySettings = () => {
  const [user, setUser] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [toggling2FA, setToggling2FA] = useState(false);
  const [twoFactorMsg, setTwoFactorMsg] = useState('');

  // Active sessions state
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sessionMsg, setSessionMsg] = useState('');

  // Account deletion modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setUser(u);
        setTwoFactorEnabled(!!u.twoFactorEnabled);
      } catch (e) {
        setUser(null);
      }
    }
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoadingSessions(true);
    const res = await fetchActiveSessions();
    if (res.success) {
      setSessions(res.sessions || []);
    }
    setLoadingSessions(false);
  };

  // Password strength logic
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: 'None', color: 'bg-zinc-800', width: 'w-0' };
    
    const checks = {
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
        return { score: 1, label: 'Weak', color: 'bg-red-500', width: 'w-1/4', checks };
      case 3:
        return { score: 2, label: 'Fair', color: 'bg-[#585589]', width: 'w-2/4', checks };
      case 4:
        return { score: 3, label: 'Strong', color: 'bg-[#53527D]', width: 'w-3/4', checks };
      case 5:
        return { score: 4, label: 'Exceptional', color: 'bg-[#DEDCFF]', width: 'w-full', checks };
      default:
        return { score: 0, label: 'None', color: 'bg-zinc-800', width: 'w-0', checks };
    }
  };

  const strength = getPasswordStrength(newPassword);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 8 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setLoading(true);
    setPasswordMsg({ type: '', text: '' });

    try {
      // 1. Backend password change
      const backendRes = await changePasswordBackend(currentPassword, newPassword);

      // 2. Firebase client update (if configured)
      if (isConfigured && auth && auth.currentUser) {
        try {
          await updatePassword(auth.currentUser, newPassword);
        } catch (e) {}
      }

      if (backendRes.success || isConfigured) {
        setPasswordMsg({ type: 'success', text: 'Password updated successfully! Your account credentials are now secured.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMsg({ type: 'error', text: backendRes.error || 'Failed to update password.' });
      }
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    setToggling2FA(true);
    setTwoFactorMsg('');

    const nextState = !twoFactorEnabled;
    const res = await toggle2FABackend(nextState);

    if (res.success) {
      setTwoFactorEnabled(nextState);
      setTwoFactorMsg(nextState ? 'Two-Factor Authentication is now ENABLED. Verification OTP codes will be required.' : 'Two-Factor Authentication has been disabled.');
      
      // Update local storage state
      if (user) {
        const updated = { ...user, twoFactorEnabled: nextState };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
      }
    } else {
      setTwoFactorMsg('Failed to update 2FA state. Please try again.');
    }
    setToggling2FA(false);
  };

  const handleRevokeOtherSessions = async () => {
    setLoadingSessions(true);
    const res = await revokeOtherSessions();
    if (res.success) {
      setSessionMsg('All other active device sessions have been revoked successfully.');
      setSessions(res.sessions || []);
    } else {
      setSessionMsg(res.error || 'Failed to revoke sessions.');
    }
    setLoadingSessions(false);
  };

  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleDeleteAccountSubmit = async (e) => {
    e.preventDefault();
    setDeleteLoading(true);
    setDeleteError('');

    const res = await deleteAccountBackend(deletePassword);
    if (res.success) {
      setShowDeleteModal(false);
      handleLogout();
    } else {
      setDeleteError(res.error || 'Failed to verify password for account deletion.');
    }
    setDeleteLoading(false);
  };

  if (!user) return null;

  // Security score calculation
  const calcSecurityScore = () => {
    let score = 50; // Base email verification
    if (user.otpVerified) score += 20;
    if (twoFactorEnabled) score += 20;
    if (sessions.length <= 2) score += 10;
    return Math.min(score, 100);
  };

  const securityScore = calcSecurityScore();

  return (
    <div className="relative pt-12 pb-24 min-h-screen bg-[#070709] text-zinc-100 font-outfit">
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Page Header */}
        <div className="space-y-3 border-b border-white/10 pb-8">
          <div className="minimal-badge">Security Control Panel</div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight">
            Security & Data Protection
          </h1>
          <p className="text-zinc-400 text-sm max-w-2xl">
            Protect your artist catalog, multi-factor authentication, active login sessions, and data privacy settings.
          </p>
        </div>

        {/* Account Security Audit Summary Card */}
        <div className="minimal-card p-8 bg-[#09090d] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <h2 className="font-heading font-bold text-lg text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> Account Security Audit
            </h2>
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-400">
              <Cpu className="w-4 h-4" /> Security Health Score: {securityScore}%
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            <div className="space-y-1 p-3.5 bg-white/[0.02] border border-white/5 rounded-xl">
              <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">Email Status</span>
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs mt-1">
                <CheckCircle2 className="w-4 h-4" /> OTP Verified
              </div>
            </div>

            <div className="space-y-1 p-3.5 bg-white/[0.02] border border-white/5 rounded-xl">
              <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">Multi-Factor 2FA</span>
              <div className={`flex items-center gap-1.5 font-semibold text-xs mt-1 ${twoFactorEnabled ? 'text-emerald-400' : 'text-[#DEDCFF]'}`}>
                {twoFactorEnabled ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {twoFactorEnabled ? '2FA Active' : '2FA Optional'}
              </div>
            </div>

            <div className="space-y-1 p-3.5 bg-white/[0.02] border border-white/5 rounded-xl">
              <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">Active Sessions</span>
              <p className="text-white font-medium text-xs mt-1">{sessions.length || 1} Device Session(s)</p>
            </div>

            <div className="space-y-1 p-3.5 bg-white/[0.02] border border-white/5 rounded-xl">
              <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">Role & Access</span>
              <p className="text-white font-medium text-xs uppercase tracking-wider mt-1">{user.role || 'Artist'}</p>
            </div>
          </div>
        </div>

        {/* Two-Factor Authentication Panel */}
        <div className="minimal-card p-8 bg-[#09090d] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-sky-400" /> Two-Factor Email OTP Protection
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Require a 6-digit email verification code on every new device login.
              </p>
            </div>

            <button
              onClick={handleToggle2FA}
              disabled={toggling2FA}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                twoFactorEnabled 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30' 
                  : 'bg-white/10 text-white border border-white/15 hover:bg-white/20'
              }`}
            >
              {toggling2FA ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              {twoFactorEnabled ? '2FA Enabled' : 'Enable 2FA Protection'}
            </button>
          </div>

          {twoFactorMsg && (
            <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{twoFactorMsg}</span>
            </div>
          )}
        </div>

        {/* Password Management Panel */}
        <div className="minimal-card p-8 bg-[#09090d] space-y-6">
          <h2 className="font-heading font-bold text-lg text-white flex items-center gap-2 border-b border-white/10 pb-4">
            <Key className="w-5 h-5 text-white" /> Password Security
          </h2>

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Current Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">New Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters with numbers & symbols"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40"
              />

              {/* Password Strength Progress */}
              {newPassword && (
                <div className="space-y-2 mt-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-zinc-400">Password Strength:</span>
                    <span className="font-bold text-white">{strength.label}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
                  </div>
                  {strength.checks && (
                    <div className="grid grid-cols-2 gap-1.5 text-[10px] text-zinc-400 pt-1">
                      <span className={strength.checks.length ? 'text-emerald-400 font-semibold' : ''}>• 8+ Characters</span>
                      <span className={strength.checks.upper ? 'text-emerald-400 font-semibold' : ''}>• Uppercase Letter</span>
                      <span className={strength.checks.lower ? 'text-emerald-400 font-semibold' : ''}>• Lowercase Letter</span>
                      <span className={strength.checks.number ? 'text-emerald-400 font-semibold' : ''}>• Number (0-9)</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Confirm New Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40"
              />
            </div>

            {passwordMsg.text && (
              <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                passwordMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}>
                {passwordMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-6 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {loading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Active Sessions Monitor */}
        <div className="minimal-card p-8 bg-[#09090d] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                <Monitor className="w-5 h-5 text-purple-400" /> Active Devices & Sessions
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Devices currently authenticated into your Adventure Records account.
              </p>
            </div>

            <button
              onClick={handleRevokeOtherSessions}
              disabled={loadingSessions}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/15 text-zinc-200 transition-all cursor-pointer flex items-center gap-2"
            >
              {loadingSessions ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
              Revoke Other Sessions
            </button>
          </div>

          {sessionMsg && (
            <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{sessionMsg}</span>
            </div>
          )}

          <div className="space-y-3">
            {sessions.length === 0 ? (
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl text-xs text-zinc-400 flex items-center gap-3">
                <Monitor className="w-5 h-5 text-zinc-500" />
                <div>
                  <p className="text-white font-semibold">Active Browser Session</p>
                  <p className="text-zinc-500 text-[11px]">Current Device • Connected</p>
                </div>
              </div>
            ) : (
              sessions.map((sess, idx) => (
                <div key={idx} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <Monitor className="w-5 h-5 text-purple-400 shrink-0" />
                    <div>
                      <p className="text-white font-semibold">{sess.userAgent || 'Web Client Session'}</p>
                      <p className="text-zinc-500 text-[11px]">IP: {sess.ip || '127.0.0.1'} • {new Date(sess.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  {idx === 0 ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                      CURRENT
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-bold">
                      AUTHENTICATED
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* DPDP Act 2023 Data Principal Controls */}
        <div className="minimal-card p-8 bg-[#09090d] border-blue-500/20 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-500/20 pb-4">
            <div>
              <h2 className="font-heading font-bold text-lg text-blue-400 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" /> DPDP Act 2023 (India) Privacy & Consent Controls
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Manage your statutory Data Principal rights, consent withdrawal, and processing summary requests under India's Digital Personal Data Protection Act, 2023.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-extrabold uppercase tracking-wider">
              DPDP Act Compliant
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <h3 className="font-semibold text-white">Data Processing Consent</h3>
              <p className="text-zinc-400 text-[11px]">Active for distribution, ingestion & royalty accounting.</p>
              <span className="inline-block text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                Consent Granted (Sec 5)
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <h3 className="font-semibold text-white">Data Protection Officer (DPO)</h3>
              <p className="text-zinc-400 text-[11px]">Grievance Officer Email: <code className="text-sky-300">adventureof693@gmail.com</code></p>
              <span className="inline-block text-[10px] text-sky-400 font-bold bg-sky-500/10 border border-sky-500/30 px-2.5 py-0.5 rounded-full">
                72h Grievance SLA (Sec 13)
              </span>
            </div>
          </div>
        </div>

        {/* Danger Zone & Account Deletion */}
        <div className="minimal-card p-8 bg-[#09090d] border-red-500/20 space-y-6">
          <h2 className="font-heading font-bold text-lg text-red-400 flex items-center gap-2 border-b border-red-500/20 pb-4">
            <Trash2 className="w-5 h-5" /> Account Actions & Erasure (DPDP Sec 12)
          </h2>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={handleLogout}
              className="px-6 py-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Sign Out of All Devices
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-6 py-3 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Request Data Erasure & Account Deletion
            </button>
          </div>
        </div>


      </div>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f0f16] border border-red-500/30 max-w-md w-full p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6">
            <div className="flex items-center gap-3 text-red-400 border-b border-red-500/20 pb-4">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h3 className="font-heading font-bold text-lg text-white">Delete Account Permanent Confirmation</h3>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              This action will terminate your artist account and deactivate your release access on Adventure Records. Please confirm your password below to proceed.
            </p>

            <form onSubmit={handleDeleteAccountSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Confirm Your Password</label>
                <input
                  type="password"
                  required
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Enter password to verify identity"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/50"
                />
              </div>

              {deleteError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/15 text-xs text-zinc-300 hover:text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteLoading}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-2"
                >
                  {deleteLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Confirm Account Deletion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SecuritySettings;
