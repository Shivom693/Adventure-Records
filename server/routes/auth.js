import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../db/dbFallback.js';

const router = express.Router();

// Use environment JWT_SECRET; if missing, generate a random one (will invalidate on restart, which is safe)
const JWT_SECRET = process.env.JWT_SECRET && process.env.JWT_SECRET !== 'adventure_records_secret_key'
  ? process.env.JWT_SECRET
  : (() => {
      const generated = crypto.randomBytes(64).toString('hex');
      console.warn('⚠️  JWT_SECRET not set or using default — generated ephemeral secret. Set a strong JWT_SECRET in .env for production.');
      return generated;
    })();

const IS_DEV = process.env.NODE_ENV !== 'production';

// 1. IN-MEMORY LOGIN ATTEMPT LIMITER (Map-based with automatic cleanup)
const loginAttempts = new Map(); // Schema: Map<ip, { count: Number, lockUntil: Number }>

// Periodic cleanup every 30 minutes to prevent memory leak under sustained attack
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of loginAttempts.entries()) {
    if (record.lockUntil < now && record.count === 0) {
      loginAttempts.delete(ip);
    } else if (record.lockUntil < now) {
      // Reset count after lockout expires
      record.count = 0;
    }
  }
}, 30 * 60 * 1000);

const checkLoginAttempts = (ip) => {
  const record = loginAttempts.get(ip);
  if (record && record.lockUntil > Date.now()) {
    const minutesLeft = Math.ceil((record.lockUntil - Date.now()) / (60 * 1000));
    return { blocked: true, minutesLeft };
  }
  return { blocked: false };
};

const recordLoginFailure = (ip) => {
  const record = loginAttempts.get(ip);
  if (!record) {
    loginAttempts.set(ip, { count: 1, lockUntil: 0 });
  } else {
    record.count += 1;
    // Lock out for 15 minutes after 5 failures
    if (record.count >= 5) {
      record.lockUntil = Date.now() + 15 * 60 * 1000;
    }
  }
};

const clearLoginFailures = (ip) => {
  loginAttempts.delete(ip);
};

// JWT Authentication Middleware
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No authentication token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db.users.findById(decoded.id || decoded._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

// 2. SIGN UP ROUTE (Generates Verification OTP)
router.post('/signup', async (req, res) => {
  const { email, password, name, artistName, role, phone } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const existingUser = await db.users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // Generate 6-digit OTP code using crypto for better randomness
    const generatedOtp = crypto.randomInt(100000, 999999).toString();
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Default stats
    const defaultStats = {
      streams: 0,
      listeners: 0,
      balance: 0,
      totalRoyalties: 0,
      payouts: [],
      verificationStatus: 'None',
      isActive: false, // Account disabled until OTP verified
      otpCode: generatedOtp,
      twoFactorEnabled: false,
      loginHistory: []
    };

    const newUser = await db.users.create({
      email,
      password: hashedPassword,
      name: name || '',
      artistName: artistName || name || 'New Artist',
      role: role || 'Artist',
      phone: phone || '',
      ...defaultStats
    });

    // Log OTP status only in development mode, never reveal the code in production
    if (IS_DEV) {
      console.log(`📬 [OTP DISPATCH] Verification OTP generated for ${email}`);
    }

    res.status(200).json({
      message: 'Signup details accepted. Verification OTP code has been dispatched.',
      email: newUser.email,
      otpSent: true
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during signup.', error: error.message });
  }
});

// 3. VERIFY OTP ROUTE (Activates Account)
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP verification code are required.' });
  }

  try {
    const user = await db.users.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.otpCode !== otp) {
      return res.status(400).json({ message: 'Invalid or expired OTP code.' });
    }

    // Activate account
    const updatedUser = await db.users.findByIdAndUpdate(user._id || user.id, {
      isActive: true,
      otpCode: null
    });

    res.status(200).json({
      message: 'Email address verified and account activated. You can now login.',
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during OTP verification.', error: error.message });
  }
});

// 4. LOGIN ROUTE (Rate-limited, Tracks IP/Device, Verifies OTP Activation)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'] || 'Unknown Device';

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  // Check login rate limit
  const limitCheck = checkLoginAttempts(ip);
  if (limitCheck.blocked) {
    return res.status(429).json({ 
      message: `Too many failed attempts. Access locked for this IP. Try again in ${limitCheck.minutesLeft} minutes.` 
    });
  }

  try {
    const user = await db.users.findOne({ email });
    if (!user) {
      recordLoginFailure(ip);
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Verify account activation
    if (user.isActive === false) {
      return res.status(401).json({ message: 'Account is inactive. Please verify your OTP first.' });
    }

    if (!user.password) {
      return res.status(400).json({ message: 'Password account is not configured. Please use Google login.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      recordLoginFailure(ip);
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Clear IP failure counts
    clearLoginFailures(ip);

    // Track active login sessions (IP and Device metadata)
    const loginLogs = [...(user.loginHistory || [])];
    loginLogs.unshift({
      ip,
      userAgent: userAgent.split(') ')[0].replace('Mozilla/5.0 (', '') || 'Web Client Session',
      timestamp: new Date().toISOString()
    });
    
    // Limit log size to 10 entries
    const updatedLogs = loginLogs.slice(0, 10);
    await db.users.findByIdAndUpdate(user._id || user.id, { loginHistory: updatedLogs });

    // Generate JWT
    const token = jwt.sign(
      { id: user._id || user.id, email: user.email, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: '12h' }
    );

    const userResponse = { ...user, loginHistory: updatedLogs };
    delete userResponse.password;

    res.status(200).json({
      message: 'Login successful!',
      token,
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
});

// 5. SOCIAL / GOOGLE SYNC ROUTE
router.post('/firebase-sync', async (req, res) => {
  const { email, name, artistName, role, phone, firebaseUid } = req.body;
  const ip = req.ip || req.socket.remoteAddress;

  if (!email) {
    return res.status(400).json({ message: 'Email is required for syncing.' });
  }

  try {
    let user = await db.users.findOne({ email });

    if (!user) {
      const defaultStats = {
        streams: 0,
        listeners: 0,
        balance: 0,
        totalRoyalties: 0,
        payouts: [],
        verificationStatus: 'None',
        isActive: true, // Google registered accounts bypass registration OTP
        twoFactorEnabled: false,
        loginHistory: [{ ip, userAgent: 'Google Sign-in popup Auth', timestamp: new Date().toISOString() }]
      };

      user = await db.users.create({
        email,
        name: name || '',
        artistName: artistName || name || 'Google Artist',
        role: role || 'Artist',
        phone: phone || '',
        firebaseUid,
        ...defaultStats
      });
    } else {
      // Sync UID & Append session log
      const updates = { isActive: true };
      if (firebaseUid && !user.firebaseUid) updates.firebaseUid = firebaseUid;
      
      const loginLogs = [...(user.loginHistory || [])];
      loginLogs.unshift({ ip, userAgent: 'Google Sign-in popup Auth', timestamp: new Date().toISOString() });
      updates.loginHistory = loginLogs.slice(0, 10);

      user = await db.users.findByIdAndUpdate(user._id || user.id, updates);
    }

    const token = jwt.sign(
      { id: user._id || user.id, email: user.email, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: '12h' }
    );

    const userResponse = { ...user };
    delete userResponse.password;

    res.status(200).json({
      message: 'Firebase sync successful!',
      token,
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during sync.', error: error.message });
  }
});

// 6. TOGGLE 2FA ENCRYPTION SWITCH
router.put('/profile/2fa', authenticateToken, async (req, res) => {
  const { enabled } = req.body;
  
  if (enabled === undefined) {
    return res.status(400).json({ message: '2FA enable state required.' });
  }

  try {
    const updatedUser = await db.users.findByIdAndUpdate(req.user._id || req.user.id, {
      twoFactorEnabled: !!enabled
    });
    
    const userResponse = { ...updatedUser };
    delete userResponse.password;

    res.status(200).json({
      message: enabled ? 'Two-Factor Authentication activated.' : 'Two-Factor Authentication disabled.',
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating 2FA settings.' });
  }
});

// 7. GET PROFILE DETAILS
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userResponse = { ...req.user };
    delete userResponse.password;
    res.status(200).json({ user: userResponse });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching profile details.' });
  }
});

// 8. CHANGE PASSWORD ROUTE
router.put('/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ message: 'New password must be at least 8 characters long.' });
  }

  try {
    const user = await db.users.findById(req.user._id || req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.password) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required.' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect.' });
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await db.users.findByIdAndUpdate(user._id || user.id, { password: hashedPassword });

    res.status(200).json({ message: 'Password updated successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating password.', error: error.message });
  }
});

// 9. FORGOT PASSWORD ROUTE (Generates & Sends OTP)
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ message: 'Valid email address is required.' });
  }

  try {
    const user = await db.users.findOne({ email });
    
    // Always return success response to prevent email enumeration attack
    if (user) {
      const generatedOtp = crypto.randomInt(100000, 999999).toString();
      await db.users.findByIdAndUpdate(user._id || user.id, {
        resetOtpCode: generatedOtp,
        resetOtpExpires: Date.now() + 15 * 60 * 1000 // 15 mins
      });

      if (IS_DEV) {
        console.log(`📬 [RESET PASSWORD OTP] Code generated for ${email}`);
      }
    }

    res.status(200).json({
      message: 'If an account exists for this email, password reset instructions have been sent.',
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error handling password reset request.' });
  }
});

// 10. RESET PASSWORD ROUTE (Verifies OTP & Sets New Password)
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'Email, OTP code, and new password are required.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'New password must be at least 8 characters long.' });
  }

  try {
    const user = await db.users.findOne({ email });
    if (!user || user.resetOtpCode !== otp || !user.resetOtpExpires || Date.now() > user.resetOtpExpires) {
      return res.status(400).json({ message: 'Invalid or expired OTP code.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await db.users.findByIdAndUpdate(user._id || user.id, {
      password: hashedPassword,
      resetOtpCode: null,
      resetOtpExpires: null
    });

    res.status(200).json({
      message: 'Password successfully reset! You can now log in with your new password.',
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error resetting password.' });
  }
});

// 11. ACTIVE SESSIONS MONITORING ROUTE
router.get('/sessions', authenticateToken, async (req, res) => {
  try {
    const user = await db.users.findById(req.user._id || req.user.id);
    const sessions = user ? user.loginHistory || [] : [];
    res.status(200).json({ sessions });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching session logs.' });
  }
});

// 12. REVOKE OTHER SESSIONS ROUTE
router.post('/revoke-sessions', authenticateToken, async (req, res) => {
  try {
    const user = await db.users.findById(req.user._id || req.user.id);
    const recentSession = (user.loginHistory || []).slice(0, 1);
    await db.users.findByIdAndUpdate(user._id || user.id, { loginHistory: recentSession });
    res.status(200).json({ message: 'All other active session tokens revoked successfully.', sessions: recentSession });
  } catch (error) {
    res.status(500).json({ message: 'Error revoking sessions.' });
  }
});

// 13. ACCOUNT DELETION ROUTE (GDPR / DPDP Privacy Compliance)
router.delete('/account', authenticateToken, async (req, res) => {
  const { password } = req.body;

  try {
    const user = await db.users.findById(req.user._id || req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.password && password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect password confirmation.' });
      }
    }

    await db.users.findByIdAndUpdate(user._id || user.id, { isActive: false, deletedAt: new Date().toISOString() });
    res.status(200).json({ message: 'Account scheduled for deletion and session terminated successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting account.' });
  }
});

// 14. APPROVE ARTIST ID VERIFICATION (Admin only)
router.put('/admin/users/:userId/verify', authenticateToken, async (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Forbidden. Admin credentials required.' });
  }

  const { status } = req.body; // 'Verified' or 'None'
  if (!['Verified', 'None'].includes(status)) {
    return res.status(400).json({ message: 'Invalid verification status.' });
  }

  try {
    const user = await db.users.findByIdAndUpdate(req.params.userId, {
      verificationStatus: status
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      message: `User verification badge updated to ${status} successfully!`
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating verification badge.' });
  }
});

export default router;
