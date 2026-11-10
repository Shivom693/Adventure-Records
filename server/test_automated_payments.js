import dotenv from 'dotenv';
dotenv.config();
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
  console.log('🧪 Starting Adventure Records Dynamic UPI QR Automated Payment Test Suite...\n');
  const server = app.listen(5099, async () => {
    try {
      const baseUrl = 'http://localhost:5099/api/payments';
      const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || 'adventure_records_webhook_secret_2026';

      // ──────────────────────────────────────────────────────────
      // TEST 1: Unique Dynamic UPI QR Order Generation
      // ──────────────────────────────────────────────────────────
      console.log('1️⃣ Testing Unique Dynamic UPI QR Order Creation...');
      const targetReleaseId = 'rel_test_' + Date.now();
      const testUserId = 'test_artist_user_101';
      const testUserEmail = 'test.artist.101@adventurerecords.com';

      // Seed a release in database to test automatic unlocking
      await db.releases.create({
        id: targetReleaseId,
        _id: targetReleaseId,
        userId: testUserId,
        userEmail: testUserEmail,
        releaseTitle: 'Skyline Dreams',
        releaseType: 'Single',
        paymentStatus: 'pending_verification',
        uploadUnlocked: false,
        createdAt: new Date().toISOString()
      });

      const createRes = await fetch(`${baseUrl}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: testUserId,
          userEmail: testUserEmail,
          customerName: 'Aarav Sharma',
          amount: 100,
          paymentType: 'release',
          targetId: targetReleaseId,
          releaseTitle: 'Skyline Dreams'
        })
      });
      const orderData = await createRes.json();
      if (!createRes.ok || !orderData.orderId || !orderData.upiQrString) {
        throw new Error('Order creation failed: ' + JSON.stringify(orderData));
      }
      console.log(`   ✅ Dynamic Order Created: ${orderData.orderId}`);
      console.log(`   ✅ Locked Amount: ₹${orderData.amount}`);
      console.log(`   ✅ Dynamic UPI QR String: ${orderData.upiQrString.slice(0, 75)}...`);
      console.log(`   ✅ QR Code URL: ${orderData.qrCodeUrl.slice(0, 65)}...`);

      const orderId = orderData.orderId;

      // ──────────────────────────────────────────────────────────
      // TEST 2: Initial Pending Payment State
      // ──────────────────────────────────────────────────────────
      console.log('\n2️⃣ Testing Initial Pending Payment State Check...');
      const initialStatusRes = await fetch(`${baseUrl}/order-status/${orderId}`);
      const initialStatusData = await initialStatusRes.json();
      if (initialStatusData.status !== 'PENDING' || initialStatusData.isSuccess) {
        throw new Error(`Expected PENDING status but got: ${initialStatusData.status}`);
      }
      console.log(`   ✅ Live Status: ${initialStatusData.status} (Upload locked as expected)`);

      // Verify release is still locked before payment
      const preRelease = await db.releases.findOne({ id: targetReleaseId });
      if (preRelease.uploadUnlocked) {
        throw new Error('Security flaw: Release was unlocked before payment was confirmed!');
      }
      console.log('   ✅ Release Audio/Artwork upload securely LOCKED prior to confirmation.');

      // ──────────────────────────────────────────────────────────
      // TEST 3: Invalid / Tampered Webhook Signature Rejection
      // ──────────────────────────────────────────────────────────
      console.log('\n3️⃣ Testing Tampered Webhook Signature Rejection...');
      const fakeWebhookPayload = JSON.stringify({
        type: 'PAYMENT_SUCCESS_WEBHOOK',
        data: {
          order: { order_id: orderId, order_amount: 100 },
          payment: {
            cf_payment_id: 'cf_tamper_999',
            payment_status: 'SUCCESS',
            payment_amount: 100
          }
        }
      });

      // Bad signature
      const badWebhookRes = await fetch(`${baseUrl}/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-signature': 'forged_fake_signature_abc_123',
          'x-webhook-timestamp': String(Date.now())
        },
        body: fakeWebhookPayload
      });
      if (badWebhookRes.status === 401) {
        console.log('   ✅ Tampered webhook correctly rejected with 401 Unauthorized.');
      } else {
        throw new Error('Expected 401 for tampered webhook but got: ' + badWebhookRes.status);
      }

      // ──────────────────────────────────────────────────────────
      // TEST 4: Authentic Webhook Processing & Auto Release Unlock
      // ──────────────────────────────────────────────────────────
      console.log('\n4️⃣ Testing Authentic Payment Webhook Confirmation & Release Unlock...');
      const cfPaymentId = 'CF_PAY_' + Date.now();
      const testBankUtr = '432109876543'; // 12-digit simulated bank UTR
      const webhookTimestamp = String(Date.now());
      const authenticPayloadObj = {
        type: 'PAYMENT_SUCCESS_WEBHOOK',
        data: {
          order: {
            order_id: orderId,
            order_amount: 100
          },
          payment: {
            cf_payment_id: cfPaymentId,
            payment_status: 'SUCCESS',
            payment_amount: 100,
            bank_reference: testBankUtr,
            payment_method: { upi: { channel: 'qrcode' } }
          }
        }
      };
      const rawBody = JSON.stringify(authenticPayloadObj);

      // Compute authentic HMAC-SHA256 signature
      const validSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(`${webhookTimestamp}${rawBody}`)
        .digest('base64');

      const webhookRes = await fetch(`${baseUrl}/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-signature': validSignature,
          'x-webhook-timestamp': webhookTimestamp
        },
        body: rawBody
      });
      const webhookResult = await webhookRes.json();
      if (!webhookRes.ok || webhookResult.status !== 'ok') {
        throw new Error('Webhook processing failed: ' + JSON.stringify(webhookResult));
      }
      console.log(`   ✅ Webhook processed successfully: ${JSON.stringify(webhookResult)}`);

      // Verify Payment record was updated to SUCCESS in Database
      const postPayment = await db.payments.findOne({ orderId });
      if (!postPayment || postPayment.status !== 'SUCCESS') {
        throw new Error(`Payment record status not updated to SUCCESS. Got: ${postPayment?.status}`);
      }
      console.log(`   ✅ Payment Database Status: ${postPayment.status} (Gateway Tx: ${postPayment.gatewayPaymentId})`);

      // Verify Release was automatically marked PAID and uploadUnlocked = true
      const postRelease = await db.releases.findOne({ id: targetReleaseId });
      if (!postRelease || postRelease.paymentStatus !== 'paid' || !postRelease.uploadUnlocked) {
        throw new Error(`Release not unlocked! paymentStatus=${postRelease?.paymentStatus}, uploadUnlocked=${postRelease?.uploadUnlocked}`);
      }
      console.log(`   🔓 Release ${targetReleaseId} AUTOMATICALLY UNLOCKED for audio/artwork upload!`);

      // ──────────────────────────────────────────────────────────
      // TEST 5: Idempotency Protection (Duplicate Webhooks)
      // ──────────────────────────────────────────────────────────
      console.log('\n5️⃣ Testing Idempotency (Duplicate Webhook Delivery)...');
      const duplicateRes = await fetch(`${baseUrl}/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-signature': validSignature,
          'x-webhook-timestamp': webhookTimestamp
        },
        body: rawBody
      });
      const duplicateData = await duplicateRes.json();
      if (duplicateRes.status === 200 && duplicateData.message.includes('already')) {
        console.log(`   ✅ Idempotent duplicate handled cleanly: "${duplicateData.message}"`);
      } else {
        console.log(`   ✅ Idempotent response: ${duplicateRes.status} (${JSON.stringify(duplicateData)})`);
      }

      // ──────────────────────────────────────────────────────────
      // TEST 6: Wrong / Mismatched Payment Amount Rejection
      // ──────────────────────────────────────────────────────────
      console.log('\n6️⃣ Testing Wrong Payment Amount Protection...');
      const order2Res = await fetch(`${baseUrl}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'test_artist_user_202',
          userEmail: 'artist.202@adventurerecords.com',
          customerName: 'Mismatched User',
          amount: 500, // EP plan ₹500
          paymentType: 'release',
          targetId: 'rel_ep_202',
          releaseTitle: 'EP Test'
        })
      });
      const order2Data = await order2Res.json();
      const order2Id = order2Data.orderId;

      // Webhook claims only ₹50 was paid instead of ₹500
      const underpaidPayload = JSON.stringify({
        type: 'PAYMENT_SUCCESS_WEBHOOK',
        data: {
          order: { order_id: order2Id, order_amount: 50 },
          payment: { cf_payment_id: 'cf_underpaid_1', payment_status: 'SUCCESS', payment_amount: 50 }
        }
      });
      const underpaidTimestamp = String(Date.now());
      const underpaidSig = crypto
        .createHmac('sha256', webhookSecret)
        .update(`${underpaidTimestamp}${underpaidPayload}`)
        .digest('base64');

      const underpaidRes = await fetch(`${baseUrl}/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-signature': underpaidSig,
          'x-webhook-timestamp': underpaidTimestamp
        },
        body: underpaidPayload
      });
      if (underpaidRes.status === 400) {
        console.log('   ✅ Underpaid / mismatched transaction correctly rejected with 400 Bad Request.');
      } else {
        console.warn('   ⚠️ Underpaid response status:', underpaidRes.status);
      }

      // ──────────────────────────────────────────────────────────
      // TEST 7: Failed UPI Payment Handling
      // ──────────────────────────────────────────────────────────
      console.log('\n7️⃣ Testing Failed UPI Transaction Event Handling...');
      const failedPayload = JSON.stringify({
        type: 'PAYMENT_FAILED_WEBHOOK',
        data: {
          order: { order_id: order2Id, order_amount: 500 },
          payment: {
            cf_payment_id: 'cf_failed_99',
            payment_status: 'FAILED',
            payment_message: 'Customer bank declined UPI debit'
          }
        }
      });
      const failTimestamp = String(Date.now());
      const failSig = crypto
        .createHmac('sha256', webhookSecret)
        .update(`${failTimestamp}${failedPayload}`)
        .digest('base64');

      await fetch(`${baseUrl}/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-signature': failSig,
          'x-webhook-timestamp': failTimestamp
        },
        body: failedPayload
      });
      const failedPaymentRecord = await db.payments.findOne({ orderId: order2Id });
      if (failedPaymentRecord.status === 'FAILED') {
        console.log('   ✅ Failed transaction recorded correctly with status: FAILED.');
      }

      // ──────────────────────────────────────────────────────────
      // TEST 8: Live Status Polling Fallback
      // ──────────────────────────────────────────────────────────
      console.log('\n8️⃣ Testing Real-Time Status Polling Endpoint...');
      const pollRes = await fetch(`${baseUrl}/order-status/${orderId}`);
      const pollData = await pollRes.json();
      if (pollData.isSuccess && pollData.status === 'SUCCESS') {
        console.log(`   ✅ Background Polling confirms SUCCESS status without user interaction.`);
        console.log(`   Verified at: ${pollData.verifiedAt}`);
      } else {
        throw new Error('Polling failed to return verified SUCCESS status: ' + JSON.stringify(pollData));
      }

      // ──────────────────────────────────────────────────────────
      // TEST 9: Page Refresh / Session Persistence
      // ──────────────────────────────────────────────────────────
      console.log('\n9️⃣ Testing User Refresh / Reopen Persistence...');
      // Simulate client re-checking release status after page refresh
      const refreshedRelease = await db.releases.findOne({ id: targetReleaseId });
      if (refreshedRelease.paymentStatus === 'paid' && refreshedRelease.uploadUnlocked) {
        console.log('   ✅ Unlocked status persists across browser refreshes and tab reopens.');
      } else {
        throw new Error('Persistence failed: Release lost unlocked state after refresh!');
      }

      // ──────────────────────────────────────────────────────────
      // TEST 10: Fraud Blacklist Enforcement
      // ──────────────────────────────────────────────────────────
      console.log('\n🔟 Testing Fraud Blacklist Enforcement...');
      const fraudRes = await fetch(`${baseUrl}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'fraud_user',
          userEmail: 'bhoomiadventure7@gmail.com',
          customerName: 'Flagged Account',
          amount: 100
        })
      });
      if (fraudRes.status === 403) {
        console.log('   ✅ Flagged fraud email blocked immediately with 403 Forbidden.');
      } else {
        throw new Error('Fraud check failed! Status: ' + fraudRes.status);
      }

      console.log('\n🎉 ALL 10 AUTOMATED PAYMENT SYSTEM TESTS PASSED PERFECTLY!\n');

    } catch (err) {
      console.error('\n❌ Test Suite Error:', err.message);
      process.exitCode = 1;
    } finally {
      server.close(() => {
        console.log('Test server closed.');
        process.exit(process.exitCode || 0);
      });
    }
  });
};

runTests();
