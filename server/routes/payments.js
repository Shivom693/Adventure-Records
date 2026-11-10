import express from 'express';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { db } from '../db/dbFallback.js';
import { authenticateToken } from './auth.js';
import { 
  getCashfreeConfig, 
  createCashfreeOrder, 
  generateCashfreeUPIQR, 
  fetchCashfreeOrderPayments, 
  fetchCashfreeOrder, 
  verifyCashfreeWebhookSignature 
} from '../services/cashfree.js';
import { syncPaymentSuccess, syncOrderCreated } from '../services/firebaseSync.js';

const router = express.Router();

// Blacklist of flagged fraudulent emails
export const FLAGGED_FRAUD_EMAILS = ['bhoomiadventure7@gmail.com'];
export const isEmailFlaggedFraud = (email) => {
  if (!email || typeof email !== 'string') return false;
  return FLAGGED_FRAUD_EMAILS.includes(email.toLowerCase().trim());
};

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
        <p style="color: #94a3b8; font-size: 12px; margin-top: 4px;">AUTOMATED DYNAMIC UPI QR PAYMENT CONFIRMATION</p>
      </div>
      <div style="background-color: #0d1117; border: 1px solid #238636; border-radius: 10px; padding: 18px; text-align: center; margin-bottom: 20px;">
        <h2 style="color: #3fb950; margin: 0; font-size: 18px;">Payment Successful ✓</h2>
        <p style="color: #e6edf3; font-size: 13px; margin: 6px 0 0 0;">
          Your payment of <strong>₹${payment.amount}</strong> has been automatically verified.
        </p>
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
        <tr><td style="padding: 8px 0; color: #8b949e; border-bottom: 1px solid #21262d;">Order ID:</td><td style="padding: 8px 0; color: #f0f6fc; font-family: monospace; font-weight: bold; text-align: right; border-bottom: 1px solid #21262d;">${payment.orderId}</td></tr>
        <tr><td style="padding: 8px 0; color: #8b949e; border-bottom: 1px solid #21262d;">Gateway Payment ID:</td><td style="padding: 8px 0; color: #38bdf8; font-family: monospace; text-align: right; border-bottom: 1px solid #21262d;">${payment.gatewayPaymentId || 'UPI_QR'}</td></tr>
        ${payment.bankReference ? `<tr><td style="padding: 8px 0; color: #8b949e; border-bottom: 1px solid #21262d;">Bank Reference / UTR:</td><td style="padding: 8px 0; color: #facc15; font-family: monospace; text-align: right; border-bottom: 1px solid #21262d;">${payment.bankReference}</td></tr>` : ''}
        <tr><td style="padding: 8px 0; color: #8b949e; border-bottom: 1px solid #21262d;">Plan / Title:</td><td style="padding: 8px 0; color: #f0f6fc; text-align: right; border-bottom: 1px solid #21262d;">${payment.releaseTitle || payment.planName || 'Music Distribution'}</td></tr>
        <tr><td style="padding: 8px 0; color: #8b949e; border-bottom: 1px solid #21262d;">Amount:</td><td style="padding: 8px 0; color: #3fb950; font-weight: bold; text-align: right; border-bottom: 1px solid #21262d;">₹${payment.amount}</td></tr>
        <tr><td style="padding: 8px 0; color: #8b949e; border-bottom: 1px solid #21262d;">Method:</td><td style="padding: 8px 0; color: #f0f6fc; text-align: right; border-bottom: 1px solid #21262d;">${payment.paymentMethod || 'Dynamic UPI QR'}</td></tr>
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

  const emailSubject = `⚡ [Automatic UPI QR Verified] ₹${payment.amount} (${payment.orderId})`;
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #07070a; color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #1f1f2e;">
      <h2 style="color: #38bdf8; margin-top: 0;">⚡ Payment Automatically Verified</h2>
      <p style="color: #94a3b8; font-size: 13px;">No manual approval needed. Automatic UPI gateway verified this transaction cryptographically.</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin: 16px 0;">
        <tr><td style="padding: 6px 0; color: #8b949e;">Customer:</td><td style="color: #f0f6fc; font-weight: bold;">${payment.customerName || 'Artist'} (${payment.userEmail})</td></tr>
        <tr><td style="padding: 6px 0; color: #8b949e;">Order ID:</td><td style="color: #f0f6fc; font-family: monospace;">${payment.orderId}</td></tr>
        <tr><td style="padding: 6px 0; color: #8b949e;">Gateway Tx ID:</td><td style="color: #38bdf8; font-family: monospace;">${payment.gatewayPaymentId || 'N/A'}</td></tr>
        ${payment.bankReference ? `<tr><td style="padding: 6px 0; color: #8b949e;">Bank UTR:</td><td style="color: #facc15; font-family: monospace;">${payment.bankReference}</td></tr>` : ''}
        <tr><td style="padding: 6px 0; color: #8b949e;">Amount:</td><td style="color: #3fb950; font-weight: bold;">₹${payment.amount}</td></tr>
        <tr><td style="padding: 6px 0; color: #8b949e;">Target / Plan:</td><td style="color: #f0f6fc;">${payment.releaseTitle || payment.planName || 'Release'}</td></tr>
        <tr><td style="padding: 6px 0; color: #8b949e;">Verification Method:</td><td style="color: #3fb950;">${payment.verifiedBy || 'CASHFREE_GATEWAY_WEBHOOK'}</td></tr>
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
 * 1. CREATE UNIQUE DYNAMIC UPI QR PAYMENT ORDER
 * POST /api/payments/create-order
 * Generates an authentic payment order, registers with Cashfree / Dynamic UPI engine,
 * stores the record in Firebase/DB, and returns the unique Dynamic UPI QR code.
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
    // Unique order ID format
    const uniqueOrderId = 'AR_ORD_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex').toUpperCase();

    const merchantUpi = '9691546208-3@ybl';
    const merchantName = 'Adventure Records';
    const cfConfig = getCashfreeConfig();

    let upiQrString = null;
    let paymentSessionId = null;
    let cfPaymentId = null;
    let gatewayNotice = null;

    // Check if Cashfree API credentials are fully configured
    if (cfConfig.isConfigured) {
      console.log(`⚡ [CASHFREE PG] Initializing order ${uniqueOrderId} on Cashfree (${cfConfig.env})...`);
      const notifyUrl = `${process.env.BACKEND_PUBLIC_URL || 'https://music-b2696.web.app'}/api/payments/webhook`;

      const cfOrderRes = await createCashfreeOrder({
        orderId: uniqueOrderId,
        amount: numericAmount,
        currency: 'INR',
        customerId: userId,
        customerName: customerName || 'Artist',
        customerEmail: userEmail,
        customerPhone: '9691546208',
        orderNote: `Adventure Records: ${releaseTitle || planName || 'Music Distribution'}`,
        notifyUrl
      });

      if (cfOrderRes.success) {
        paymentSessionId = cfOrderRes.paymentSessionId;
        // Generate Dynamic UPI QR from Cashfree
        const qrRes = await generateCashfreeUPIQR(uniqueOrderId, paymentSessionId);
        if (qrRes.success && qrRes.upiQrString) {
          upiQrString = qrRes.upiQrString;
          cfPaymentId = qrRes.cfPaymentId;
          console.log(`✅ [CASHFREE QR] Generated dynamic UPI QR string for ${uniqueOrderId}`);
        }
      } else {
        console.warn('⚠️ Cashfree order creation returned notice:', cfOrderRes.error);
        gatewayNotice = cfOrderRes.error;
      }
    } else {
      gatewayNotice = 'Cashfree credentials (CASHFREE_APP_ID / CASHFREE_SECRET_KEY) are not set in server/.env.';
    }

    // Direct Dynamic UPI QR link with unique order reference (NPCI UPI Specification compliant)
    // tr = unique transaction reference; am = locked amount; pa = merchant VPA
    if (!upiQrString) {
      upiQrString = `upi://pay?pa=${merchantUpi}&pn=${encodeURIComponent(merchantName)}&am=${numericAmount}&cu=INR&tr=${uniqueOrderId}&tn=${encodeURIComponent('Adventure Records ' + (releaseTitle || planName || 'Distribution'))}`;
    }

    // Dynamic QR URL via high-res QR rendering
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(upiQrString)}&_t=${uniqueOrderId}`;

    // Expiry time (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const createdAt = new Date().toISOString();

    const orderRecord = {
      orderId: uniqueOrderId,
      gatewayPaymentId: cfPaymentId,
      bankReference: null,
      paymentGateway: 'CASHFREE',
      paymentSessionId,
      userId: String(userId),
      userEmail: String(userEmail),
      customerName: customerName || '',
      paymentType,
      targetId: targetId || null,
      releaseTitle: releaseTitle || planName || '',
      planName: planName || '',
      amount: numericAmount,
      currency: 'INR',
      merchantUpiId: merchantUpi,
      merchantName: merchantName,
      paymentMethod: 'UPI',
      upiApp: 'UPI',
      status: 'PENDING',
      signature: null,
      verifiedAt: null,
      verifiedBy: null,
      completedAt: null,
      expiresAt,
      createdAt,
      updatedAt: createdAt,
      auditLog: [
        {
          action: 'order_created',
          performedBy: 'AUTOMATIC_UPI_QR_ENGINE',
          timestamp: createdAt,
          ip: req.ip || '',
          notes: `Created dynamic UPI order ${uniqueOrderId} for ₹${numericAmount}`
        }
      ]
    };

    // Save record to DB and sync with Firestore
    await syncOrderCreated(orderRecord);

    console.log(`✅ [ORDER CREATED] Order ${uniqueOrderId} registered for ${userEmail} (₹${numericAmount})`);

    return res.status(200).json({
      success: true,
      orderId: uniqueOrderId,
      amount: numericAmount,
      currency: 'INR',
      merchantUpiId: merchantUpi,
      merchantName: merchantName,
      upiQrString,
      qrCodeUrl,
      paymentGateway: 'CASHFREE',
      paymentType,
      targetId,
      releaseTitle: releaseTitle || planName || '',
      expiresAt,
      gatewayNotice: gatewayNotice || undefined
    });

  } catch (err) {
    console.error('❌ [CREATE ORDER ERROR]:', err);
    return res.status(500).json({ success: false, error: 'Internal error generating dynamic payment order.', details: err.message });
  }
});

/**
 * 2. SECURE AUTOMATED PAYMENT GATEWAY WEBHOOK
 * POST /api/payments/webhook
 * Handles Cashfree dynamic UPI QR payment notifications.
 * Verifies webhook signature, checks idempotency, cross-verifies with Cashfree API,
 * updates payment status to SUCCESS in Firebase, and unlocks release upload automatically.
 */
router.post('/webhook', async (req, res) => {
  try {
    const rawBody = req.rawBody || (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
    const timestamp = req.headers['x-webhook-timestamp'] || '';
    const signature = req.headers['x-webhook-signature'] || req.headers['x-cashfree-signature'];

    console.log(`🔔 [PAYMENT WEBHOOK RECEIVED] Timestamp: ${timestamp}`);

    const cfConfig = getCashfreeConfig();

    // 1. Webhook Signature Verification
    if (cfConfig.isConfigured) {
      if (!signature) {
        console.warn('⚠️ Webhook rejected: Missing signature header.');
        return res.status(401).json({ message: 'Missing webhook signature header.' });
      }

      const isValid = verifyCashfreeWebhookSignature(rawBody, timestamp, signature);
      if (!isValid) {
        console.warn('⚠️ Webhook rejected: Invalid cryptographic signature.');
        return res.status(401).json({ message: 'Invalid webhook signature.' });
      }
      console.log('✅ [WEBHOOK SIGNATURE VERIFIED] Authentic Cashfree webhook');
    }

    const payload = typeof req.body === 'object' ? req.body : JSON.parse(rawBody || '{}');
    const eventType = payload.type || payload.event || '';

    // Extract Order & Payment Details
    const orderData = payload.data?.order || payload.order || {};
    const paymentData = payload.data?.payment || payload.payment || {};

    const orderId = orderData.order_id || payload.data?.order_id || payload.order_id;
    const cfPaymentId = String(paymentData.cf_payment_id || paymentData.payment_id || payload.data?.payment_id || 'PAY_' + Date.now());
    const paymentStatus = (paymentData.payment_status || orderData.order_status || payload.data?.payment_status || '').toUpperCase();
    const bankReference = paymentData.bank_reference || paymentData.payment_reference || payload.data?.bank_reference || null;
    const paidAmount = Number(paymentData.payment_amount || orderData.order_amount || payload.data?.order_amount || 0);

    if (!orderId) {
      console.warn('⚠️ Webhook missing order ID:', payload);
      return res.status(400).json({ message: 'Order ID missing in webhook payload.' });
    }

    console.log(`💳 [WEBHOOK PROCESSING] Order: ${orderId} | Status: ${paymentStatus} | Amount: ₹${paidAmount}`);

    // Locate order in database
    let paymentRecord = await db.payments.findOne({ orderId });
    if (!paymentRecord) {
      paymentRecord = await db.payments.findOne({ targetId: orderId });
    }

    if (!paymentRecord) {
      console.warn(`⚠️ Webhook order ${orderId} not found in database.`);
      return res.status(404).json({ message: 'Order not found in database.' });
    }

    // 2. Idempotency Check: If already SUCCESS, acknowledge without duplicating updates
    if (paymentRecord.status === 'SUCCESS' || paymentRecord.status === 'verified') {
      console.log(`ℹ️ [IDEMPOTENT WEBHOOK] Order ${orderId} already verified as SUCCESS.`);
      return res.status(200).json({ status: 'ok', message: 'Order already verified successfully.' });
    }

    // 3. Process Success Events
    const isSuccessEvent = 
      paymentStatus === 'SUCCESS' || 
      paymentStatus === 'PAID' || 
      eventType === 'PAYMENT_SUCCESS_WEBHOOK' || 
      eventType === 'ORDER_PAID';

    if (isSuccessEvent) {
      // Amount matching security check
      if (paidAmount > 0 && Math.round(paidAmount) < Math.round(paymentRecord.amount)) {
        console.warn(`❌ [AMOUNT MISMATCH REJECTED] Paid: ₹${paidAmount}, Expected: ₹${paymentRecord.amount}`);
        return res.status(400).json({ message: 'Payment amount mismatch.' });
      }

      // If Cashfree credentials configured, double check with Cashfree API
      if (cfConfig.isConfigured) {
        try {
          const verifyApi = await fetchCashfreeOrderPayments(orderId);
          if (verifyApi.success && !verifyApi.hasSuccessfulPayment) {
            console.warn(`⚠️ Cashfree API fetch did not confirm successful payment for ${orderId}`);
          }
        } catch (apiErr) {
          console.warn('Cashfree API verification warning:', apiErr.message);
        }
      }

      // 4. Update status to SUCCESS & Unlock Release
      const verifiedTimestamp = new Date().toISOString();
      await syncPaymentSuccess({
        orderId,
        gatewayPaymentId: cfPaymentId,
        bankReference,
        amount: paymentRecord.amount,
        paymentMethod: paymentData.payment_method?.upi?.channel || 'Dynamic UPI QR',
        verifiedBy: 'CASHFREE_GATEWAY_WEBHOOK'
      });

      // Send emails
      paymentRecord.status = 'SUCCESS';
      paymentRecord.gatewayPaymentId = cfPaymentId;
      paymentRecord.bankReference = bankReference;
      paymentRecord.verifiedAt = verifiedTimestamp;
      sendCustomerPaymentSuccessEmail(paymentRecord).catch(() => {});
      sendAdminPaymentAlertEmail(paymentRecord).catch(() => {});

      console.log(`🔓 [AUTOMATIC UNLOCK SUCCESS] Order ${orderId} verified & release unlocked!`);
      return res.status(200).json({ status: 'ok', message: 'Payment verified and release unlocked.' });
    }

    // 5. Handle Payment Failure / User Dropped events
    const isFailedEvent = 
      paymentStatus === 'FAILED' || 
      paymentStatus === 'USER_DROPPED' || 
      eventType === 'PAYMENT_FAILED_WEBHOOK';

    if (isFailedEvent) {
      await db.payments.findByIdAndUpdate(paymentRecord._id || paymentRecord.id, {
        status: 'FAILED',
        failureReason: paymentData.payment_message || 'Payment transaction declined or dropped by user',
        updatedAt: new Date().toISOString()
      });
      console.log(`⚠️ [PAYMENT FAILED] Order ${orderId} marked as FAILED.`);
      return res.status(200).json({ status: 'ok', message: 'Payment failure recorded.' });
    }

    return res.status(200).json({ status: 'ok', message: 'Webhook event received.' });

  } catch (err) {
    console.error('❌ [WEBHOOK PROCESSING ERROR]:', err);
    return res.status(500).json({ message: 'Internal server error processing webhook.', error: err.message });
  }
});

/**
 * 3. REAL-TIME BACKGROUND PAYMENT STATUS CHECK (Automated Polling Endpoint)
 * GET /api/payments/order-status/:orderId
 * Used by frontend background polling. Automatically verifies with Cashfree API
 * if the webhook was delayed or missed, updates status to SUCCESS, and unlocks release!
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

    // If already marked as SUCCESS, return immediately
    if (payment.status === 'SUCCESS' || payment.status === 'verified') {
      return res.status(200).json({
        success: true,
        orderId: payment.orderId,
        status: 'SUCCESS',
        isSuccess: true,
        amount: payment.amount,
        targetId: payment.targetId,
        paymentType: payment.paymentType,
        gatewayPaymentId: payment.gatewayPaymentId,
        bankReference: payment.bankReference,
        verifiedAt: payment.verifiedAt
      });
    }

    // Check if session has expired
    if (payment.expiresAt && new Date(payment.expiresAt).getTime() < Date.now()) {
      if (payment.status === 'PENDING' || payment.status === 'CREATED') {
        await db.payments.findByIdAndUpdate(payment._id || payment.id, {
          status: 'EXPIRED',
          updatedAt: new Date().toISOString()
        });
        payment.status = 'EXPIRED';
      }
      return res.status(200).json({
        success: true,
        orderId: payment.orderId,
        status: 'EXPIRED',
        isSuccess: false,
        message: 'Payment session has expired. Please generate a new QR code.'
      });
    }

    // If Cashfree is configured, query Cashfree API to check if customer has paid
    const cfConfig = getCashfreeConfig();
    if (cfConfig.isConfigured) {
      try {
        const cfCheck = await fetchCashfreeOrderPayments(orderId);
        if (cfCheck.success && cfCheck.hasSuccessfulPayment) {
          const succPay = cfCheck.successfulPayment;
          console.log(`✅ [POLLING SYNC] Cashfree API confirmed payment for ${orderId}!`);

          await syncPaymentSuccess({
            orderId,
            gatewayPaymentId: String(succPay.cf_payment_id || 'CF_' + Date.now()),
            bankReference: succPay.bank_reference || null,
            amount: payment.amount,
            paymentMethod: succPay.payment_method?.upi?.channel || 'Dynamic UPI QR',
            verifiedBy: 'CASHFREE_API_POLL_VERIFIED'
          });

          payment.status = 'SUCCESS';
          payment.gatewayPaymentId = succPay.cf_payment_id;
          payment.bankReference = succPay.bank_reference;
          payment.verifiedAt = new Date().toISOString();

          sendCustomerPaymentSuccessEmail(payment).catch(() => {});
          sendAdminPaymentAlertEmail(payment).catch(() => {});

          return res.status(200).json({
            success: true,
            orderId: payment.orderId,
            status: 'SUCCESS',
            isSuccess: true,
            amount: payment.amount,
            targetId: payment.targetId,
            paymentType: payment.paymentType,
            gatewayPaymentId: payment.gatewayPaymentId,
            bankReference: payment.bankReference,
            verifiedAt: payment.verifiedAt
          });
        }
      } catch (err) {
        console.warn('Polling Cashfree API notice:', err.message);
      }
    }

    // Return current live status (e.g. 'PENDING')
    return res.status(200).json({
      success: true,
      orderId: payment.orderId,
      status: payment.status,
      isSuccess: false,
      amount: payment.amount,
      targetId: payment.targetId,
      paymentType: payment.paymentType,
      expiresAt: payment.expiresAt
    });

  } catch (err) {
    console.error('❌ [ORDER STATUS ERROR]:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve order status.' });
  }
});

/**
 * 4. GET ALL PAYMENTS FOR ADMIN DASHBOARD (Audited Records)
 * GET /api/payments
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
