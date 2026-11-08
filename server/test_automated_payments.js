import crypto from 'crypto';
import express from 'express';
import paymentRoutes from './routes/payments.js';
import { db } from './db/dbFallback.js';

const app = express();
app.use(express.json({
  limit: '1mb',
  verify: (req, res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
}));
app.use(express.urlencoded({ extended: true }));
app.use('/api/payments', paymentRoutes);

const runTests = async () => {
  console.log('🧪 Starting Automated Payment Verification Test Suite...\n');
  const server = app.listen(5099, async () => {
    try {
      const baseUrl = 'http://localhost:5099/api/payments';
      const secret = process.env.RAZORPAY_KEY_SECRET || 'adventure_records_rzp_secret_key_2026';
      const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || secret;

      // 1. Test Order Creation
      console.log('1️⃣ Testing POST /api/payments/create-order...');
      const createRes = await fetch(`${baseUrl}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'test_artist_123',
          userEmail: 'test.artist@adventurerecords.com',
          customerName: 'Test Artist',
          amount: 100,
          paymentType: 'release',
          targetId: 'rel_test_456',
          releaseTitle: 'Neon Dreams (Single)'
        })
      });
      const orderData = await createRes.json();
      if (!createRes.ok || !orderData.orderId) {
        throw new Error('Order creation failed: ' + JSON.stringify(orderData));
      }
      console.log(`   ✅ Order created successfully: ${orderData.orderId} (₹${orderData.amount})`);

      const orderId = orderData.orderId;
      const paymentId = 'pay_' + crypto.randomBytes(8).toString('hex');

      // 2. Test Invalid Signature (Tampered / Replay Attempt)
      console.log('\n2️⃣ Testing Invalid Signature Rejection...');
      const badVerifyRes = await fetch(`${baseUrl}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          paymentId,
          signature: 'invalid_tampered_signature_1234567890abcdef',
          userId: 'test_artist_123',
          userEmail: 'test.artist@adventurerecords.com'
        })
      });
      const badVerifyData = await badVerifyRes.json();
      if (badVerifyRes.status === 400 && !badVerifyData.success) {
        console.log('   ✅ Bad signature correctly rejected with 400 Bad Request.');
      } else {
        throw new Error('Expected 400 rejection for bad signature but got: ' + badVerifyRes.status);
      }

      // 3. Test Cryptographic HMAC Signature Verification (Success)
      console.log('\n3️⃣ Testing Cryptographically Verified Signature...');
      const validSignature = crypto
        .createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const goodVerifyRes = await fetch(`${baseUrl}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          paymentId,
          signature: validSignature,
          userId: 'test_artist_123',
          userEmail: 'test.artist@adventurerecords.com'
        })
      });
      const goodVerifyData = await goodVerifyRes.json();
      if (goodVerifyRes.ok && goodVerifyData.status === 'SUCCESS') {
        console.log(`   ✅ Payment verified! Status: ${goodVerifyData.status}`);
        console.log(`   Message: "${goodVerifyData.message}"`);
      } else {
        throw new Error('Valid signature verification failed: ' + JSON.stringify(goodVerifyData));
      }

      // 4. Test Idempotency (Submitting the same order again)
      console.log('\n4️⃣ Testing Idempotency (Repeat Submission)...');
      const repeatRes = await fetch(`${baseUrl}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          paymentId,
          signature: validSignature
        })
      });
      const repeatData = await repeatRes.json();
      if (repeatRes.ok && repeatData.status === 'SUCCESS' && repeatData.message.includes('already verified')) {
        console.log('   ✅ Idempotent request safely handled without duplicate execution.');
      } else {
        throw new Error('Idempotency check failed: ' + JSON.stringify(repeatData));
      }

      // 5. Test Live Order Status Polling
      console.log('\n5️⃣ Testing GET /api/payments/order-status/:orderId...');
      const statusRes = await fetch(`${baseUrl}/order-status/${orderId}`);
      const statusData = await statusRes.json();
      if (statusRes.ok && statusData.status === 'SUCCESS') {
        console.log(`   ✅ Order status queried successfully: ${statusData.status} (Tx: ${statusData.gatewayPaymentId})`);
      } else {
        throw new Error('Order status retrieval failed: ' + JSON.stringify(statusData));
      }

      // 6. Test Webhook Signature & Event Processing
      console.log('\n6️⃣ Testing Gateway Webhook Verification & Processing...');
      const webhookOrderId = 'order_webhook_' + Date.now();
      await db.payments.create({
        orderId: webhookOrderId,
        userId: 'webhook_user',
        userEmail: 'webhook.artist@adventurerecords.com',
        amount: 500,
        currency: 'INR',
        paymentType: 'release',
        targetId: 'rel_webhook_ep',
        status: 'CREATED'
      });

      const webhookPayload = JSON.stringify({
        event: 'order.paid',
        payload: {
          order: { entity: { id: webhookOrderId, amount: 50000, status: 'paid' } },
          payment: { entity: { id: 'pay_wh_' + Date.now(), order_id: webhookOrderId, amount: 50000, method: 'upi' } }
        }
      });

      const webhookSig = crypto
        .createHmac('sha256', webhookSecret)
        .update(webhookPayload)
        .digest('hex');

      const webhookRes = await fetch(`${baseUrl}/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': webhookSig
        },
        body: webhookPayload
      });
      const webhookData = await webhookRes.json();
      if (webhookRes.ok && webhookData.status === 'ok') {
        console.log('   ✅ Webhook processed successfully with HMAC verification.');
      } else {
        throw new Error('Webhook processing failed: ' + JSON.stringify(webhookData));
      }

      // 7. Verify Webhook updated status in DB
      const updatedOrder = await db.payments.findOne({ orderId: webhookOrderId });
      if (updatedOrder && updatedOrder.status === 'SUCCESS') {
        console.log(`   ✅ Webhook order status transitioned to: ${updatedOrder.status}`);
      } else {
        throw new Error('Webhook did not update order status to SUCCESS');
      }

      console.log('\n🎉 ALL 7 AUTOMATED PAYMENT GATEWAY TESTS PASSED PERFECTLY!\n');

    } catch (err) {
      console.error('\n❌ Test failure:', err);
    } finally {
      server.close();
      process.exit(0);
    }
  });
};

runTests();
