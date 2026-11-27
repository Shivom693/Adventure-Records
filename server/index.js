import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { connectDB } from './db/dbFallback.js';
import authRoutes, { authenticateToken } from './routes/auth.js';
import musicRoutes from './routes/music.js';
import analyticsRoutes from './routes/analytics.js';
import chatbotRoutes from './routes/chatbot.js';
import ticketRoutes from './routes/tickets.js';
import paymentRoutes from './routes/payments.js';
import razorpayRoutes from './routes/razorpay.js';
import {
  escHtml,
  getAdminEmail,
  getAdminPanelUrl,
  sanitizeHeaderField,
  sendEmail
} from './services/emailService.js';

dotenv.config();

// Global Crash Prevention & Process Resilience
process.on('uncaughtException', (err) => {
  console.error('âš ï¸ High-Traffic Handler: Uncaught Exception:', err.stack || err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('âš ï¸ High-Traffic Handler: Unhandled Rejection at:', promise, 'reason:', reason);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// High-Concurrency Performance Settings
app.disable('x-powered-by');
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    const defaultOrigins = [
      'http://localhost:5173',
      'http://localhost:5000',
      'https://adventurerecords.web.app',
      'https://music-b2696.web.app',
      'https://music-b2696.firebaseapp.com'
    ];
    const envOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
      : [];
    const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json({ 
  limit: '1mb',
  verify: (req, res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
}));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// High-Traffic & Production Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '0'); // Modern browsers use CSP instead; '1; mode=block' can cause issues
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(self "https://api.razorpay.com" "https://checkout.razorpay.com")');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' https://apis.google.com https://www.gstatic.com https://checkout.razorpay.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://*.firebaseapp.com wss://*.firebaseio.com https://api.razorpay.com https://lumberjack.razorpay.com " + (process.env.ALLOWED_ORIGINS || 'http://localhost:5173 https://adventurerecords.web.app https://music-b2696.web.app'),
    "frame-src https://accounts.google.com https://*.firebaseapp.com https://api.razorpay.com https://checkout.razorpay.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '));
  next();
});

// XSS & Injection Prevention Input Sanitization Middleware
const sanitizeInput = (data) => {
  if (typeof data === 'string') {
    return data
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<(iframe|object|embed|applet|form|link|meta|base)[^>]*>/gi, '')
      .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '')
      .replace(/<img[^>]*\s+on\w+\s*=[^>]*>/gi, '')
      .replace(/javascript\s*:/gi, '')
      .replace(/vbscript\s*:/gi, '')
      .replace(/data\s*:\s*text\/html/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/expression\s*\(/gi, '')
      .replace(/url\s*\(\s*['"]?\s*javascript/gi, '');
  }
  if (Array.isArray(data)) {
    return data.map(sanitizeInput);
  }
  if (data !== null && typeof data === 'object') {
    const sanitized = {};
    for (const key of Object.keys(data)) {
      sanitized[key] = sanitizeInput(data[key]);
    }
    return sanitized;
  }
  return data;
};

app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeInput(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeInput(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeInput(req.params);
  }
  next();
});

// High-Scale IP Request Rate Limiter (Supports up to 5,000 concurrent requests/IP window)
const ipRequestCounts = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 5000; // Scaled for high concurrent traffic spikes

// Automatic Garbage Collection for IP Cache (Runs every 10 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of ipRequestCounts.entries()) {
    const validTimestamps = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
    if (validTimestamps.length === 0) {
      ipRequestCounts.delete(ip);
    } else {
      ipRequestCounts.set(ip, validTimestamps);
    }
  }
}, 10 * 60 * 1000);

app.use((req, res, next) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown_client';
  const now = Date.now();

  let timestamps = ipRequestCounts.get(ip) || [];
  timestamps = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);

  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({
      message: 'Server traffic threshold reached. Please wait a moment and retry.'
    });
  }

  timestamps.push(now);
  ipRequestCounts.set(ip, timestamps);
  next();
});

// Strict Rate Limiter for Authentication & OTP endpoints (Max 15 requests per 15 minutes per IP)
const authRateLimitMap = new Map();
const AUTH_RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const AUTH_RATE_LIMIT_MAX = 15;

const authRateLimiter = (req, res, next) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown_client';
  const now = Date.now();
  let attempts = authRateLimitMap.get(ip) || [];
  attempts = attempts.filter(ts => now - ts < AUTH_RATE_LIMIT_WINDOW);

  if (attempts.length >= AUTH_RATE_LIMIT_MAX) {
    return res.status(429).json({
      message: 'Too many authentication attempts. Access locked for 15 minutes to protect your account.'
    });
  }

  attempts.push(now);
  authRateLimitMap.set(ip, attempts);
  next();
};

app.use(['/api/auth/login', '/api/auth/admin-login', '/api/auth/signup', '/api/send-otp', '/api/auth/forgot-password', '/api/auth/reset-password', '/api/payments/submit', '/api/notify-payment-submitted'], authRateLimiter);

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1d',
  etag: true
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', musicRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/razorpay', razorpayRoutes);
app.use('/api', razorpayRoutes);

// Direct OTP Endpoint (High Reliability with Real SMTP Email Dispatch)
// Requires authentication — the OTP is read from the user's record, never from the request body
app.post('/api/send-otp', authenticateToken, async (req, res) => {
  const rawEmail = req.body?.email;
  if (!rawEmail) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  const normalizedEmail = String(rawEmail).trim().toLowerCase();
  const authEmail = String(req.user?.email || '').trim().toLowerCase();

  // Validate the requester can only send OTP for their own email
  if (!authEmail || authEmail !== normalizedEmail) {
    return res.status(403).json({ message: 'Forbidden. You may only request OTP for your own account.' });
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[SERVER OTP DISPATCH] Verification code requested for ${normalizedEmail}`);
  }

  // Look up the OTP from DB — never trust the client to supply it
  const { db } = await import('./db/dbFallback.js');
  const user = await db.users.findOne({ email: normalizedEmail });
  if (!user || !user.otpCode) {
    return res.status(400).json({ message: 'No pending OTP found for this account.' });
  }
  const otp = user.otpCode;

  const mailResult = await sendEmail({
    fromName: 'Adventure Records',
    to: normalizedEmail,
    subject: 'Your Adventure Records Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background-color: #0d0d12; color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #27272a;">
        <h2 style="color: #ffffff; text-align: center;">Adventure Records</h2>
        <p style="color: #a1a1aa; font-size: 14px; text-align: center;">Email Verification Code</p>
        <div style="background-color: #18181b; border: 1px solid #3f3f46; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #ffffff;">${escHtml(otp)}</span>
        </div>
        <p style="color: #a1a1aa; font-size: 12px; text-align: center;">This code will expire in 5 minutes. If you did not request this code, please ignore this email.</p>
      </div>
    `
  });

  if (!mailResult.success) {
    return res.status(mailResult.invalidEmail ? 400 : 502).json({
      success: false,
      message: mailResult.error || 'Failed to send verification code email.'
    });
  }

  res.status(200).json({ success: true, message: 'OTP dispatched successfully.' });
});

// New Song Uploaded Email Notification Endpoint (requires authentication)
app.post('/api/notify-upload', authenticateToken, async (req, res) => {
  const {
    releaseTitle,
    primaryArtist,
    featuringArtists,
    releaseType,
    genre,
    language,
    releaseDate,
    artworkUrl,
    artworkDriveLink,
    audioUrl,
    audioDriveLink,
    googleDriveLink,
    tracks,
    userEmail
  } = req.body || {};

  const adminEmail = getAdminEmail();
  const adminPanelUrl = getAdminPanelUrl();
  const authEmail = String(req.user?.email || '').trim().toLowerCase();
  const bodyEmail = userEmail && userEmail !== 'Artist User' ? String(userEmail).trim().toLowerCase() : '';

  if (bodyEmail && authEmail && authEmail !== bodyEmail) {
    return res.status(403).json({ message: 'Forbidden. Email mismatch.' });
  }

  const resolvedUserEmail = authEmail || bodyEmail;
  const resolvedAudioLink = audioDriveLink || audioUrl || googleDriveLink || (tracks && tracks[0] && (tracks[0].audioDriveLink || tracks[0].audioUrl)) || '';
  const resolvedArtworkLink = artworkDriveLink || artworkUrl || '';

  console.log(`\n=================================================`);
  console.log(`[NEW SONG UPLOADED] ${releaseTitle} by ${primaryArtist}`);
  if (resolvedAudioLink) console.log(`[AUDIO DRIVE LINK]: ${resolvedAudioLink}`);
  if (resolvedArtworkLink) console.log(`[ARTWORK LINK]: ${resolvedArtworkLink}`);
  console.log(`=================================================\n`);

  const trackListHtml = Array.isArray(tracks) && tracks.length > 0
    ? tracks.map((t, idx) => {
        const trkAudio = t.audioDriveLink || t.audioUrl || resolvedAudioLink;
        return `
          <li style="margin-bottom: 8px;">
            <strong>Track ${idx + 1}:</strong> ${escHtml(t.title || releaseTitle)} ${t.isrc ? `(ISRC: ${escHtml(t.isrc)})` : ''}
            ${trkAudio ? `<br/><a href="${escHtml(trkAudio)}" target="_blank" style="color: #38bdf8; font-size: 11px; word-break: break-all;">Open Track Drive Audio &rarr;</a>` : ''}
          </li>
        `;
      }).join('')
    : `<li>${escHtml(releaseTitle)} ${resolvedAudioLink ? `<br/><a href="${escHtml(resolvedAudioLink)}" target="_blank" style="color: #38bdf8; font-size: 11px;">Open Audio Drive Link</a>` : ''}</li>`;

  const mailResult = await sendEmail({
    fromName: 'Adventure Records Curation',
    to: adminEmail,
    replyTo: resolvedUserEmail || undefined,
    subject: sanitizeHeaderField(`[New Song Uploaded] ${releaseTitle} - ${primaryArtist}`),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0d12; color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #27272a;">
        <h2 style="color: #eab308; text-align: center; margin-top: 0;">New Song Uploaded</h2>
        <hr style="border: 0; border-top: 1px solid #27272a; margin: 16px 0;" />

        <div style="margin-bottom: 20px;">
          <h3 style="margin: 0 0 4px 0; color: #ffffff; font-size: 20px;">${escHtml(releaseTitle)}</h3>
          <p style="margin: 0; color: #a1a1aa; font-size: 14px;">By <strong>${escHtml(primaryArtist)}</strong> ${featuringArtists ? `(ft. ${escHtml(featuringArtists)})` : ''}</p>
          <p style="margin: 6px 0 0 0; color: #71717a; font-size: 12px;">Type: ${escHtml(releaseType || 'Single')} &bull; Genre: ${escHtml(genre || 'Pop')} &bull; Language: ${escHtml(language || 'Hindi')}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #d4d4d8; margin-bottom: 20px;">
          <tr><td style="padding: 6px 0; font-weight: bold; width: 140px; color: #a1a1aa;">Target Date:</td><td style="color: #ffffff;">${escHtml(releaseDate || 'Immediate')}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold; color: #a1a1aa;">Uploader Email:</td><td style="color: #ffffff;">${resolvedUserEmail ? `<a href="mailto:${escHtml(resolvedUserEmail)}" style="color: #38bdf8;">${escHtml(resolvedUserEmail)}</a>` : 'Artist'}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold; color: #a1a1aa;">Submitted At:</td><td style="color: #ffffff;">${new Date().toLocaleString()}</td></tr>
        </table>

        <div style="background-color: #18181b; border: 1px solid #3f3f46; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 10px 0; color: #10b981; font-size: 13px; text-transform: uppercase;">Google Drive Submission Links:</h4>

          <div style="margin-bottom: 12px;">
            <span style="color: #a1a1aa; font-size: 12px; font-weight: bold;">Audio Master File:</span><br/>
            ${resolvedAudioLink ? `
              <a href="${escHtml(resolvedAudioLink)}" target="_blank" style="display: inline-block; margin-top: 4px; background-color: #10b981; color: #000000; font-weight: bold; padding: 6px 14px; border-radius: 6px; text-decoration: none; font-size: 12px;">Open Audio Drive Link &#8599;</a>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #a1a1aa; word-break: break-all;">${escHtml(resolvedAudioLink)}</p>
            ` : `<span style="color: #f59e0b; font-size: 12px;">No Audio Drive link provided</span>`}
          </div>

          ${resolvedArtworkLink ? `
            <div style="margin-top: 10px; border-top: 1px solid #27272a; padding-top: 10px;">
              <span style="color: #a1a1aa; font-size: 12px; font-weight: bold;">Cover Artwork:</span><br/>
              <a href="${escHtml(resolvedArtworkLink)}" target="_blank" style="display: inline-block; margin-top: 4px; background-color: #3f3f46; color: #ffffff; font-weight: bold; padding: 6px 14px; border-radius: 6px; text-decoration: none; font-size: 12px;">Open Artwork Link &#8599;</a>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #a1a1aa; word-break: break-all;">${escHtml(resolvedArtworkLink)}</p>
            </div>
          ` : ''}
        </div>

        <div style="background-color: #18181b; border: 1px solid #3f3f46; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 8px 0; color: #eab308; font-size: 13px; text-transform: uppercase;">Tracks List:</h4>
          <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #f4f4f5;">
            ${trackListHtml}
          </ul>
        </div>

        <div style="text-align: center; margin-top: 24px;">
          <a href="${escHtml(adminPanelUrl)}/admin" style="display: inline-block; background-color: #eab308; color: #000000; font-weight: bold; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 13px;">Review Release in Admin Panel &rarr;</a>
        </div>

        <div style="margin-top: 24px; font-size: 11px; color: #71717a; text-align: center;">
          Adventure Records Ingestion Desk &bull; Sent automatically to ${escHtml(adminEmail)}
        </div>
      </div>
    `
  });

  if (!mailResult.success) {
    return res.status(502).json({
      success: false,
      emailSent: false,
      message: mailResult.error || 'Upload recorded, but admin notification email could not be delivered.'
    });
  }

  res.status(200).json({ success: true, emailSent: true, message: 'Upload notification email sent.' });
});

// 1. New Payment Verification Submitted Notification (To admin — requires authentication)
app.post('/api/notify-payment-submitted', authenticateToken, async (req, res) => {
  const { paymentType, targetTitle, amount, utr, upiApp, userEmail, merchantUpiId } = req.body || {};
  const adminEmail = getAdminEmail();
  const adminPanelUrl = getAdminPanelUrl();
  const authEmail = String(req.user?.email || '').trim().toLowerCase();
  const bodyEmail = userEmail ? String(userEmail).trim().toLowerCase() : '';

  if (bodyEmail && authEmail && authEmail !== bodyEmail) {
    return res.status(403).json({ message: 'Forbidden. Email mismatch.' });
  }

  const resolvedUserEmail = authEmail || bodyEmail;

  console.log(`\n=================================================`);
  console.log(`[NEW UPI PAYMENT SUBMITTED] UTR: ${utr} | Amount: Rs.${amount}`);
  console.log(`=================================================\n`);

  const mailResult = await sendEmail({
    fromName: 'Adventure Records Payments',
    to: adminEmail,
    replyTo: resolvedUserEmail || undefined,
    subject: sanitizeHeaderField(`[New UPI Payment Verification Submitted] UTR: ${utr} (Rs.${amount})`),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0d12; color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #27272a;">
        <h2 style="color: #38bdf8; text-align: center; margin-top: 0;">Payment Verification Submitted</h2>
        <hr style="border: 0; border-top: 1px solid #27272a; margin: 16px 0;" />
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #d4d4d8; margin-bottom: 20px;">
          <tr><td style="padding: 6px 0; font-weight: bold; width: 140px; color: #a1a1aa;">Payment Type:</td><td style="color: #ffffff; text-transform: uppercase;">${escHtml(paymentType)}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold; color: #a1a1aa;">Release / Plan:</td><td style="color: #ffffff;">${escHtml(targetTitle || 'Platform Distribution')}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold; color: #a1a1aa;">Amount Paid:</td><td style="color: #4ade80; font-weight: bold; font-size: 16px;">&#8377;${escHtml(amount)}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold; color: #a1a1aa;">UTR / Trans ID:</td><td style="color: #facc15; font-family: monospace; font-size: 16px;">${escHtml(utr)}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold; color: #a1a1aa;">UPI App Used:</td><td style="color: #ffffff;">${escHtml(upiApp || 'UPI')}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold; color: #a1a1aa;">Receiver UPI:</td><td style="color: #ffffff;">${escHtml(merchantUpiId || '9691546208-3@ybl')}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold; color: #a1a1aa;">Uploader Email:</td><td style="color: #ffffff;"><a href="mailto:${escHtml(resolvedUserEmail)}" style="color: #38bdf8;">${escHtml(resolvedUserEmail)}</a></td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold; color: #a1a1aa;">Submitted At:</td><td style="color: #ffffff;">${new Date().toLocaleString()}</td></tr>
        </table>
        <div style="text-align: center; margin-top: 24px;">
          <a href="${escHtml(adminPanelUrl)}/admin" style="display: inline-block; background-color: #38bdf8; color: #000000; font-weight: bold; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 13px;">Review &amp; Verify in Admin Panel &rarr;</a>
        </div>
      </div>
    `
  });

  if (!mailResult.success) {
    return res.status(502).json({
      success: false,
      emailSent: false,
      message: mailResult.error || 'Payment notification email failed to dispatch.'
    });
  }

  res.status(200).json({ success: true, emailSent: true, message: 'Payment verification notification dispatched.' });
});

// 2. Admin Verified/Rejected Payment Result Notification (To User)
app.post('/api/notify-payment-result', authenticateToken, async (req, res) => {
  const adminEmail = getAdminEmail();
  if (req.user.role !== 'Admin' && String(req.user.email || '').toLowerCase() !== adminEmail.toLowerCase()) {
    return res.status(403).json({ message: 'Forbidden. Admin credentials required to send payment verification results.' });
  }
  const { userEmail, status, amount, utr, paymentType, targetTitle, reason } = req.body || {};

  if (!userEmail) return res.status(400).json({ message: 'User email is required.' });

  const isVerified = status === 'verified';
  const subject = sanitizeHeaderField(
    isVerified
      ? `Payment Verified - ${targetTitle || 'Adventure Records'}`
      : `Payment Submission Update - ${targetTitle || 'Adventure Records'}`
  );

  const mailResult = await sendEmail({
    fromName: 'Adventure Records Billing',
    to: userEmail,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0d12; color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #27272a;">
        <h2 style="color: ${isVerified ? '#4ade80' : '#f87171'}; text-align: center; margin-top: 0;">
          ${isVerified ? 'Payment Verified' : 'Payment Verification Status'}
        </h2>
        <hr style="border: 0; border-top: 1px solid #27272a; margin: 16px 0;" />
        <p style="color: #e4e4e7; font-size: 14px; line-height: 1.5;">
          ${isVerified
            ? `Great news! Your payment of <strong>&#8377;${escHtml(amount)}</strong> (UTR: <code style="color: #facc15;">${escHtml(utr)}</code>) has been verified by our billing team. Your ${paymentType === 'release' ? 'release upload features' : 'subscription benefits'} are now fully unlocked!`
            : `Your payment submission of <strong>&#8377;${escHtml(amount)}</strong> (UTR: <code style="color: #facc15;">${escHtml(utr)}</code>) could not be verified. ${reason ? `Reason: ${escHtml(reason)}` : ''}`}
        </p>
        <div style="margin-top: 24px; font-size: 11px; color: #71717a; text-align: center;">
          Adventure Records Payment Desk &bull; Sent to ${escHtml(userEmail)}
        </div>
      </div>
    `
  });

  if (!mailResult.success) {
    return res.status(mailResult.invalidEmail ? 400 : 502).json({
      success: false,
      emailSent: false,
      message: mailResult.error || 'Failed to deliver payment result email.'
    });
  }

  res.status(200).json({ success: true, emailSent: true, message: 'Payment result notification sent.' });
});

// Root API Health Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    concurrencyCapacity: 'high-scale'
  });
});

// Connect Database & Start Server with High-Scale Socket Settings
const startServer = async () => {
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(`ðŸš€ Adventure Records High-Scale Server running on port ${PORT}`);
  });

  // Keep-alive timeouts for zero-downtime high-traffic handling
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;
};

startServer().catch(err => {
  console.error('Failed to start server:', err);
});

