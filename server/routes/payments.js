import express from 'express';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import Razorpay from 'razorpay';
import { db } from '../db/dbFallback.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Configuration & Keys
const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_AdventureRecords';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'adventure_records_rzp_secret_key_2026';
const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || razorpayKeySecret;

// Blacklist of flagged fraudulent emails
export const FLAGGED_FRAUD_EMAILS = ['bhoomiadventure7@gmail.com'];
export const isEmailFlaggedFraud = (email) => {
  if (!email || typeof email !== 'string') return false;
  return FLAGGED_FRAUD_EMAILS.includes(email.toLowerCase().trim());
};

// Initialize Razorpay SDK client if keys are provided
let razorpayClient = null;
try {
  if (razorpayKeyId && razorpayKeySecret && !razorpayKeyId.includes('your_')) {
    razorpayClient = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret
    });
    console.log('✅ [PAYMENT GATEWAY] Razorpay Client initialized successfully');
  }
} catch (err) {
  console.warn('⚠️ [PAYMENT GATEWAY] Razorpay initialization notice:', err.message);
}

// Transporter helper for automated transactional billing emails
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

// Dispatch Automated Customer Payment Confirmation Email
const sendCustomerPaymentSuccessEmail = async (payment) => {
  const transporter = createEmailTransporter();
  if (!transporter || !payment.userEmail) return;

  const emailSubject = `✅ Payment Confirmed — Adventure Records [${payment.orderId}]`;
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #07070a; color: #ffffff; padding: 28px; border-radius: 14px; border: 1px solid #1f1f2e;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #38bdf8; font-size: 20px; letter-spacing: 1px; margin: 0;">ADVENTURE RECORDS</h1>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 4px;">AUTOMATED PAYMENT GATEWAY VERIFICATION</p>
      </div>
      <div style="background-color: #0d1117; border: 1px solid #238636; border-radius: 10px; padding: 18px; text-align: center; margin-bottom: 20px;">
        <h2 style="color: #3fb950; margin: 0; font-size: 18px;">Payment Successful ✓</h2>
        <p style="color: #e6edf3; font-size: 13px; margin: 6px 0 0 0;">
          Your payment of <strong>₹${payment.amount}</strong> has been verified by the payment gateway.
        </p>
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
        <tr><td style="padding: 8px 0; color: #8b949e; border-bottom: 1px solid #21262d;">Order ID:</td><td style="padding: 8px 0; color: #f0f6fc; font-family: monospace; font-weight: bold; text-align: right; border-bottom: 1px solid #21262d;">${payment.orderId}</td></tr>
        <tr><td style="padding: 8px 0; color: #8b949e; border-bottom: 1px solid #21262d;">Gateway Payment ID:</td><td style="padding: 8px 0; color: #38bdf8; font-family: monospace; text-align: right; border-bottom: 1px solid #21262d;">${payment.gatewayPaymentId || 'N/A'}</td></tr>
        <tr><td style="padding: 8px 0; color: #8b949e; border-bottom: 1px solid #21262d;">Plan / Title:</td><td style="padding: 8px 0; color: #f0f6fc; text-align: right; border-bottom: 1px solid #21262d;">${payment.releaseTitle || payment.planName || 'Music Distribution'}</td></tr>
        <tr><td style="padding: 8px 0; color: #8b949e; border-bottom: 1px solid #21262d;">Amount:</td><td style="padding: 8px 0; color: #3fb950; font-weight: bold; text-align: right; border-bottom: 1px solid #21262d;">₹${payment.amount}</td></tr>
        <tr><td style="padding: 8px 0; color: #8b949e; border-bottom: 1px solid #21262d;">Method:</td><td style="padding: 8px 0; color: #f0f6fc; text-align: right; border-bottom: 1px solid #21262d;">${payment.paymentMethod || 'UPI / Gateway'}</td></tr>
        <tr><td style="padding: 8px 0; color: #8b949e;">Status:</td><td style="padding: 8px 0; color: #3fb950; font-weight: bold; text-align: right;">SUCCESS (UNLOCKED)</td></tr>
      </table>
      <div style="text-align: center; margin: 24px 0;">
        <p style="color: #a5f3fc; font-size: 13px; font-weight: 600;">
          Your release upload features have been automatically unlocked. You can now upload audio and cover artwork.
        </p>
      </div>
      <div style="font-size: 11px; color: #6e7681; text-align: center; border-top: 1px solid #21262d; padding-top: 16px;">
        Adventure Records Automated Billing • 9691546208 • adventureof693@gmail.com
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Adventure Records Billing" <${process.env.EMAIL_USER}>`,
      to: payment.userEmail,
      subject: emailSubject,
      html: emailHtml
    });
    console.log(`✅ [PAYMENT CONFIRMATION SENT] to ${payment.userEmail}`);
  } catch (err) {
    console.error('❌ [CUSTOMER EMAIL ERROR]:', err.message);
  }
};

// Dispatch Admin Audit Alert Email
const sendAdminPaymentAlertEmail = async (payment) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'adventureof693@gmail.com';
  const transporter = createEmailTransporter();
  if (!transporter) return;

  const emailSubject = `⚡ [Payment Gateway Verified] ₹${payment.amount} (${payment.orderId})`;
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #07070a; color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #1f1f2e;">
      <h2 style="color: #38bdf8; margin-top: 0;">⚡ Payment Automatically Verified</h2>
      <p style="color: #94a3b8; font-size: 13px;">No manual approval needed. Payment gateway verified this transaction cryptographically.</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin: 16px 0;">
        <tr><td style="padding: 6px 0; color: #8b949e;">Customer:</td><td style="color: #f0f6fc; font-weight: bold;">${payment.customerName || 'Artist'} (${payment.userEmail})</td></tr>
        <tr><td style="padding: 6px 0; color: #8b949e;">Order ID:</td><td style="color: #f0f6fc; font-family: monospace;">${payment.orderId}</td></tr>
        <tr><td style="padding: 6px 0; color: #8b949e;">Gateway Tx ID:</td><td style="color: #38bdf8; font-family: monospace;">${payment.gatewayPaymentId || 'N/A'}</td></tr>
        <tr><td style="padding: 6px 0; color: #8b949e;">Amount:</td><td style="color: #3fb950; font-weight: bold;">₹${payment.amount}</td></tr>
        <tr><td style="padding: 6px 0; color: #8b949e;">Target / Plan:</td><td style="color: #f0f6fc;">${payment.releaseTitle || payment.planName || 'Release'}</td></tr>
        <tr><td style="padding: 6px 0; color: #8b949e;">Verification Method:</td><td style="color: #3fb950;">${payment.verifiedBy || 'GATEWAY_WEBHOOK'}</td></tr>
        <tr><td style="padding: 6px 0; color: #8b949e;">Timestamp:</td><td style="color: #f0f6fc;">${payment.verifiedAt || new Date().toISOString()}</td></tr>
      </table>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Adventure Records Billing" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: emailSubject,
      html: emailHtml
    });
    console.log(`✅ [ADMIN AUDIT ALERT SENT] to ${adminEmail}`);
  } catch (err) {
    console.error('❌ [ADMIN EMAIL ERROR]:', err.message);
  }
};

/**
 * 1. CREATE UNIQUE PAYMENT ORDER
 * POST /api/payments/create-order
 * Generates an authentic payment gateway order with unique order ID, amount, and metadata.
 */
router.post('/create-order', async (req, res) => {
  try {
    const {
      userId,
      userEmail,
      customerName,
      amount,
      paymentType = 'release',
      targetId,
      releaseTitle,
      planName
    } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, error: 'Valid positive payment amount is required.' });
    }

    if (!userId || !userEmail) {
      return res.status(400).json({ success: false, error: 'User ID and email are required to create a payment order.' });
    }

    if (isEmailFlaggedFraud(userEmail)) {
      console.warn(`🛑 [FRAUD BLOCKED] Blocked order creation for ${userEmail}`);
      return res.status(403).json({ success: false, error: 'Account suspended. Flagged for fraudulent payment activity.' });
    }

    const numericAmount = Math.round(Number(amount));
    const amountInPaise = numericAmount * 100;
    const cleanOrderId = 'order_' + Date.now().toString(36) + '_' + crypto.randomBytes(6).toString('hex');

    let gatewayOrderId = cleanOrderId;

    // Call Razorpay API to create official order if credentials are active
    if (razorpayClient) {
      try {
        const rzpOrder = await razorpayClient.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: 'rcpt_' + Date.now().toString(36),
          notes: {
            userId: String(userId),
            userEmail: String(userEmail),
            paymentType: String(paymentType),
            targetId: String(targetId || ''),
            releaseTitle: String(releaseTitle || planName || 'Release')
          }
        });
        if (rzpOrder && rzpOrder.id) {
          gatewayOrderId = rzpOrder.id;
        }
      } catch (rzpErr) {
        console.warn('⚠️ Razorpay orders.create failed, falling back to secure cryptographic order:', rzpErr.message);
      }
    }

    const orderRecord = {
      orderId: gatewayOrderId,
      gatewayPaymentId: null,
      paymentGateway: 'RAZORPAY',
      userId,
      userEmail,
      customerName: customerName || '',
      paymentType,
      targetId: targetId || null,
      releaseTitle: releaseTitle || planName || '',
      planName: planName || '',
      amount: numericAmount,
      currency: 'INR',
      merchantUpiId: '9691546208-3@ybl',
      merchantName: 'Adventure Records',
      paymentMethod: 'UPI',
      upiApp: 'UPI',
      status: 'CREATED',
      signature: null,
      verifiedAt: null,
      verifiedBy: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      auditLog: [
        {
          action: 'order_created',
          performedBy: 'PAYMENT_GATEWAY_SERVICE',
          timestamp: new Date().toISOString(),
          ip: req.ip || '',
          notes: `Created payment order ${gatewayOrderId} for ₹${numericAmount}`
        }
      ]
    };

    // Save record in database
    await db.payments.create(orderRecord);

    console.log(`✅ [ORDER CREATED] Order ${gatewayOrderId} created for ${userEmail} (₹${numericAmount})`);

    return res.status(200).json({
      success: true,
      orderId: gatewayOrderId,
      amount: numericAmount,
      amountInPaise,
      currency: 'INR',
      keyId: razorpayKeyId,
      merchantUpiId: '9691546208-3@ybl',
      merchantName: 'Adventure Records',
      paymentType,
      targetId,
      releaseTitle: releaseTitle || planName || ''
    });

  } catch (err) {
    console.error('❌ [CREATE ORDER ERROR]:', err);
    return res.status(500).json({ success: false, error: 'Internal error generating payment order.', details: err.message });
  }
});

/**
 * 2. SECURE SERVER-SIDE PAYMENT VERIFICATION
 * POST /api/payments/verify
 * Cryptographically verifies payment signature (HMAC SHA256) and verifies with gateway API.
 * Never trusts client assertions; strictly unlocks on verified success!
 */
router.post('/verify', async (req, res) => {
  try {
    const {
      orderId,
      paymentId,
      signature,
      userId,
      userEmail
    } = req.body;

    if (isEmailFlaggedFraud(userEmail)) {
      return res.status(403).json({ success: false, error: 'Payment rejected. Flagged for fraudulent payment activity.' });
    }

    if (!orderId || !paymentId) {
      return res.status(400).json({ success: false, error: 'Order ID and Gateway Payment ID are required for verification.' });
    }

    // 1. Locate order in database
    let payment = await db.payments.findOne({ orderId });
    if (!payment) {
      payment = await db.payments.findOne({ targetId: orderId });
    }

    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment order record not found in system.' });
    }

    // 2. Idempotency Check: if already verified as SUCCESS, return success immediately
    if (payment.status === 'SUCCESS' || payment.status === 'verified') {
      console.log(`ℹ️ [IDEMPOTENT VERIFY] Order ${orderId} already verified as SUCCESS.`);
      return res.status(200).json({
        success: true,
        status: 'SUCCESS',
        message: 'Payment already verified successfully.',
        payment
      });
    }

    // 3. Server-Side HMAC SHA256 Signature Verification
    const expectedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    let isSignatureValid = false;
    if (signature) {
      try {
        const sigBuf = Buffer.from(signature);
        const expBuf = Buffer.from(expectedSignature);
        if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
          isSignatureValid = true;
        }
      } catch (e) {
        isSignatureValid = false;
      }
    }

    // 4. Direct Gateway API Verification (if Razorpay client is initialized)
    let gatewayVerified = false;
    let paymentMethod = 'UPI';
    if (razorpayClient) {
      try {
        const gatewayPay = await razorpayClient.payments.fetch(paymentId);
        if (gatewayPay && (gatewayPay.status === 'captured' || gatewayPay.status === 'authorized')) {
          // Verify exact amount matches order
          const expectedPaise = Math.round(payment.amount * 100);
          if (gatewayPay.amount === expectedPaise) {
            gatewayVerified = true;
            paymentMethod = gatewayPay.method ? gatewayPay.method.toUpperCase() : 'UPI';
          } else {
            console.warn(`⚠️ Amount mismatch: Gateway reported ${gatewayPay.amount} paise, order expected ${expectedPaise} paise.`);
          }
        }
      } catch (gwErr) {
        console.warn('⚠️ Razorpay API fetch warning:', gwErr.message);
      }
    }

    // Must pass cryptographic HMAC signature verification OR gateway API verification
    if (!isSignatureValid && !gatewayVerified) {
      console.warn(`❌ [REJECTED PAYMENT] Invalid signature for order ${orderId}, payment ${paymentId}`);
      
      // Log failed attempt
      await db.payments.findByIdAndUpdate(payment._id || payment.id, {
        status: 'FAILED',
        failureReason: 'Cryptographic signature verification failed',
        updatedAt: new Date().toISOString(),
        auditLog: [
          ...(payment.auditLog || []),
          {
            action: 'verification_failed',
            performedBy: 'GATEWAY_VERIFIER',
            timestamp: new Date().toISOString(),
            ip: req.ip || '',
            notes: 'Signature validation mismatch'
          }
        ]
      });

      return res.status(400).json({
        success: false,
        status: 'FAILED',
        error: 'Payment verification failed. Cryptographic signature does not match gateway authorization.'
      });
    }

    // 5. Successful Verification -> Update Payment Status to SUCCESS
    const verifiedTimestamp = new Date().toISOString();
    const updatedPayment = await db.payments.findByIdAndUpdate(payment._id || payment.id, {
      status: 'SUCCESS',
      gatewayPaymentId: paymentId,
      signature: signature || 'API_VERIFIED',
      paymentMethod,
      verifiedAt: verifiedTimestamp,
      verifiedBy: gatewayVerified ? 'GATEWAY_API_VERIFIED' : 'GATEWAY_HMAC_VERIFIED',
      updatedAt: verifiedTimestamp,
      auditLog: [
        ...(payment.auditLog || []),
        {
          action: 'payment_verified_success',
          performedBy: 'PAYMENT_GATEWAY',
          timestamp: verifiedTimestamp,
          ip: req.ip || '',
          notes: `Verified payment ${paymentId} for order ${orderId} via ${paymentMethod}`
        }
      ]
    });

    // 6. Automatically Unlock Release in Database
    if (payment.paymentType === 'release' && payment.targetId) {
      try {
        await db.releases.findByIdAndUpdate(payment.targetId, {
          paymentStatus: 'paid',
          uploadUnlocked: true,
          updatedAt: verifiedTimestamp
        });
        console.log(`🔓 [RELEASE UNLOCKED] Release ${payment.targetId} successfully unlocked for audio/artwork upload!`);
      } catch (relErr) {
        console.error('Error unlocking release in DB:', relErr.message);
      }
    }

    // 7. Automatically Unlock Subscription if subscription payment
    if (payment.paymentType === 'subscription') {
      try {
        // Find existing subscription or create new
        const existingSub = await db.subscriptions?.findOne?.({ userId: payment.userId });
        if (existingSub) {
          await db.subscriptions.findByIdAndUpdate(existingSub._id || existingSub.id, {
            status: 'active',
            plan: payment.planName,
            updatedAt: verifiedTimestamp
          });
        }
      } catch (subErr) {
        console.warn('Subscription unlock notice:', subErr.message);
      }
    }

    // 8. Dispatch notification emails asynchronously
    sendCustomerPaymentSuccessEmail(updatedPayment || payment).catch(() => {});
    sendAdminPaymentAlertEmail(updatedPayment || payment).catch(() => {});

    console.log(`✅ [PAYMENT SUCCESS] Order ${orderId} (Payment ID: ${paymentId}) confirmed!`);

    return res.status(200).json({
      success: true,
      status: 'SUCCESS',
      message: 'Payment Successful! Your release upload has been unlocked successfully.',
      payment: updatedPayment || payment
    });

  } catch (err) {
    console.error('❌ [VERIFY PAYMENT ERROR]:', err);
    return res.status(500).json({ success: false, error: 'Internal server error verifying payment.', details: err.message });
  }
});

/**
 * 3. REAL-TIME ORDER STATUS CHECK (For Client Polling)
 * GET /api/payments/order-status/:orderId
 * Allows client to query live gateway status without re-triggering charges
 */
router.get('/order-status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ success: false, error: 'Order ID is required.' });
    }

    let payment = await db.payments.findOne({ orderId });
    if (!payment) {
      payment = await db.payments.findOne({ targetId: orderId });
    }

    if (!payment) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    return res.status(200).json({
      success: true,
      orderId: payment.orderId,
      status: payment.status,
      amount: payment.amount,
      targetId: payment.targetId,
      paymentType: payment.paymentType,
      paymentMethod: payment.paymentMethod,
      gatewayPaymentId: payment.gatewayPaymentId,
      verifiedAt: payment.verifiedAt
    });

  } catch (err) {
    console.error('❌ [ORDER STATUS ERROR]:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve order status.' });
  }
});

/**
 * 4. SECURE AUTOMATED PAYMENT GATEWAY WEBHOOK
 * POST /api/payments/webhook
 * Handles Razorpay / payment gateway webhook events directly on server.
 * Cryptographically verifies webhook signature, enforces idempotency, prevents replay attacks.
 */
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'] || req.headers['x-webhook-signature'];

    if (!signature) {
      console.warn('⚠️ Webhook rejected: Missing signature header.');
      return res.status(401).json({ message: 'Missing webhook signature header.' });
    }

    const rawBody = req.rawBody || (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      console.warn('⚠️ Webhook rejected: Invalid cryptographic signature.');
      return res.status(401).json({ message: 'Invalid webhook signature.' });
    }

    const payload = typeof req.body === 'object' ? req.body : JSON.parse(rawBody);
    const event = payload.event;
    console.log(`🔔 [GATEWAY WEBHOOK RECEIVED] Event: ${event}`);

    // Process payment success events: 'order.paid' or 'payment.captured'
    if (event === 'order.paid' || event === 'payment.captured') {
      const paymentEntity = payload.payload?.payment?.entity || payload.data?.payment;
      const orderEntity = payload.payload?.order?.entity || payload.data?.order;

      const orderId = orderEntity?.id || paymentEntity?.order_id || payload.order_id;
      const providerTransId = paymentEntity?.id || payload.payment_id;
      const paymentMethod = paymentEntity?.method ? paymentEntity.method.toUpperCase() : 'UPI';

      if (!orderId) {
        return res.status(400).json({ message: 'Order ID missing in webhook payload.' });
      }

      // 1. Idempotency Check: Prevent duplicate webhook processing
      const existingPayment = await db.payments.findOne({ orderId }) || await db.payments.findOne({ gatewayPaymentId: providerTransId });
      if (!existingPayment) {
        console.warn(`⚠️ Webhook order ${orderId} not found in database.`);
        return res.status(404).json({ message: 'Order not found in database.' });
      }

      if (existingPayment.status === 'SUCCESS' || existingPayment.status === 'verified') {
        console.log(`ℹ️ [IDEMPOTENT WEBHOOK] Order ${orderId} already marked as SUCCESS.`);
        return res.status(200).json({ status: 'ok', message: 'Already processed.' });
      }

      // 2. Update payment status to SUCCESS
      const verifiedTimestamp = new Date().toISOString();
      const updated = await db.payments.findByIdAndUpdate(existingPayment._id || existingPayment.id, {
        status: 'SUCCESS',
        gatewayPaymentId: providerTransId,
        paymentMethod,
        verifiedAt: verifiedTimestamp,
        verifiedBy: 'GATEWAY_WEBHOOK_VERIFIED',
        updatedAt: verifiedTimestamp,
        auditLog: [
          ...(existingPayment.auditLog || []),
          {
            action: 'verified_via_gateway_webhook',
            performedBy: 'PAYMENT_GATEWAY_WEBHOOK',
            timestamp: verifiedTimestamp,
            ip: req.ip || '',
            notes: `Auto-verified via provider transaction ${providerTransId} (${event})`
          }
        ]
      });

      // 3. Unlock Release in database
      if (existingPayment.paymentType === 'release' && existingPayment.targetId) {
        try {
          await db.releases.findByIdAndUpdate(existingPayment.targetId, {
            paymentStatus: 'paid',
            uploadUnlocked: true,
            updatedAt: verifiedTimestamp
          });
          console.log(`🔓 [WEBHOOK UNLOCK] Release ${existingPayment.targetId} unlocked!`);
        } catch (e) {
          console.error('Webhook release update notice:', e.message);
        }
      }

      // 4. Dispatch notification emails
      sendCustomerPaymentSuccessEmail(updated || existingPayment).catch(() => {});
      sendAdminPaymentAlertEmail(updated || existingPayment).catch(() => {});

      return res.status(200).json({ status: 'ok', message: 'Webhook processed successfully.' });
    }

    // Payment Failed event
    if (event === 'payment.failed') {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      if (orderId) {
        const payment = await db.payments.findOne({ orderId });
        if (payment && payment.status !== 'SUCCESS') {
          await db.payments.findByIdAndUpdate(payment._id || payment.id, {
            status: 'FAILED',
            failureReason: paymentEntity?.error_description || 'Payment gateway reported failure',
            updatedAt: new Date().toISOString()
          });
        }
      }
      return res.status(200).json({ status: 'ok', message: 'Failure event recorded.' });
    }

    return res.status(200).json({ status: 'ok', message: 'Event acknowledged.' });

  } catch (err) {
    console.error('❌ [WEBHOOK PROCESSING ERROR]:', err);
    return res.status(500).json({ message: 'Webhook processing failure.', error: err.message });
  }
});

/**
 * 5. GET ALL PAYMENTS FOR ADMIN DASHBOARD (Audited Records)
 * GET /api/payments
 * Secure admin endpoint for viewing gateway payment records without manual approval
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'adventureof693@gmail.com';
    if (req.user?.role !== 'Admin' && req.user?.email !== adminEmail) {
      return res.status(403).json({ message: 'Forbidden. Admin credentials required to access payment records.' });
    }

    const payments = await db.payments.find({});
    const paymentsArray = Array.isArray(payments) ? payments : [payments];
    paymentsArray.forEach(pay => {
      if (isEmailFlaggedFraud(pay.userEmail)) {
        pay.status = 'rejected';
        pay.rejectedReason = 'Fake payment detected - account flagged by Owner';
        pay.isFraudFlagged = true;
      }
    });

    paymentsArray.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    res.status(200).json({ success: true, payments: paymentsArray });
  } catch (error) {
    console.error('Admin payments retrieval error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving payments.', error: error.message });
  }
});

export default router;
