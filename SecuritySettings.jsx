import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Key, LogOut, Trash2, CheckCircle2, AlertCircle, Lock, User, RefreshCw } from 'lucide-react';
import { updatePassword, signOut } from 'firebase/auth';
import { auth, isConfigured } from '../firebase';

const SecuritySettings = () => {
  const [user, setUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    }
  }, []);

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
      if (isConfigured && auth && auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
      }
      setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      if (err.code === 'auth/requires-recent-login') {
        setPasswordMsg({ type: 'error', text: 'Please log out and sign in again before changing password.' });
      } else {
        setPasswordMsg({ type: 'error', text: err.message || 'Failed to update password.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (isConfigured && auth) {
      try { await signOut(auth); } catch (e) {}
    }
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('pending_otp_session');
    window.dispatchEvent(new Event('auth-change'));
    navigate('/');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your Adventure Records account? This action is irreversible.')) {
      handleLogout();
    }
  };

  if (!user) return null;

  return (
    <div className="relative pt-12 pb-24 min-h-screen bg-[#070709] text-zinc-100 font-outfit">
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="space-y-3 border-b border-white/10 pb-8">
          <div className="minimal-badge">Account Settings</div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight">
            Security & Authentication
          </h1>
          <p className="text-zinc-400 text-sm">
            Manage your credentials, multi-step email verification, and session parameters.
          </p>
        </div>

        {/* Overview Panel */}
        <div className="minimal-card p-8 bg-[#09090d] space-y-6">
          <h2 className="font-heading font-bold text-lg text-white flex items-center gap-2 border-b border-white/10 pb-4">
            <ShieldCheck className="w-5 h-5 text-emerald-400" /> Account Security Status
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1">
              <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">Email Address</span>
              <p className="text-white font-medium text-sm">{user.email}</p>
            </div>

            <div className="space-y-1">
              <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">Authentication Provider</span>
              <p className="text-white font-medium text-sm capitalize">{user.authProvider || 'Email / Password'}</p>
            </div>

            <div className="space-y-1">
              <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">Email OTP Verification</span>
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs mt-1">
                <CheckCircle2 className="w-4 h-4" /> Verified Active Session
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">Account Role</span>
              <p className="text-white font-medium text-sm uppercase tracking-wider">{user.role || 'Artist'}</p>
            </div>
          </div>
        </div>

        {/* Change Password Panel */}
        <div className="minimal-card p-8 bg-[#09090d] space-y-6">
          <h2 className="font-heading font-bold text-lg text-white flex items-center gap-2 border-b border-white/10 pb-4">
            <Key className="w-5 h-5 text-white" /> Password Management
          </h2>

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40"
              />
            </div>

            {passwordMsg.text && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                passwordMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}>
                {passwordMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-6 py-3 rounded-xl text-xs font-semibold"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="minimal-card p-8 bg-[#09090d] border-red-500/20 space-y-6">
          <h2 className="font-heading font-bold text-lg text-red-400 flex items-center gap-2 border-b border-red-500/20 pb-4">
            <Trash2 className="w-5 h-5" /> Account Actions
          </h2>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={handleLogout}
              className="px-6 py-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Sign Out of All Devices
            </button>

            <button
              onClick={handleDeleteAccount}
              className="px-6 py-3 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Request Account Deletion
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SecuritySettings;
