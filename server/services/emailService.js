/**
 * Adventure Records — Centralized Transactional Email Service
 * Ensures strict recipient domain/MX validation, injection safety,
 * accurate delivery status tracking, and test-mode dry-run protection.
 */

import nodemailer from 'nodemailer';
import dns from 'dns/promises';

const RESERVED_DUMMY_DOMAINS = new Set([
  'example.com',
  'example.org',
  'example.net',
  'test.com',
  'invalid',
  'localhost',
  'localhost.localdomain'
]);

const COMMON_TYPO_DOMAINS = {
  'gamil.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gnail.com': 'gmail.com',
  'gmail.con': 'gmail.com',
  'gmail.co': 'gmail.com',
  'yaho.com': 'yahoo.com',
  'yahoo.con': 'yahoo.com',
  'hotmal.com': 'hotmail.com',
  'outlok.com': 'outlook.com'
};

export const escHtml = (str) => String(str ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#x27;');

export const sanitizeHeaderField = (str) =>
  String(str ?? '').replace(/[\r\n\t]/g, ' ').trim();

export const isDryRun = () =>
  process.env.SMTP_DRY_RUN === 'true' || process.env.DISABLE_SMTP_IN_TESTS === 'true';

export const getAdminEmail = () =>
  (process.env.ADMIN_EMAIL || 'adventureof693@gmail.com').trim();

export const getAdminPanelUrl = () => {
  let raw = (process.env.ADMIN_PANEL_URL || '').trim();
  if (!raw || (process.env.NODE_ENV === 'production' && /localhost|127\.0\.0\.1/i.test(raw))) {
    raw = 'https://adventurerecords.web.app';
  }
  return raw.replace(/\/admin\/?$/i, '').replace(/\/+$/, '');
};

const withTimeout = (promise, ms = 3500) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('DNS lookup timeout')), ms))
  ]);

/**
 * Validates email syntax, blocks CRLF/header injection, catches common domain typos,
 * and checks DNS MX/A records so invalid domains fail before Gmail bounces.
 */
export async function validateDeliverableEmail(rawEmail) {
  if (!rawEmail || typeof rawEmail !== 'string') {
    return { valid: false, reason: 'Email address is required.' };
  }

  // Reject control chars / newlines outright (SMTP header injection)
  if (/[\r\n\t]/.test(rawEmail)) {
    return { valid: false, reason: 'Invalid characters detected in email address.' };
  }

  const email = rawEmail.trim();
  const emailRegex = /^[^\s@<>()[\]\\,;:\s@"]+@([^\s@.]+\.)+[^\s@.]{2,}$/;
  if (!emailRegex.test(email) || email.includes('..') || email.length > 100) {
    return { valid: false, reason: 'Please provide a valid email address format.' };
  }

  const domain = email.split('@')[1].toLowerCase();

  // Common domain typo detection (e.g. @gmail.con, @gamil.com)
  if (COMMON_TYPO_DOMAINS[domain]) {
    return {
      valid: false,
      reason: `Invalid email domain "${domain}". Did you mean "@${COMMON_TYPO_DOMAINS[domain]}"?`
    };
  }

  // In dry-run/test mode, skip live DNS & dummy-domain block
  if (isDryRun()) {
    return { valid: true, email };
  }

  if (RESERVED_DUMMY_DOMAINS.has(domain)) {
    return {
      valid: false,
      reason: `Email domain "${domain}" is reserved for examples and cannot receive real mail.`
    };
  }

  try {
    const mxRecords = await withTimeout(dns.resolveMx(domain), 3500);
    if (Array.isArray(mxRecords) && mxRecords.length > 0) {
      // Check for null MX (RFC 7505: exchange === '')
      const hasValidExchange = mxRecords.some(mx => mx.exchange && mx.exchange.trim() !== '.');
      if (!hasValidExchange) {
        return { valid: false, reason: `Domain "${domain}" is configured not to accept email.` };
      }
      return { valid: true, email };
    }
  } catch (err) {
    if (err.code === 'ENOTFOUND' || err.code === 'NXDOMAIN') {
      return { valid: false, reason: `Email domain "${domain}" does not exist.` };
    }
    if (err.code === 'ENODATA' || err.code === 'ENOTIMP') {
      // Fallback per RFC 5321: domains without MX may accept mail via A record
      try {
        const aRecords = await withTimeout(dns.resolve4(domain), 2500);
        if (Array.isArray(aRecords) && aRecords.length > 0) {
          return { valid: true, email };
        }
      } catch (aErr) {
        if (aErr.code === 'ENOTFOUND' || aErr.code === 'ENODATA') {
          return { valid: false, reason: `Email domain "${domain}" has no mail server (MX/A record).` };
        }
      }
    }
    // Transient DNS/network timeout — allow SMTP send attempt rather than false failure
  }

  return { valid: true, email };
}

export function createEmailTransporter() {
  const emailUser = (process.env.EMAIL_USER || '').trim();
  const emailPass = (process.env.EMAIL_PASS || '').trim();

  if (!emailUser || !emailPass) {
    return null;
  }

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });
}

/**
 * Sends an email via configured SMTP and returns truthful delivery outcome.
 */
export async function sendEmail({
  to,
  subject,
  html,
  fromName = 'Adventure Records',
  replyTo,
  attachments = []
}) {
  const cleanTo = sanitizeHeaderField(to);
  const cleanSubject = sanitizeHeaderField(subject);
  const emailUser = (process.env.EMAIL_USER || '').trim();

  const recipientCheck = await validateDeliverableEmail(cleanTo);
  if (!recipientCheck.valid) {
    return {
      success: false,
      invalidEmail: true,
      error: recipientCheck.reason
    };
  }

  if (isDryRun()) {
    return {
      success: true,
      dryRun: true,
      accepted: [cleanTo]
    };
  }

  const transporter = createEmailTransporter();
  if (!transporter || !emailUser) {
    return {
      success: false,
      error: 'SMTP credentials (EMAIL_USER / EMAIL_PASS) are not configured on the server.'
    };
  }

  try {
    const mailOptions = {
      from: `"${sanitizeHeaderField(fromName)}" <${emailUser}>`,
      to: cleanTo,
      subject: cleanSubject,
      html,
      ...(attachments?.length ? { attachments } : {})
    };

    if (replyTo) {
      const replyCheck = await validateDeliverableEmail(sanitizeHeaderField(replyTo));
      if (replyCheck.valid) {
        mailOptions.replyTo = replyCheck.email;
      }
    }

    const info = await transporter.sendMail(mailOptions);
    const rejected = Array.isArray(info?.rejected) ? info.rejected : [];
    const accepted = Array.isArray(info?.accepted) ? info.accepted : [];

    if (rejected.length > 0 || accepted.length === 0) {
      return {
        success: false,
        error: `Mail server rejected recipient: ${rejected.join(', ') || cleanTo}`
      };
    }

    return {
      success: true,
      messageId: info.messageId,
      accepted
    };
  } catch (err) {
    console.error(`❌ [SMTP SEND ERROR] to ${cleanTo}:`, err.message);
    return {
      success: false,
      error: err.message || 'SMTP delivery failed.'
    };
  }
}
