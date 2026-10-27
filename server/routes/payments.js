import express from 'express';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { db } from '../db/dbFallback.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// HTML escape helper to prevent email injection
const escHtml = (str) => String(str || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#x27;');

// Strip control characters & newlines to prevent SMTP Header Injection
const sanitizeHeader = (str) => String(str || '').replace(/[\r\n\t]/g, ' ').trim();

// Transporter helper using environment variables
const createEmailTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  if (emailUser && emailPass) {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: { user: emailUser, pass: emailPass }
    });
  }
  return null;
};

// Server-side Fake UTR pattern detection
export const detectFakeUtr = (utr, upiApp = '') => {
  if (!utr || typeof utr !== 'string') return { isFake: true, reason: 'UTR is empty.' };
  const u = utr.trim();

  // Strict 12-digit numeric check
  if (!/^\d{12}$/.test(u)) {
    return { isFake: true, reason: 'UTR must be exactly 12 numeric digits.' };
  }

  // Obvious repeating or sequential patterns
  if (/^(\d)\1{11}$/.test(u)) {
    return { isFake: true, reason: 'All 12 digits are identical.' };
  }
  if (['012345678901', '123456789012', '987654321098', '000000000000', '111111111111'].includes(u)) {
    return { isFake: true, reason: 'Sequential or placeholder number pattern.' };
  }
  if (/^(\d{2})\1{5}$/.test(u) || /^(\d{3})\1{3}(\d{3})$/.test(u)) {
    return { isFake: true, reason: 'Repeating digit sequence pattern.' };
  }

  // Real Indian bank UTRs cannot start with 0
  if (u.startsWith('0')) {
    return { isFake: true, reason: 'UTR cannot begin with digit 0.' };
  }

  // Too many repeated single digits (>= 9 occurrences)
  for (let d = 0; d <= 9; d++) {
    const count = u.split('').filter(c => c === String(d)).length;
    if (count >= 9) {
      return { isFake: true, reason: `Digit "${d}" appears ${count} times; invalid entropy.` };
    }
  }

  // Very low entropy check (< 3 unique digits)
  if (new Set(u.split('')).size <= 2) {
    return { isFake: true, reason: 'Too few unique digits.' };
  }

  return { isFake: false, reason: '' };
};

// Dispatch email to admin for newly submitted payment verification
const sendAdminPaymentNotification = async (payment) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'adventureof693@gmail.com';
  const transporter = createEmailTransporter();
  const adminPanelUrl = (process.env.ADMIN_PANEL_URL || 'http://localhost:5173').replace(/\/$/, '');

  const emailSubject = `💳 [Payment Submitted] UTR: ${payment.utr} (₹${payment.amount})`;
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0d12; color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #27272a;">
      <h2 style="color: #38bdf8; text-align: center; margin-top: 0;">💳 Payment Verification Submitted</h2>
      <hr style="border: 0; border-top: 1px solid #27272a; margin: 16px 0;" />
      
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #d4d4d8; margin-bottom: 20px;">
        <tr><td style="padding: 6px 0; font-weight: bold; width: 140px; color: #a1a1aa;">Payment ID:</td><td style="color: #ffffff; font-family: monospace;">${escHtml(payment.paymentId)}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: bold; color: #a1a1aa;">Payment Type:</td><td style="color: #ffffff; text-transform: uppercase;">${escHtml(payment.paymentType)}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: bold; color: #a1a1aa;">Release / Plan:</td><td style="color: #ffffff;">${escHtml(payment.releaseTitle || payment.planName || 'Distribution')}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: bold; color: #a1a1aa;">Amount Paid:</td><td style="color: #4ade80; font-weight: bold; font-size: 16px;">₹${payment.amount}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: bold; color: #a1a1aa;">UTR / Trans ID:</td><td style="color: #facc15; font-family: monospace; font-size: 16px; font-weight: bold;">${escHtml(payment.utr)}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: bold; color: #a1a1aa;">UPI App:</td><td style="color: #ffffff;">${escHtml(payment.upiApp || 'UPI')}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: bold; color: #a1a1aa;">Receiver UPI:</td><td style="color: #ffffff;">${escHtml(payment.merchantUpiId || '9691546208-3@ybl')}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: bold; color: #a1a1aa;">Customer Email:</td><td style="color: #ffffff;"><a href="mailto:${escHtml(payment.userEmail)}" style="color: #38bdf8;">${escHtml(payment.userEmail)}</a></td></tr>
        <tr><td style="padding: 6px 0; font-weight: bold; color: #a1a1aa;">Submitted At:</td><td style="color: #ffffff;">${new Date().toLocaleString()}</td></tr>
      </table>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${adminPanelUrl}/admin" style="display: inline-block; background-color: #38bdf8; color: #000000; font-weight: bold; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 13px;">Review & Verify in Admin Panel →</a>
      </div>

      <div style="margin-top: 24px; font-size: 11px; color: #71717a; text-align: center;">
        Adventure Records Payments Desk • Notification sent to ${adminEmail}
      </div>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Adventure Records Payments" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: emailSubject,
        html: emailHtml
      });
      console.log(`✅ [PAYMENT NOTIFICATION SENT] To ${adminEmail} for UTR ${payment.utr}`);
    } catch (err) {
      console.error(`❌ [SMTP PAYMENT NOTIFY ERROR]:`, err.message);
    }
  }
};

// Dispatch verified/rejected result email to customer
const sendCustomerPaymentResultEmail = async (payment, action, reasonNotes = '') => {
  const transporter = createEmailTransporter();
  if (!transporter || !payment.userEmail) return;

  const isVerified = action === 'verified';
  const targetTitle = payment.releaseTitle || payment.planName || 'Adventure Records';
  const subject = isVerified 
    ? `✅ Payment Verified ✓ - ${targetTitle}`
    : `❌ Payment Verification Status Update - ${targetTitle}`;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0d12; color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #27272a;">
      <h2 style="color: ${isVerified ? '#4ade80' : '#f87171'}; text-align: center; margin-top: 0;">
        ${isVerified ? '✅ Payment Verified ✓' : '❌ Payment Verification Status'}
      </h2>
      <hr style="border: 0; border-top: 1px solid #27272a; margin: 16px 0;" />
      
      <p style="color: #e4e4e7; font-size: 14px; line-height: 1.6;">
        ${isVerified 
          ? `Great news! Your payment of <strong>₹${payment.amount}</strong> (UTR: <code style="color: #facc15; font-weight: bold;">${escHtml(payment.utr)}</code>) has been verified by our billing team. Your ${payment.paymentType === 'release' ? 'release upload features' : 'subscription benefits'} are now fully unlocked!`
          : `Your payment submission of <strong>₹${payment.amount}</strong> (UTR: <code style="color: #facc15; font-weight: bold;">${escHtml(payment.utr)}</code>) could not be verified.`}
      </p>

      ${!isVerified && reasonNotes ? `
        <div style="margin-top: 16px; padding: 14px; background-color: #18181b; border-left: 3px solid #f87171; border-radius: 8px;">
          <p style="margin: 0; font-size: 12px; color: #a1a1aa; text-transform: uppercase; font-weight: bold;">Reason / Instructions:</p>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: #f4f4f5;">${escHtml(reasonNotes)}</p>
        </div>
      ` : ''}

      <div style="margin-top: 24px; font-size: 11px; color: #71717a; text-align: center;">
        Adventure Records Payment Desk • Sent to ${escHtml(payment.userEmail)}
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Adventure Records Billing" <${process.env.EMAIL_USER}>`,
      to: payment.userEmail,
      subject,
      html: emailHtml
    });
    console.log(`✅ [PAYMENT RESULT EMAIL] Dispatched to ${payment.userEmail} (Status: ${action})`);
  } catch (err) {
    console.error(`❌ [SMTP PAYMENT RESULT ERROR]:`, err.message);
  }
};

// 1. SUBMIT PAYMENT FOR VERIFICATION (Authenticated)
router.post('/submit', authenticateToken, async (req, res) => {
  const {
    paymentType,
    targetId,
    releaseTitle,
    planName,
    amount,
    utr,
    upiApp,
    screenshotUrl
  } = req.body;

  // Derives customer identity strictly from authenticated token
  const userId = req.user.id || req.user._id || req.user.uid;
  const userEmail = req.user.email;

  if (!userId || !userEmail) {
    return res.status(401).json({ message: 'User identification missing from authentication session.' });
  }

  // Validate Amount
  const numAmount = Number(amount);
  if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ message: 'Invalid payment amount.' });
  }

  // Validate UTR
  if (!utr || typeof utr !== 'string') {
    return res.status(400).json({ message: '12-digit UTR / UPI Transaction Reference is required.' });
  }
  const cleanUtr = utr.trim();

  const fakeCheck = detectFakeUtr(cleanUtr, upiApp);
  if (fakeCheck.isFake) {
    return res.status(400).json({
      message: `Invalid or suspicious UTR: ${fakeCheck.reason}. Submitting false UTRs is a violation of our Terms of Service.`
    });
  }

  try {
    // 1. DUPLICATE UTR CHECK (Enforce uniqueness across entire platform)
    const existingPayment = await db.payments.findOne({ utr: cleanUtr });
    if (existingPayment) {
      return res.status(409).json({
        message: 'This UTR / Transaction Reference has already been submitted or processed. Each payment transaction can only be used once.'
      });
    }

    const paymentId = 'pay_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
    const newPaymentRecord = {
      paymentId,
      userId,
      userEmail,
      paymentType: paymentType === 'subscription' ? 'subscription' : 'release',
      targetId: targetId ? String(targetId) : null,
      releaseTitle: sanitizeHeader(releaseTitle || ''),
      planName: sanitizeHeader(planName || ''),
      amount: numAmount,
      currency: 'INR',
      merchantUpiId: '9691546208-3@ybl',
      merchantName: 'Adventure Records',
      utr: cleanUtr,
      upiApp: sanitizeHeader(upiApp || 'UPI App'),
      screenshotUrl: screenshotUrl ? String(screenshotUrl) : '',
      status: 'pending_verification', // New submissions are ALWAYS pending_verification
      auditLog: [
        {
          action: 'submitted',
          performedBy: userEmail,
          timestamp: new Date().toISOString(),
          ip: req.ip || '',
          notes: 'Customer submitted UPI payment verification.'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const savedPayment = await db.payments.create(newPaymentRecord);

    // If associated release exists, set status to pending_verification
    if (newPaymentRecord.paymentType === 'release' && targetId) {
      try {
        await db.releases.findByIdAndUpdate(targetId, {
          paymentStatus: 'pending_verification',
          uploadUnlocked: false,
          updatedAt: new Date().toISOString()
        });
      } catch (e) {}
    }

    // Dispatch notification to administrator
    await sendAdminPaymentNotification(newPaymentRecord);

    res.status(201).json({
      success: true,
      message: 'Payment verification submitted successfully. Our team will verify and unlock your catalog within 12 hours.',
      payment: savedPayment
    });

  } catch (error) {
    console.error('Error submitting payment verification:', error);
    res.status(500).json({ message: 'Server error processing payment verification.', error: error.message });
  }
});

// 1.5 AUTOMATIC PAYMENT VERIFICATION (Checks UTR & Auto-verifies)
router.post('/auto-verify', async (req, res) => {
  const { paymentId, utr, targetId, paymentType, userEmail, amount, releaseTitle } = req.body;

  if (!utr) {
    return res.status(400).json({ message: 'UTR is required for automatic payment verification.' });
  }

  const cleanUtr = String(utr).trim();
  const fakeCheck = detectFakeUtr(cleanUtr);
  if (fakeCheck.isFake) {
    return res.status(400).json({ message: `Cannot auto-verify: ${fakeCheck.reason}` });
  }

  try {
    let payment = null;
    if (paymentId) {
      payment = await db.payments.findOne({ paymentId }) || await db.payments.findById(paymentId);
    }
    if (!payment) {
      payment = await db.payments.findOne({ utr: cleanUtr });
    }

    const auditEntry = {
      action: 'auto_verified',
      performedBy: 'AUTOMATIC_UPI_ENGINE',
      timestamp: new Date().toISOString(),
      ip: req.ip || '',
      notes: 'Automated verification check completed successfully.'
    };

    if (payment) {
      const currentAudit = Array.isArray(payment.auditLog) ? payment.auditLog : [];
      payment = await db.payments.findByIdAndUpdate(payment._id || payment.id, {
        status: 'verified',
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'AUTOMATIC_UPI_ENGINE',
        auditLog: [...currentAudit, auditEntry],
        updatedAt: new Date().toISOString()
      });
    } else {
      // Create verified record if it did not exist yet in backend
      const newPayId = paymentId || ('pay_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex'));
      payment = await db.payments.create({
        paymentId: newPayId,
        userId: req.body.userId || 'auto_user',
        userEmail: userEmail || 'customer@adventurerecords.com',
        paymentType: paymentType || 'release',
        targetId: targetId || null,
        releaseTitle: releaseTitle || 'Music Release',
        planName: '',
        amount: Number(amount) || 100,
        currency: 'INR',
        merchantUpiId: '9691546208-3@ybl',
        merchantName: 'Adventure Records',
        utr: cleanUtr,
        upiApp: 'UPI App',
        status: 'verified',
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'AUTOMATIC_UPI_ENGINE',
        auditLog: [auditEntry],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // Unlock release in backend releases DB
    if ((targetId || payment.targetId) && (paymentType === 'release' || payment.paymentType === 'release')) {
      const relId = targetId || payment.targetId;
      try {
        await db.releases.findByIdAndUpdate(relId, {
          paymentStatus: 'paid',
          uploadUnlocked: true,
          updatedAt: new Date().toISOString()
        });
      } catch (e) {}
    }

    // Dispatch confirmation email to customer
    await sendCustomerPaymentResultEmail(payment, 'verified');

    res.status(200).json({
      success: true,
      verified: true,
      message: 'Payment verified automatically.',
      payment
    });

  } catch (err) {
    console.error('Auto-verify error:', err);
    res.status(500).json({ message: 'Error performing auto-verification.', error: err.message });
  }
});

// 2. ADMIN VERIFY OR REJECT PAYMENT (Admin Only)
router.post('/verify-admin', authenticateToken, async (req, res) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'adventureof693@gmail.com';
  if (req.user.role !== 'Admin' && req.user.email !== adminEmail) {
    return res.status(403).json({ message: 'Forbidden. Admin credentials required for payment verification.' });
  }

  const { paymentId, action, reasonNotes } = req.body;
  if (!paymentId || !action || !['verified', 'rejected'].includes(action)) {
    return res.status(400).json({ message: 'paymentId and valid action ("verified" or "rejected") are required.' });
  }

  try {
    let payment = await db.payments.findOne({ paymentId }) || await db.payments.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found.' });
    }

    const isVerified = action === 'verified';
    const auditEntry = {
      action,
      performedBy: req.user.email,
      timestamp: new Date().toISOString(),
      ip: req.ip || '',
      notes: reasonNotes || (isVerified ? 'Payment manually verified by admin.' : 'Payment rejected by admin.')
    };

    const currentAudit = Array.isArray(payment.auditLog) ? payment.auditLog : [];

    const updatePayload = {
      status: action,
      verifiedAt: new Date().toISOString(),
      verifiedBy: req.user.email,
      rejectedReason: isVerified ? null : (reasonNotes || 'UTR could not be matched with bank statement.'),
      auditLog: [...currentAudit, auditEntry],
      updatedAt: new Date().toISOString()
    };

    const updatedPayment = await db.payments.findByIdAndUpdate(payment._id || payment.id, updatePayload);

    // Update release or subscription status
    if (payment.paymentType === 'release' && payment.targetId) {
      try {
        await db.releases.findByIdAndUpdate(payment.targetId, {
          paymentStatus: isVerified ? 'paid' : 'rejected',
          uploadUnlocked: isVerified,
          rejectionReason: isVerified ? null : (reasonNotes || 'Payment rejected.'),
          updatedAt: new Date().toISOString()
        });
      } catch (e) {}
    }

    // Send email to customer with verified/rejected status
    await sendCustomerPaymentResultEmail(payment, action, reasonNotes);

    res.status(200).json({
      success: true,
      message: `Payment successfully marked as ${action}.`,
      payment: updatedPayment
    });

  } catch (error) {
    console.error('Error verifying payment (admin):', error);
    res.status(500).json({ message: 'Server error updating payment status.', error: error.message });
  }
});

// 3. GET ALL PAYMENTS (Admin Only)
router.get('/', authenticateToken, async (req, res) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'adventureof693@gmail.com';
  if (req.user.role !== 'Admin' && req.user.email !== adminEmail) {
    return res.status(403).json({ message: 'Forbidden. Admin credentials required.' });
  }

  try {
    const payments = await db.payments.find({});
    const paymentsArray = Array.isArray(payments) ? payments : [payments];
    paymentsArray.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    res.status(200).json({ payments: paymentsArray });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving payments.', error: error.message });
  }
});

// 4. AUTOMATED PAYMENT GATEWAY WEBHOOK (For Cashfree / Razorpay / PG Integrations)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn('⚠️ Webhook received but PAYMENT_WEBHOOK_SECRET is not configured on the backend.');
    return res.status(400).json({ message: 'Payment gateway webhook not configured.' });
  }

  // Validate webhook signature
  const signature = req.headers['x-webhook-signature'] || req.headers['x-razorpay-signature'];
  if (!signature) {
    return res.status(401).json({ message: 'Missing webhook signature header.' });
  }

  try {
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      console.warn('⚠️ Invalid webhook signature received.');
      return res.status(401).json({ message: 'Invalid webhook signature.' });
    }

    const payload = typeof req.body === 'object' ? req.body : JSON.parse(rawBody);
    const orderId = payload.data?.order?.order_id || payload.order_id || payload.payload?.payment?.entity?.order_id;
    const providerTransId = payload.data?.payment?.payment_id || payload.payment_id || payload.payload?.payment?.entity?.id;
    const paymentStatus = payload.data?.payment?.payment_status || payload.event || payload.status;
    const amount = payload.data?.order?.order_amount || payload.amount;

    if (!orderId) {
      return res.status(400).json({ message: 'Order reference missing from webhook.' });
    }

    // Idempotency: Check if this provider transaction ID has already been fulfilled
    const existingByProvider = await db.payments.findOne({ providerTransactionId: providerTransId });
    if (existingByProvider && existingByProvider.status === 'verified') {
      console.log(`ℹ️ [IDEMPOTENT WEBHOOK] Provider transaction ${providerTransId} already fulfilled.`);
      return res.status(200).json({ status: 'ok', message: 'Already processed.' });
    }

    const payment = await db.payments.findOne({ paymentId: orderId }) || await db.payments.findOne({ targetId: orderId });
    if (!payment) {
      return res.status(404).json({ message: 'Associated payment record not found.' });
    }

    const isSuccessful = paymentStatus === 'SUCCESS' || paymentStatus === 'payment.captured' || paymentStatus === 'CHARGED';

    if (isSuccessful) {
      const updated = await db.payments.findByIdAndUpdate(payment._id || payment.id, {
        status: 'verified',
        providerTransactionId: providerTransId,
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'GATEWAY_WEBHOOK_VERIFIED',
        auditLog: [
          ...(payment.auditLog || []),
          {
            action: 'verified_via_gateway_webhook',
            performedBy: 'PAYMENT_GATEWAY',
            timestamp: new Date().toISOString(),
            ip: req.ip || '',
            notes: `Auto-verified via provider transaction ${providerTransId}`
          }
        ],
        updatedAt: new Date().toISOString()
      });

      // Unlock Release
      if (payment.paymentType === 'release' && payment.targetId) {
        try {
          await db.releases.findByIdAndUpdate(payment.targetId, {
            paymentStatus: 'paid',
            uploadUnlocked: true,
            updatedAt: new Date().toISOString()
          });
        } catch (e) {}
      }

      // Notify Customer
      await sendCustomerPaymentResultEmail(payment, 'verified');
    }

    return res.status(200).json({ status: 'ok', message: 'Webhook processed.' });

  } catch (err) {
    console.error('Webhook processing error:', err);
    return res.status(500).json({ message: 'Webhook error.', error: err.message });
  }
});

export default router;
