import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { syncPaymentSuccess, syncOrderCreated } from '../services/firebaseSync.js';
import { escHtml, getAdminEmail, sendEmail } from '../services/emailService.js';

const router = express.Router();

// Helper to get Razorpay instance
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    const error = new Error('Razorpay credentials not configured.');
    error.statusCode = 401;
    throw error;
  }
  return new Razorpay({ key_id, key_secret });
};

// ─── STEP 1: CREATE ORDER ───────────────────────────────────────────────────
// POST /create-order (can be accessed at /api/create-order or /api/razorpay/create-order)
router.post('/create-order', async (req, res) => {
  try {
    const {
      amount,
      currency = 'INR',
      receipt,
      userId = 'guest',
      userEmail = 'customer@adventurerecords.com',
      customerName = '',
      paymentType = 'release',
      targetId = null,
      releaseTitle = '',
      planName = ''
    } = req.body;

    // Validate amount >= 100 paise
    const numericAmount = Number(amount);
    if (!amount || isNaN(numericAmount) || numericAmount < 100) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be at least 100 paise (₹1).',
        message: 'Amount must be at least 100 paise (₹1).'
      });
    }

    const rzp = getRazorpayInstance();
    const orderOptions = {
      amount: Math.round(numericAmount),
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: {
        userId: String(userId),
        userEmail: String(userEmail),
        paymentType,
        targetId: targetId || '',
        releaseTitle: releaseTitle || planName || 'Adventure Records'
      }
    };

    const order = await rzp.orders.create(orderOptions);

    // Save order record locally and in Firestore for tracking
    try {
      const internalOrderId = `AR_RZP_${order.id}`;
      const createdAt = new Date().toISOString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      await syncOrderCreated({
        orderId: internalOrderId,
        razorpayOrderId: order.id,
        gatewayPaymentId: null,
        bankReference: null,
        paymentGateway: 'RAZORPAY',
        userId: String(userId),
        userEmail: String(userEmail),
        customerName,
        paymentType,
        targetId: targetId || null,
        releaseTitle: releaseTitle || planName || '',
        planName: planName || '',
        amount: Math.round(numericAmount) / 100,
        amountPaise: Math.round(numericAmount),
        currency: order.currency,
        paymentMethod: 'RAZORPAY',
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
            action: 'razorpay_order_created',
            performedBy: 'RAZORPAY_CHECKOUT',
            timestamp: createdAt,
            ip: req.ip || '',
            notes: `Razorpay order ${order.id} created for ₹${Math.round(numericAmount) / 100}`
          }
        ]
      });
    } catch (dbErr) {
      console.warn('⚠️ [RAZORPAY ORDER DB LOG NOTICE]:', dbErr.message);
    }

    return res.status(200).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
      id: order.id,
      receipt: order.receipt
    });
  } catch (err) {
    console.error('❌ [RAZORPAY CREATE ORDER ERROR]:', err);
    const rzpDesc = err?.error?.description || err?.message || 'Failed to create Razorpay order.';
    if (err.statusCode === 401 || err.error?.code === 'BAD_REQUEST_ERROR') {
      return res.status(err.statusCode || 401).json({
        success: false,
        error: `Razorpay authentication or request failed: ${rzpDesc}`,
        message: `Razorpay authentication failed (${rzpDesc}). Please verify RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.`
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Failed to create Razorpay order.',
      message: rzpDesc
    });
  }
});

// ─── STEP 3: VERIFY SIGNATURE ───────────────────────────────────────────────
// POST /verify-payment (can be accessed at /api/verify-payment or /api/razorpay/verify-payment)
router.post('/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      order_id,
      razorpay_payment_id,
      payment_id,
      razorpay_signature,
      signature,
      userId,
      userEmail,
      customerName = '',
      paymentType = 'release',
      targetId,
      releaseTitle = '',
      amount
    } = req.body;

    const resolvedOrderId = razorpay_order_id || order_id;
    const resolvedPaymentId = razorpay_payment_id || payment_id;
    const resolvedSignature = razorpay_signature || signature;

    // Missing fields check: return 400
    if (!resolvedOrderId || !resolvedPaymentId || !resolvedSignature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: order_id, payment_id, and signature are required.',
        message: 'Missing required fields: order_id, payment_id, and signature are required.'
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({
        success: false,
        error: 'Razorpay secret key not configured on server.',
        message: 'Razorpay secret key not configured on server.'
      });
    }

    // Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${resolvedOrderId}|${resolvedPaymentId}`)
      .digest('hex');

    // Signature mismatch: return 400, do NOT mark as paid
    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const receivedBuf = Buffer.from(String(resolvedSignature), 'utf8');
    if (expectedBuf.length !== receivedBuf.length || !crypto.timingSafeEqual(expectedBuf, receivedBuf)) {
      console.warn(`❌ [RAZORPAY SIGNATURE MISMATCH] order=${resolvedOrderId}, payment=${resolvedPaymentId}`);
      return res.status(400).json({
        success: false,
        error: 'Payment signature mismatch. Payment not verified.',
        message: 'Payment signature mismatch. Payment not verified.'
      });
    }

    console.log(`✅ [RAZORPAY SIGNATURE VERIFIED] Payment ${resolvedPaymentId} for order ${resolvedOrderId}`);

    // If verified, mark payment as paid & unlock release in database
    const internalOrderId = `AR_RZP_${resolvedOrderId}`;
    const verifiedAt = new Date().toISOString();
    const rupees = amount ? Math.round(Number(amount)) / 100 : undefined;

    try {
      await syncPaymentSuccess({
        orderId: internalOrderId,
        gatewayPaymentId: resolvedPaymentId,
        bankReference: resolvedPaymentId,
        amount: rupees,
        paymentMethod: 'RAZORPAY',
        verifiedBy: 'RAZORPAY_SIGNATURE',
        targetId,
        paymentType,
        userId,
        userEmail,
        customerName,
        releaseTitle,
        verifiedAt
      });
    } catch (syncErr) {
      console.warn('⚠️ [RAZORPAY SYNC NOTICE]:', syncErr.message);
    }

    // Send verified billing notifications (non-blocking)
    const displayAmount = rupees ?? 0;
    if (userEmail && userEmail !== 'customer@adventurerecords.com') {
      sendEmail({
        to: userEmail,
        fromName: 'Adventure Records Billing',
        subject: `✅ Payment Verified — Adventure Records [${resolvedOrderId}]`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0d12; color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #27272a;">
            <h2 style="color: #4ade80; text-align: center; margin-top: 0;">Payment Successful ✓</h2>
            <p style="color: #e4e4e7; font-size: 14px; line-height: 1.6;">
              Your Razorpay payment${displayAmount ? ` of <strong>₹${displayAmount}</strong>` : ''} has been verified (${escHtml(resolvedPaymentId)}). Your release upload access is now unlocked.
            </p>
            <p style="color: #a1a1aa; font-size: 12px;">Order ID: ${escHtml(resolvedOrderId)}</p>
          </div>
        `
      }).catch(() => {});
    }

    sendEmail({
      to: getAdminEmail(),
      fromName: 'Adventure Records Billing',
      subject: `⚡ [Razorpay Verified] ₹${displayAmount} (${resolvedOrderId})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0d12; color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #27272a;">
          <h2 style="color: #38bdf8; margin-top: 0;">⚡ Razorpay Payment Verified</h2>
          <p style="color: #d4d4d8; font-size: 13px;">
            Customer: ${escHtml(customerName || 'Artist')} (${escHtml(userEmail || 'N/A')})<br/>
            Order ID: ${escHtml(resolvedOrderId)}<br/>
            Payment ID: ${escHtml(resolvedPaymentId)}<br/>
            Amount: ₹${displayAmount}<br/>
            Target: ${escHtml(releaseTitle || targetId || paymentType)}
          </p>
        </div>
      `
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully.',
      payment_id: resolvedPaymentId,
      order_id: resolvedOrderId,
      verifiedAt
    });
  } catch (err) {
    console.error('❌ [RAZORPAY VERIFY ERROR]:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to verify payment.',
      message: err.message
    });
  }
});

export default router;
