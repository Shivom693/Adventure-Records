/**
 * Adventure Records — Secure Authentication Service
 * OTP generation and verification handled exclusively server-side.
 */

// Mask email for privacy (e.g. "shivom@gmail.com" -> "s***m@gmail.com")
export const maskEmail = (email) => {
  if (!email || !email.includes('@')) return 'u***@domain.com';
  const [name, domain] = email.split('@');
  if (name.length <= 2) {
    return `${name[0]}***@${domain}`;
  }
  return `${name[0]}***${name[name.length - 1]}@${domain}`;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || '';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

/**
 * Requests OTP dispatch to email via server-side generation.
 * The OTP is NEVER returned to or stored on the client.
 */
export const sendOtpToEmail = async (email, userDetails = {}) => {
  const targetEmail = email.toLowerCase().trim();

  try {
    const response = await fetch(`${API_BASE_URL}/api/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: targetEmail,
        subject: "Your Adventure Records verification code"
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || 'Failed to send OTP.' };
    }

    // Store only non-sensitive session metadata (no OTP code)
    const sessionMeta = {
      email: targetEmail,
      createdAt: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000,
      resendAvailableAt: Date.now() + 60 * 1000,
      userDetails: userDetails
    };
    sessionStorage.setItem('pending_otp_session', JSON.stringify(sessionMeta));

    return {
      success: true,
      maskedEmail: maskEmail(targetEmail),
      expiresInSeconds: 300,
      resendCooldownSeconds: 60
    };
  } catch (err) {
    return { success: false, error: 'Unable to connect to server.' };
  }
};

/**
 * Verifies the 6-digit OTP code via the backend server.
 * The server validates the code — it is never checked client-side.
 */
export const verifyOtpCode = async (enteredCode) => {
  const rawData = sessionStorage.getItem('pending_otp_session');
  if (!rawData) {
    return { success: false, error: "No active verification session found. Please sign in again." };
  }

  const session = JSON.parse(rawData);

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: session.email,
        otp: enteredCode.trim()
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || 'Invalid verification code.' };
    }

    // Clean up session metadata
    sessionStorage.removeItem('pending_otp_session');

    return { success: true };
  } catch (err) {
    return { success: false, error: 'Unable to verify code. Please try again.' };
  }
};

/**
 * Resends a new OTP code to email if cooldown has passed.
 */
export const resendOtpCode = async () => {
  const rawData = sessionStorage.getItem('pending_otp_session');
  if (!rawData) {
    return { success: false, error: "No active verification session found." };
  }

  const session = JSON.parse(rawData);
  const now = Date.now();

  if (now < session.resendAvailableAt) {
    const secondsLeft = Math.ceil((session.resendAvailableAt - now) / 1000);
    return { success: false, error: `Please wait ${secondsLeft} seconds before requesting a new code.` };
  }

  return await sendOtpToEmail(session.email, session.userDetails);
};

/**
 * Helper to check current authentication status
 */
export const getAuthStatus = () => {
  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  if (!userStr || !token) return { isAuthenticated: false, isOtpVerified: false, user: null };
  try {
    const user = JSON.parse(userStr);
    return {
      isAuthenticated: true,
      isOtpVerified: !!user.otpVerified,
      user: user
    };
  } catch (e) {
    return { isAuthenticated: false, isOtpVerified: false, user: null };
  }
};

/**
 * Changes user password via backend API
 */
export const changePasswordBackend = async (currentPassword, newPassword) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update password.');
    return { success: true, message: data.message };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Dispatches password reset OTP to email
 */
export const forgotPasswordBackend = async (email) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to request password reset.');
    return { success: true, message: data.message };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Resets user password using email, OTP code, and new password
 */
export const resetPasswordBackend = async (email, otp, newPassword) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to reset password.');
    return { success: true, message: data.message };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Fetches active sessions history
 */
export const fetchActiveSessions = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/sessions`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch sessions.');
    return { success: true, sessions: data.sessions || [] };
  } catch (err) {
    return { success: false, error: err.message, sessions: [] };
  }
};

/**
 * Revokes all other active sessions except current
 */
export const revokeOtherSessions = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/revoke-sessions`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to revoke sessions.');
    return { success: true, message: data.message, sessions: data.sessions || [] };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Toggles Two-Factor Authentication (2FA) status
 */
export const toggle2FABackend = async (enabled) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/profile/2fa`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ enabled })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update 2FA setting.');
    return { success: true, message: data.message, user: data.user };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Requests permanent account deletion
 */
export const deleteAccountBackend = async (password) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/account`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete account.');
    return { success: true, message: data.message };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
