import express from 'express';
import nodemailer from 'nodemailer';
import multer from 'multer';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../db/dbFallback.js';
import { authenticateToken } from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Secure Uploads Directory (Restricted, not exposed via public static express middleware)
const SECURE_UPLOADS_DIR = path.join(__dirname, '..', 'secure_uploads', 'tickets');
if (!fs.existsSync(SECURE_UPLOADS_DIR)) {
  fs.mkdirSync(SECURE_UPLOADS_DIR, { recursive: true });
}

// Allowed MIME types and extensions
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'application/pdf'
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.pdf']);

// Magic bytes validator for file header verification
const validateMagicBytes = (filePath, mimeType) => {
  try {
    const buffer = Buffer.alloc(8);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 8, 0);
    fs.closeSync(fd);

    // JPEG: 0xFF, 0xD8, 0xFF
    if (mimeType === 'image/jpeg') {
      return buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
    }
    // PNG: 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
    if (mimeType === 'image/png') {
      return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47 &&
             buffer[4] === 0x0D && buffer[5] === 0x0A && buffer[6] === 0x1A && buffer[7] === 0x0A;
    }
    // PDF: %PDF- (0x25, 0x50, 0x44, 0x46, 0x2D)
    if (mimeType === 'application/pdf') {
      return buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
    }
    return false;
  } catch (err) {
    console.error('Magic byte validation error:', err);
    return false;
  }
};

// Multer storage engine with cryptographically safe randomized filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, SECURE_UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeRandom = crypto.randomBytes(16).toString('hex');
    cb(null, `tick_${Date.now()}_${safeRandom}${ext}`);
  }
});

// Multer upload middleware: max 3 files, max 5 MB each
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per file
    files: 3 // max 3 files per ticket
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const mime = (file.mimetype || '').toLowerCase();

    if (!ALLOWED_EXTENSIONS.has(ext) || !ALLOWED_MIME_TYPES.has(mime)) {
      return cb(new Error('Invalid file type. Only JPG, PNG, and PDF files are permitted.'));
    }
    cb(null, true);
  }
});

// HTML escape helper — prevents email and XSS injection from user-supplied content
const escHtml = (str) => String(str || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#x27;');

// Strip control characters & newlines to prevent SMTP Header Injection
const sanitizeHeaderField = (str) => String(str || '').replace(/[\r\n\t]/g, ' ').trim();

// Strict Ticket Submission Rate Limiter (Max 5 submissions per 15 minutes per IP)
const ticketRateLimitMap = new Map();
const TICKET_RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const TICKET_RATE_LIMIT_MAX = 5;

// Automatic Cleanup for ticket rate limit map
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of ticketRateLimitMap.entries()) {
    const valid = timestamps.filter(ts => now - ts < TICKET_RATE_LIMIT_WINDOW);
    if (valid.length === 0) {
      ticketRateLimitMap.delete(ip);
    } else {
      ticketRateLimitMap.set(ip, valid);
    }
  }
}, 10 * 60 * 1000);

const ticketRateLimiter = (req, res, next) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown_ip';
  const now = Date.now();
  let timestamps = ticketRateLimitMap.get(ip) || [];
  timestamps = timestamps.filter(ts => now - ts < TICKET_RATE_LIMIT_WINDOW);

  if (timestamps.length >= TICKET_RATE_LIMIT_MAX) {
    return res.status(429).json({
      message: 'Too many support tickets submitted recently. Please wait a few minutes before submitting another request.'
    });
  }

  timestamps.push(now);
  ticketRateLimitMap.set(ip, timestamps);
  next();
};

// Configure Transporter securely from Environment Variables
const createEmailTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (emailUser && emailPass) {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });
  }
  return null;
};

// Helper: Send email notification to platform admin
const sendAdminNotificationEmail = async (ticketData, attachments = []) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'adventureof693@gmail.com';
  const transporter = createEmailTransporter();
  const adminPanelUrl = (process.env.ADMIN_PANEL_URL || 'http://localhost:5173').replace(/\/$/, '');

  const ticketId = ticketData.ticketId || ticketData.id || ticketData._id;
  const sanitizedSubject = sanitizeHeaderField(ticketData.subject || 'Support Inquiry');
  const emailSubject = `[Support Ticket ${ticketId}] ${sanitizedSubject} - ${ticketData.category || 'General Support'}`;

  // Build attachments list HTML with secure access link
  let attachmentsHtml = '';
  if (attachments && attachments.length > 0) {
    attachmentsHtml = `
      <div style="margin-top: 16px; padding: 14px; background-color: #18181b; border: 1px solid #3f3f46; border-radius: 8px;">
        <h4 style="margin: 0 0 8px 0; color: #38bdf8; font-size: 13px; text-transform: uppercase;">Attached Files (${attachments.length}):</h4>
        <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #f4f4f5;">
          ${attachments.map(att => `
            <li style="margin-bottom: 6px;">
              <strong>${escHtml(att.originalName)}</strong> (${(att.size / 1024).toFixed(1)} KB)
              <br/>
              <a href="${adminPanelUrl}/admin" style="color: #38bdf8; font-size: 12px; text-decoration: underline;">View & Download in Admin Console →</a>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0d12; color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #27272a;">
      <h2 style="color: #eab308; margin-top: 0;">New Adventure Records Support Ticket</h2>
      <hr style="border: 0; border-top: 1px solid #27272a; margin: 16px 0;" />
      
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #d4d4d8;">
        <tr><td style="padding: 8px 0; font-weight: bold; width: 140px; color: #a1a1aa;">Ticket ID:</td><td style="color: #facc15; font-family: monospace; font-weight: bold; font-size: 15px;">${escHtml(ticketId)}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold; color: #a1a1aa;">Customer Name:</td><td style="color: #ffffff;">${escHtml(ticketData.name || 'Artist')}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold; color: #a1a1aa;">Customer Email:</td><td style="color: #ffffff;"><a href="mailto:${escHtml(ticketData.email)}" style="color: #38bdf8;">${escHtml(ticketData.email)}</a></td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold; color: #a1a1aa;">Category:</td><td style="color: #ffffff; font-weight: 600;">${escHtml(ticketData.category || 'General Support')}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold; color: #a1a1aa;">Subject:</td><td style="color: #ffffff;">${escHtml(ticketData.subject)}</td></tr>
        ${ticketData.releaseId ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #a1a1aa;">Release ID:</td><td style="color: #ffffff; font-family: monospace;">${escHtml(ticketData.releaseId)}</td></tr>` : ''}
        <tr><td style="padding: 8px 0; font-weight: bold; color: #a1a1aa;">Submitted At:</td><td style="color: #ffffff;">${new Date().toLocaleString()}</td></tr>
      </table>

      <div style="margin-top: 20px; padding: 16px; background-color: #18181b; border-radius: 8px; border-left: 4px solid #eab308;">
        <h4 style="margin: 0 0 8px 0; color: #eab308; font-size: 13px; text-transform: uppercase;">Message Content:</h4>
        <p style="margin: 0; font-size: 14px; line-height: 1.6; white-space: pre-wrap; color: #f4f4f5;">${escHtml(ticketData.message)}</p>
      </div>

      ${attachmentsHtml}

      <div style="text-align: center; margin-top: 24px;">
        <a href="${adminPanelUrl}/admin" style="display: inline-block; background-color: #eab308; color: #000000; font-weight: bold; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 13px;">Open Support Ticket in Admin Panel →</a>
      </div>

      <div style="margin-top: 24px; font-size: 11px; color: #71717a; text-align: center;">
        Adventure Records Support System • Sent automatically to ${adminEmail}
      </div>
    </div>
  `;

  if (transporter) {
    try {
      // Build Nodemailer attachments (inline file delivery if total size is reasonable)
      const mailAttachments = [];
      let totalAttachmentSize = 0;
      for (const att of attachments) {
        if (att.storagePath && fs.existsSync(att.storagePath)) {
          totalAttachmentSize += att.size;
          if (totalAttachmentSize <= 10 * 1024 * 1024) {
            mailAttachments.push({
              filename: att.originalName,
              path: att.storagePath
            });
          }
        }
      }

      await transporter.sendMail({
        from: `"Adventure Records Support" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: emailSubject,
        html: emailHtml,
        attachments: mailAttachments
      });
      console.log(`✉️ [ADMIN SUPPORT NOTIFICATION] Dispatched to ${adminEmail} for Ticket ${ticketId}`);
      return { success: true };
    } catch (err) {
      console.error(`⚠️ [ADMIN EMAIL ERROR] Failed to send to ${adminEmail}:`, err.message);
      return { success: false, error: err.message };
    }
  } else {
    console.log(`📌 [SUPPORT TICKET LOGGED TO ADMIN ${adminEmail}] Ticket ID: ${ticketId}`);
    return { success: true, loggedLocally: true };
  }
};

// Helper: Send confirmation email to customer
const sendCustomerConfirmationEmail = async (ticketData, attachmentsCount = 0) => {
  const transporter = createEmailTransporter();
  if (!transporter || !ticketData.email) return { success: false, error: 'Transporter or recipient email unavailable' };

  const ticketId = ticketData.ticketId || ticketData.id || ticketData._id;
  const sanitizedSubject = sanitizeHeaderField(ticketData.subject || 'Support Inquiry');
  const emailSubject = `Adventure Records: Support Ticket Received [${ticketId}]`;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0d12; color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #27272a;">
      <h2 style="color: #38bdf8; margin-top: 0; text-align: center;">Ticket Received</h2>
      <p style="color: #a1a1aa; font-size: 13px; text-align: center; margin-top: 4px;">Thank you for reaching out to Adventure Records Support</p>
      <hr style="border: 0; border-top: 1px solid #27272a; margin: 16px 0;" />

      <p style="color: #e4e4e7; font-size: 14px; line-height: 1.6;">
        Hello <strong>${escHtml(ticketData.name || 'Artist')}</strong>,
      </p>
      <p style="color: #d4d4d8; font-size: 14px; line-height: 1.6;">
        We have received your support request. Our operations and catalog ingestion desk reviews all inquiries within <strong>12 hours</strong> (Monday through Saturday, 9 AM to 6 PM IST).
      </p>

      <div style="background-color: #18181b; border: 1px solid #3f3f46; border-radius: 10px; padding: 18px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #d4d4d8;">
          <tr><td style="padding: 6px 0; font-weight: bold; width: 130px; color: #a1a1aa;">Ticket ID:</td><td style="color: #facc15; font-family: monospace; font-weight: bold; font-size: 14px;">${escHtml(ticketId)}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold; color: #a1a1aa;">Category:</td><td style="color: #ffffff;">${escHtml(ticketData.category || 'General Support')}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold; color: #a1a1aa;">Subject:</td><td style="color: #ffffff;">${escHtml(ticketData.subject)}</td></tr>
          ${attachmentsCount > 0 ? `<tr><td style="padding: 6px 0; font-weight: bold; color: #a1a1aa;">Attachments:</td><td style="color: #38bdf8;">${attachmentsCount} file(s) attached</td></tr>` : ''}
          <tr><td style="padding: 6px 0; font-weight: bold; color: #a1a1aa;">Logged At:</td><td style="color: #ffffff;">${new Date().toLocaleString()}</td></tr>
        </table>
      </div>

      <div style="margin-top: 16px; padding: 14px; background-color: #09090d; border-radius: 8px; border-left: 3px solid #38bdf8;">
        <p style="margin: 0; font-size: 12px; color: #a1a1aa; text-transform: uppercase; font-weight: bold;">Your Inquiry:</p>
        <p style="margin: 6px 0 0 0; font-size: 13px; line-height: 1.5; color: #f4f4f5; white-space: pre-wrap;">${escHtml(ticketData.message)}</p>
      </div>

      <p style="color: #a1a1aa; font-size: 12px; margin-top: 24px; line-height: 1.5;">
        Need immediate urgent assistance? You can also contact our operations hotline at <strong style="color: #ffffff;">+91 9691546208</strong> or reply directly to this email with your Ticket ID intact.
      </p>

      <div style="margin-top: 24px; font-size: 11px; color: #71717a; text-align: center; border-top: 1px solid #27272a; padding-top: 16px;">
        Adventure Records Support Desk • Rode Bus Stand Complex, Satna, MP, 485005, India
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Adventure Records Support" <${process.env.EMAIL_USER}>`,
      to: ticketData.email,
      subject: emailSubject,
      html: emailHtml
    });
    console.log(`✉️ [CUSTOMER CONFIRMATION] Dispatched to ${ticketData.email} for Ticket ${ticketId}`);
    return { success: true };
  } catch (err) {
    console.error(`⚠️ [CUSTOMER EMAIL ERROR] Failed to send to ${ticketData.email}:`, err.message);
    return { success: false, error: err.message };
  }
};

// 1. SUBMIT SUPPORT TICKET (Public & Authenticated, Supports file attachments)
router.post('/', ticketRateLimiter, (req, res) => {
  upload.array('attachments', 3)(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum size allowed is 5 MB per attachment.' });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ message: 'Too many files. A maximum of 3 attachments are allowed per ticket.' });
      }
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message || 'File upload failed.' });
    }

    const {
      name,
      email,
      subject,
      category,
      message,
      releaseId,
      userId,
      hp_field // Anti-bot honeypot field
    } = req.body;

    // Honeypot detection: If bot filled the hidden honeypot field, drop silently
    if (hp_field) {
      console.warn(`🤖 Bot spam detected on support ticket from IP: ${req.ip}`);
      return res.status(200).json({
        success: true,
        message: 'Support ticket submitted successfully!'
      });
    }

    // Input Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({ message: 'Please provide a valid Full Name (2 to 100 characters).' });
    }

    const cleanEmail = sanitizeHeaderField(email);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail) || cleanEmail.length > 100) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    const cleanSubject = sanitizeHeaderField(subject);
    if (!cleanSubject || cleanSubject.length < 2 || cleanSubject.length > 200) {
      return res.status(400).json({ message: 'Subject must be between 2 and 200 characters.' });
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10 || message.trim().length > 5000) {
      return res.status(400).json({ message: 'Detail description must be between 10 and 5,000 characters.' });
    }

    // Category whitelist validation
    const allowedCategories = [
      'General Contact',
      'General Inquiry',
      'Billing & Pricing',
      'Track Ingestion Issues',
      'ISRC / UPC Codes',
      'Official Channels Sync',
      'Copyright & Takedown',
      'Artist Verification',
      'Other'
    ];
    const validCategory = allowedCategories.includes(category) ? category : 'General Support';

    // Process and validate attachments
    const uploadedAttachments = [];
    const files = req.files || [];

    for (const file of files) {
      const mime = (file.mimetype || '').toLowerCase();
      // Binary magic byte validation
      const isValidBinary = validateMagicBytes(file.path, mime);
      if (!isValidBinary) {
        // Delete rejected file from disk immediately
        try { fs.unlinkSync(file.path); } catch (e) {}
        return res.status(400).json({
          message: `Security validation failed for file "${file.originalname}". File content does not match permitted JPG, PNG, or PDF format.`
        });
      }

      const fileId = 'att_' + crypto.randomBytes(8).toString('hex');
      const downloadToken = crypto.randomBytes(24).toString('hex');

      uploadedAttachments.push({
        fileId,
        originalName: path.basename(file.originalname).substring(0, 150),
        mimeType: mime,
        size: file.size,
        storagePath: file.path,
        downloadToken,
        uploadedAt: new Date().toISOString()
      });
    }

    try {
      // Generate clean authoritative ticket ID or use client ID if valid format
      const ticketId = (req.body.ticketId && /^AR-TICK-[A-Z0-9-]+$/i.test(req.body.ticketId))
        ? req.body.ticketId
        : `AR-TICK-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newTicketData = {
        ticketId,
        userId: userId || null,
        name: name.trim(),
        email: cleanEmail,
        subject: cleanSubject,
        category: validCategory,
        message: message.trim(),
        releaseId: releaseId ? String(releaseId).trim().substring(0, 100) : null,
        status: 'Open',
        attachments: uploadedAttachments,
        emailDelivery: {
          adminSent: false,
          customerSent: false,
          lastAttempt: null,
          error: null
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // 1. SAVE TICKET FIRST — Guarantees ticket is never lost even if SMTP fails
      const savedTicket = await db.tickets.create(newTicketData);

      // 2. DISPATCH NOTIFICATIONS WITH ERROR CAPTURE
      const adminResult = await sendAdminNotificationEmail(newTicketData, uploadedAttachments);
      const customerResult = await sendCustomerConfirmationEmail(newTicketData, uploadedAttachments.length);

      const emailStatusUpdate = {
        adminSent: Boolean(adminResult.success),
        customerSent: Boolean(customerResult.success),
        lastAttempt: new Date().toISOString(),
        error: adminResult.error || customerResult.error || null
      };

      // Update ticket record with real email delivery status
      const updatedTicket = await db.tickets.findByIdAndUpdate(savedTicket._id || savedTicket.id, {
        emailDelivery: emailStatusUpdate
      });

      return res.status(201).json({
        success: true,
        message: 'Support ticket submitted successfully! A confirmation has been sent to your email.',
        ticketId,
        ticket: updatedTicket || savedTicket,
        emailDelivery: emailStatusUpdate
      });

    } catch (error) {
      console.error('Error submitting support ticket:', error);
      // Clean up uploaded files if DB write failed
      for (const att of uploadedAttachments) {
        try { fs.unlinkSync(att.storagePath); } catch (e) {}
      }
      return res.status(500).json({ message: 'Server error saving support ticket.', error: error.message });
    }
  });
});

// 2. SECURE ATTACHMENT DOWNLOAD (Token or Admin Authentication Required)
router.get('/attachments/:ticketId/:fileId', async (req, res) => {
  const { ticketId, fileId } = req.params;
  const token = req.query.token;

  try {
    const ticket = await db.tickets.findOne({ ticketId });
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    const attachment = (ticket.attachments || []).find(a => a.fileId === fileId);
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found.' });
    }

    // Access authorization:
    // Either valid downloadToken query param OR authenticated admin JWT
    let isAuthorized = Boolean(token && token === attachment.downloadToken);

    if (!isAuthorized) {
      const authHeader = req.headers['authorization'];
      const bearerToken = authHeader && authHeader.split(' ')[1];
      if (bearerToken) {
        try {
          const jwt = (await import('jsonwebtoken')).default;
          const { getJwtSecret } = await import('./auth.js');
          const decoded = jwt.verify(bearerToken, getJwtSecret ? getJwtSecret() : process.env.JWT_SECRET);
          if (decoded && (decoded.role === 'Admin' || decoded.email === (process.env.ADMIN_EMAIL || 'adventureof693@gmail.com'))) {
            isAuthorized = true;
          }
        } catch (e) {}
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Unauthorized. Valid download token or admin session required.' });
    }

    // Verify storage path exists and prevent path traversal
    const resolvedPath = path.resolve(attachment.storagePath);
    if (!resolvedPath.startsWith(path.resolve(SECURE_UPLOADS_DIR))) {
      return res.status(403).json({ message: 'Access denied. Invalid storage path.' });
    }

    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({ message: 'File is no longer available on disk.' });
    }

    res.setHeader('Content-Type', attachment.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(attachment.originalName)}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'private, no-cache');

    const fileStream = fs.createReadStream(resolvedPath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Attachment download error:', error);
    res.status(500).json({ message: 'Error retrieving attachment.' });
  }
});

// 3. RETRY FAILED NOTIFICATION EMAIL (Admin only)
router.post('/:id/retry-email', authenticateToken, async (req, res) => {
  if (req.user.role !== 'Admin' && req.user.email !== (process.env.ADMIN_EMAIL || 'adventureof693@gmail.com')) {
    return res.status(403).json({ message: 'Forbidden. Admin credentials required.' });
  }

  try {
    const ticket = await db.tickets.findById(req.params.id) || await db.tickets.findOne({ ticketId: req.params.id });
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    const adminResult = await sendAdminNotificationEmail(ticket, ticket.attachments || []);
    const customerResult = await sendCustomerConfirmationEmail(ticket, (ticket.attachments || []).length);

    const emailStatusUpdate = {
      adminSent: Boolean(adminResult.success),
      customerSent: Boolean(customerResult.success),
      lastAttempt: new Date().toISOString(),
      error: adminResult.error || customerResult.error || null
    };

    const updated = await db.tickets.findByIdAndUpdate(ticket._id || ticket.id, {
      emailDelivery: emailStatusUpdate
    });

    res.status(200).json({
      message: 'Email dispatch retried.',
      emailDelivery: emailStatusUpdate,
      ticket: updated
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retry email dispatch.', error: err.message });
  }
});

// 4. GET ALL SUPPORT TICKETS (Admin only)
router.get('/', authenticateToken, async (req, res) => {
  if (req.user.role !== 'Admin' && req.user.email !== (process.env.ADMIN_EMAIL || 'adventureof693@gmail.com')) {
    return res.status(403).json({ message: 'Forbidden. Admin credentials required.' });
  }

  try {
    const allTickets = await db.tickets.find({});
    const ticketsArray = Array.isArray(allTickets) ? allTickets : [allTickets];
    ticketsArray.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    res.status(200).json({ tickets: ticketsArray });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving support tickets.', error: error.message });
  }
});

// 5. UPDATE SUPPORT TICKET STATUS / RESOLVE (Admin only)
router.put('/:id/status', authenticateToken, async (req, res) => {
  if (req.user.role !== 'Admin' && req.user.email !== (process.env.ADMIN_EMAIL || 'adventureof693@gmail.com')) {
    return res.status(403).json({ message: 'Forbidden. Admin credentials required.' });
  }

  const { status } = req.body;
  if (!['Open', 'In Progress', 'Resolved', 'Closed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value. Must be Open, In Progress, Resolved, or Closed.' });
  }

  try {
    const updatedTicket = await db.tickets.findByIdAndUpdate(req.params.id, { 
      status, 
      updatedAt: new Date().toISOString() 
    });
    if (!updatedTicket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    res.status(200).json({
      message: `Ticket status successfully updated to ${status}!`,
      ticket: updatedTicket
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating ticket status.' });
  }
});

export default router;
