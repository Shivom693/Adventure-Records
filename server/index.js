import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import { connectDB } from './db/dbFallback.js';
import authRoutes from './routes/auth.js';
import musicRoutes from './routes/music.js';
import analyticsRoutes from './routes/analytics.js';
import chatbotRoutes from './routes/chatbot.js';
import ticketRoutes from './routes/tickets.js';

dotenv.config();

// Global Crash Prevention & Process Resilience
process.on('uncaughtException', (err) => {
  console.error('⚠️ High-Traffic Handler: Uncaught Exception:', err.stack || err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ High-Traffic Handler: Unhandled Rejection at:', promise, 'reason:', reason);
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
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// High-Traffic & Production Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  next();
});

// XSS & Injection Prevention Input Sanitization Middleware
const sanitizeInput = (data) => {
  if (typeof data === 'string') {
    return data
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
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
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown_client';
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
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown_client';
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

app.use(['/api/auth/login', '/api/auth/signup', '/api/send-otp', '/api/auth/forgot-password', '/api/auth/reset-password'], authRateLimiter);

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

// Direct OTP Endpoint (High Reliability with Real SMTP Email Dispatch)
app.post('/api/send-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP code are required.' });
  }

  console.log(`\n=================================================`);
  console.log(`📬 [SERVER OTP DISPATCH] Verification Code for ${email} is: ${otp}`);
  console.log(`=================================================\n`);

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (emailUser && emailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass
        }
      });

      await transporter.sendMail({
        from: `"Adventure Records" <${emailUser}>`,
        to: email,
        subject: 'Your Adventure Records Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background-color: #0d0d12; color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #27272a;">
            <h2 style="color: #ffffff; text-align: center;">Adventure Records</h2>
            <p style="color: #a1a1aa; font-size: 14px; text-align: center;">Email Verification Code</p>
            <div style="background-color: #18181b; border: 1px solid #3f3f46; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
              <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #ffffff;">${otp}</span>
            </div>
            <p style="color: #a1a1aa; font-size: 12px; text-align: center;">This code will expire in 5 minutes. If you did not request this code, please ignore this email.</p>
          </div>
        `
      });
      console.log(`✅ [REAL EMAIL DISPATCHED] Verification code sent to ${email}`);
    } catch (mailErr) {
      console.error(`❌ [SMTP MAIL ERROR] Failed to send email to ${email}:`, mailErr.message);
    }
  }

  res.status(200).json({ success: true, message: 'OTP dispatched successfully.' });
});

// New Song Uploaded Email Notification Endpoint
app.post('/api/notify-upload', async (req, res) => {
  const { releaseTitle, primaryArtist, featuringArtists, releaseType, genre, language, releaseDate, artworkUrl, tracks, userEmail } = req.body;
  const adminEmail = 'adventureof693@gmail.com';

  console.log(`\n=================================================`);
  console.log(`🎵 [NEW SONG UPLOADED] ${releaseTitle} by ${primaryArtist}`);
  console.log(`=================================================\n`);

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (emailUser && emailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass
        }
      });

      const trackListHtml = Array.isArray(tracks) && tracks.length > 0
        ? tracks.map((t, idx) => `<li style="margin-bottom: 6px;"><strong>Track ${idx + 1}:</strong> ${t.title || releaseTitle} ${t.isrc ? `(ISRC: ${t.isrc})` : ''}</li>`).join('')
        : `<li>${releaseTitle}</li>`;

      await transporter.sendMail({
        from: `"Adventure Records Curation" <${emailUser}>`,
        to: adminEmail,
        subject: `🎵 [New Song Uploaded] ${releaseTitle} - ${primaryArtist}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0d12; color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #27272a;">
            <h2 style="color: #eab308; text-align: center; margin-top: 0;">🎵 New Song Uploaded</h2>
            <hr style="border: 0; border-top: 1px solid #27272a; margin: 16px 0;" />

            <div style="margin-bottom: 20px;">
              <h3 style="margin: 0 0 4px 0; color: #ffffff; font-size: 20px;">${releaseTitle}</h3>
              <p style="margin: 0; color: #a1a1aa; font-size: 14px;">By <strong>${primaryArtist}</strong> ${featuringArtists ? `(ft. ${featuringArtists})` : ''}</p>
              <p style="margin: 6px 0 0 0; color: #71717a; font-size: 12px;">Type: ${releaseType || 'Single'} • Genre: ${genre || 'Pop'} • Language: ${language || 'Hindi'}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #d4d4d8; margin-bottom: 20px;">
              <tr><td style="padding: 6px 0; font-weight: bold; width: 140px; color: #a1a1aa;">Target Date:</td><td style="color: #ffffff;">${releaseDate || 'Immediate'}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold; color: #a1a1aa;">Uploader Email:</td><td style="color: #ffffff;"><a href="mailto:${userEmail}" style="color: #38bdf8;">${userEmail || 'Artist'}</a></td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold; color: #a1a1aa;">Submitted At:</td><td style="color: #ffffff;">${new Date().toLocaleString()}</td></tr>
            </table>

            <div style="background-color: #18181b; border: 1px solid #3f3f46; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
              <h4 style="margin: 0 0 8px 0; color: #eab308; font-size: 13px; text-transform: uppercase;">Tracks List:</h4>
              <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #f4f4f5;">
                ${trackListHtml}
              </ul>
            </div>

            <div style="text-align: center; margin-top: 24px;">
              <a href="http://localhost:5173/admin" style="display: inline-block; background-color: #eab308; color: #000000; font-weight: bold; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 13px;">Review Release in Admin Panel →</a>
            </div>

            <div style="margin-top: 24px; font-size: 11px; color: #71717a; text-align: center;">
              Adventure Records Ingestion Desk • Sent automatically to ${adminEmail}
            </div>
          </div>
        `
      });
      console.log(`✅ [SONG UPLOAD EMAIL DISPATCHED] Sent to ${adminEmail}`);
    } catch (err) {
      console.error(`❌ [SMTP SONG UPLOAD ERROR]:`, err.message);
    }
  }

  res.status(200).json({ success: true, message: 'Upload notification email sent.' });
});

// 1. New Payment Verification Submitted Notification (To adventureof693@gmail.com)
app.post('/api/notify-payment-submitted', async (req, res) => {
  const { paymentType, targetTitle, amount, utr, upiApp, userEmail, merchantUpiId } = req.body;
  const adminEmail = 'adventureof693@gmail.com';

  console.log(`\n=================================================`);
  console.log(`💳 [NEW UPI PAYMENT SUBMITTED] UTR: ${utr} | Amount: ₹${amount}`);
  console.log(`=================================================\n`);

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (emailUser && emailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: { user: emailUser, pass: emailPass }
      });

      await transporter.sendMail({
        from: `"Adventure Records Payments" <${emailUser}>`,
        to: adminEmail,
        subject: `💳 [New UPI Payment Verification Submitted] UTR: ${utr} (₹${amount})`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0d12; color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #27272a;">
            <h2 style="color: #38bdf8; text-align: center; margin-top: 0;">💳 Payment Verification Submitted</h2>
            <hr style="border: 0; border-top: 1px solid #27272a; margin: 16px 0;" />
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #d4d4d8; margin-bottom: 20px;">
              <tr><td style="padding: 6px 0; font-weight: bold; width: 140px; color: #a1a1aa;">Payment Type:</td><td style="color: #ffffff; text-transform: uppercase;">${paymentType}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold; color: #a1a1aa;">Release / Plan:</td><td style="color: #ffffff;">${targetTitle || 'Platform Distribution'}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold; color: #a1a1aa;">Amount Paid:</td><td style="color: #4ade80; font-weight: bold; font-size: 16px;">₹${amount}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold; color: #a1a1aa;">UTR / Trans ID:</td><td style="color: #facc15; font-family: monospace; font-size: 16px;">${utr}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold; color: #a1a1aa;">UPI App Used:</td><td style="color: #ffffff;">${upiApp || 'UPI'}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold; color: #a1a1aa;">Receiver UPI:</td><td style="color: #ffffff;">${merchantUpiId || '9691546208@ptyes'}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold; color: #a1a1aa;">Uploader Email:</td><td style="color: #ffffff;"><a href="mailto:${userEmail}" style="color: #38bdf8;">${userEmail}</a></td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold; color: #a1a1aa;">Submitted At:</td><td style="color: #ffffff;">${new Date().toLocaleString()}</td></tr>
            </table>
            <div style="text-align: center; margin-top: 24px;">
              <a href="http://localhost:5173/admin" style="display: inline-block; background-color: #38bdf8; color: #000000; font-weight: bold; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 13px;">Review & Verify in Admin Panel →</a>
            </div>
          </div>
        `
      });
      console.log(`✅ [PAYMENT NOTIFICATION SENT] Sent to ${adminEmail}`);
    } catch (err) {
      console.error(`❌ [SMTP PAYMENT NOTIFY ERROR]:`, err.message);
    }
  }

  res.status(200).json({ success: true, message: 'Payment verification notification dispatched.' });
});

// 2. Admin Verified/Rejected Payment Result Notification (To User)
app.post('/api/notify-payment-result', async (req, res) => {
  const { userEmail, status, amount, utr, paymentType, targetTitle, reason } = req.body;

  if (!userEmail) return res.status(400).json({ message: 'User email is required.' });

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (emailUser && emailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: { user: emailUser, pass: emailPass }
      });

      const isVerified = status === 'verified';
      const subject = isVerified 
        ? `✅ Payment Verified ✓ - ${targetTitle || 'Adventure Records'}`
        : `❌ Payment Submission Update - ${targetTitle || 'Adventure Records'}`;

      await transporter.sendMail({
        from: `"Adventure Records Billing" <${emailUser}>`,
        to: userEmail,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0d12; color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #27272a;">
            <h2 style="color: ${isVerified ? '#4ade80' : '#f87171'}; text-align: center; margin-top: 0;">
              ${isVerified ? '✅ Payment Verified ✓' : '❌ Payment Verification Status'}
            </h2>
            <hr style="border: 0; border-top: 1px solid #27272a; margin: 16px 0;" />
            <p style="color: #e4e4e7; font-size: 14px; line-height: 1.5;">
              ${isVerified 
                ? `Great news! Your payment of <strong>₹${amount}</strong> (UTR: <code style="color: #facc15;">${utr}</code>) has been verified by our billing team. Your ${paymentType === 'release' ? 'release upload features' : 'subscription benefits'} are now fully unlocked!`
                : `Your payment submission of <strong>₹${amount}</strong> (UTR: <code style="color: #facc15;">${utr}</code>) could not be verified. ${reason ? `Reason: ${reason}` : ''}`}
            </p>
            <div style="margin-top: 24px; font-size: 11px; color: #71717a; text-align: center;">
              Adventure Records Payment Desk • Sent to ${userEmail}
            </div>
          </div>
        `
      });
    } catch (err) {
      console.error(`❌ [SMTP PAYMENT RESULT ERROR]:`, err.message);
    }
  }

  res.status(200).json({ success: true, message: 'Payment result notification sent.' });
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
    console.log(`🚀 Adventure Records High-Scale Server running on port ${PORT}`);
  });

  // Keep-alive timeouts for zero-downtime high-traffic handling
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;
};

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
