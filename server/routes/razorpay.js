/**
 * Adventure Records — Razorpay Standard Web Checkout Routes
 * POST /api/razorpay/create-order  → creates Razorpay order, returns order metadata
 * POST /api/razorpay/verify-payment → HMAC-SHA256 signature verification + Firestore sync
 */

import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { syncPaymentSuccess, syncOrderCreated } from '../services/firebaseSync.js';

const router = express.Router();

// Lazily initialised so the server starts even if keys are temporarily missing
let razorpayInstance = null;
const getRazorpay = () => {
  if (!razorpayInstance) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new Error('Razorpay credentials (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) are not configured in server/.env');
    }
    razorpayInstance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return razorpayInstance;
};

// ─── 1. CREATE ORDER ──────────────────────────────────────────────────────────
/**
 * POST /api/razorpay/create-order
 * Body: { amount (paise, min 100), currency?, receipt?, userId, userEmail,
 *         customerName?, paymentType?, targetId?, releaseTitle? }
 * Returns: { order_id, amount, currency, orderId }
 */
router.post('/create-order', async (req, res) => {
  try {
    const {
      amount,
      currency = 'INR',
      receipt,
      userId,
      userEmail,
      customerName = '',
      paymentType = 'release',
      targetId,
      releaseTitle = '',
      planName = ''
    } = req.body;

    // ── Validation ─────────────────────────────────────────────────────────
    if (!amount || Number(amount) < 100) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be at least 100 paise (₹1).'
      });
    }
    if (!userId || !userEmail) {
      return res.status(400).json({
        success: false,
        message: 'userId and userEmail are required.'
      });
    }

    const paise = Math.round(Number(amount));
    const rupees = paise / 100;

    // ── Create Razorpay Order ───────────────────────────────────────────────
    const rzp = getRazorpay();
    const rzpOrder = await rzp.orders.create({
      amount: paise,
      currency,
      receipt: receipt || `AR_RZP_${Date.now()}`,
      notes: {
        userId,
        userEmail,
        paymentType,
        targetId: targetId || '',
        releaseTitle: releaseTitle || planName || 'Music Distribution'
      }
    });

    // ── Persist pending order record (Firestore) ───────────────────────────
    const internalOrderId = `AR_RZP_${rzpOrder.id}`;
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min

    const orderRecord = {
      orderId: internalOrderId,
      razorpayOrderId: rzpOrder.id,
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
      amount: rupees,
      amountPaise: paise,
      currency,
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
          notes: `Razorpay order ${rzpOrder.id} created for ₹${rupees}`
        }
      ]
    };

    await syncOrderCreated(orderRecord);
    console.log(`✅ [RAZORPAY ORDER CREATED] ${rzpOrder.id} for ${userEmail} (₹${rupees})`);

    return res.status(200).json({
      success: true,
      order_id: rzpOrder.id,       // Razorpay order id — sent to checkout.js
      amount: rzpOrder.amount,     // paise
      currency: rzpOrder.currency,
      orderId: internalOrderId,    // our internal reference
      paymentType,
      targetId,
      releaseTitle: releaseTitle || planName || ''
    });

  } catch (err) {
    console.error('❌ [RAZORPAY CREATE ORDER ERROR]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to create Razorpay order.',
      error: err.message
    });
  }
});

// ─── 2. VERIFY PAYMENT ────────────────────────────────────────────────────────
/**
 * POST /api/razorpay/verify-payment
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature,
 *         userId, userEmail, paymentType?, targetId?, releaseTitle?, amount }
 * Returns: { success, message, payment_id }
 */
router.post('/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      userEmail,
      customerName = '',
      paymentType = 'release',
      targetId,
      releaseTitle = '',
      amount          // in paise (as sent from frontend)
    } = req.body;

    // ── Field validation ───────────────────────────────────────────────────
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required Razorpay fields (order_id, payment_id, signature).'
      });
    }

    // ── HMAC-SHA256 Signature Verification ────────────────────────────────
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({ success: false, message: 'Razorpay secret not configured.' });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.warn(`❌ [RAZORPAY SIGNATURE MISMATCH] order=${razorpay_order_id}`);
      return res.status(400).json({
        success: false,
        message: 'Payment signature verification failed. Payment not authorised.'
      });
    }

    console.log(`✅ [RAZORPAY SIGNATURE VERIFIED] ${razorpay_payment_id} for order ${razorpay_order_id}`);

    // ── Sync SUCCESS to Firestore ──────────────────────────────────────────
    const internalOrderId = `AR_RZP_${razorpay_order_id}`;
    const rupees = amount ? Math.round(Number(amount)) / 100 : 0;
    const verifiedAt = new Date().toISOString();

    await syncPaymentSuccess({
      orderId: internalOrderId,
      razorpayOrderId: razorpay_order_id,
      gatewayPaymentId: razorpay_payment_id,
      bankReference: razorpay_payment_id,
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

    console.log(`🔓 [RAZORPAY UNLOCK] Release unlocked for order ${razorpay_order_id} (${userEmail})`);

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully. Release is now unlocked.',
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      orderId: internalOrderId,
      verifiedAt
    });

  } catch (err) {
    console.error('❌ [RAZORPAY VERIFY ERROR]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Internal error verifying Razorpay payment.',
      error: err.message
    });
  }
});

export default router;
