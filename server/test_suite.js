import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_PORT = 5099;
process.env.PORT = String(TEST_PORT);
process.env.JWT_SECRET = 'test_jwt_secret_key_for_adventure_records_verification_suite_2026';
process.env.ADMIN_EMAIL = 'adventureof693@gmail.com';
process.env.ADMIN_PANEL_URL = 'http://localhost:5173/admin';
process.env.PAYMENT_WEBHOOK_SECRET = 'test_webhook_secret_adventure_12345';

console.log('🧪 ========================================================');
console.log('🧪 ADVENTURE RECORDS — AUTOMATED INTEGRATION TEST SUITE');
console.log('🧪 ========================================================\n');

let serverProcess;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

let adminToken;
let userToken;

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    throw new Error(`Test failed: ${testName}`);
  }
}

async function runTests() {
  // 1. Import and start server
  const { default: expressApp } = await import('./index.js');
  const { db } = await import('./db/dbFallback.js');
  // Wait 1.5 seconds for server listener
  await new Promise(r => setTimeout(r, 1500));

  // Ensure test users exist in database so authenticateToken finds them
  let testUser = await db.users.findOne({ email: 'testartist@example.com' });
  if (!testUser) {
    testUser = await db.users.create({
      email: 'testartist@example.com',
      name: 'Test Artist',
      role: 'Artist'
    });
  }

  let adminUser = await db.users.findOne({ email: 'adventureof693@gmail.com' });
  if (!adminUser) {
    adminUser = await db.users.create({
      email: 'adventureof693@gmail.com',
      name: 'Adventure Admin',
      role: 'Admin'
    });
  }

  const { getJwtSecret } = await import('./routes/auth.js');
  const secret = getJwtSecret();

  userToken = jwt.sign(
    { id: testUser._id || testUser.id, email: 'testartist@example.com', role: 'Artist' },
    secret,
    { expiresIn: '1h' }
  );

  adminToken = jwt.sign(
    { id: adminUser._id || adminUser.id, email: 'adventureof693@gmail.com', role: 'Admin' },
    secret,
    { expiresIn: '1h' }
  );

  console.log('\n--- SUITE 1: HEALTH & PUBLIC ENDPOINTS ---');
  {
    const res = await fetch(`${BASE_URL}/api/health`);
    assert(res.status === 200, 'Health endpoint responds with 200 OK');
    const data = await res.json();
    assert(data.status === 'healthy', 'Health payload status is "healthy"');
  }

  console.log('\n--- SUITE 2: SUPPORT TICKETS & EMAIL AUTOMATION (TASK 1) ---');
  let createdTicketId = null;
  {
    // Validation failure: missing fields
    const resInvalid = await fetch(`${BASE_URL}/api/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'A', email: 'not-an-email', message: '' })
    });
    assert(resInvalid.status === 400, 'Rejects invalid ticket fields with 400 Bad Request');

    // Validation: CRLF injection in email is detected and rejected
    const resCrlf = await fetch(`${BASE_URL}/api/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Artist',
        email: 'hacker@example.com\r\nBcc: victim@example.com',
        subject: 'Header\r\nInjection',
        category: 'General Inquiry',
        message: 'Testing header injection protection'
      })
    });
    assert(resCrlf.status === 400, 'Actively rejects email containing CRLF injection with 400 Bad Request');

    // Valid ticket creation
    const resValid = await fetch(`${BASE_URL}/api/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Doe Artist',
        email: 'john.doe@example.com',
        subject: 'Need help with Spotify artist claim',
        category: 'Official Channels Sync',
        message: 'Hello, please help link my Spotify artist profile with my new single release.',
        releaseId: 'rel_test_spotify_123'
      })
    });
    assert(resValid.status === 201, 'Creates support ticket with 201 Created');
    const data = await resValid.json();
    assert(data.success === true, 'Response reports success: true');
    assert(data.ticketId && data.ticketId.startsWith('AR-TICK-'), 'Generated unique Ticket ID with prefix AR-TICK-');
    assert(data.emailDelivery !== undefined, 'Accurately reports emailDelivery tracking status without false claims');
    createdTicketId = data.ticketId;
  }

  console.log('\n--- SUITE 3: SUPPORT FILE UPLOADS & ATTACHMENTS (TASK 2) ---');
  let uploadedFileId = null;
  let downloadToken = null;
  {
    // Create temporary test files: 1 valid PNG, 1 valid PDF, 1 invalid executable
    const testDir = path.join(__dirname, 'test_tmp');
    if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });

    // Valid PNG: 8-byte PNG signature: 89 50 4E 47 0D 0A 1A 0A
    const validPngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D]);
    const validPngPath = path.join(testDir, 'test_receipt.png');
    fs.writeFileSync(validPngPath, validPngBuffer);

    // Fake PNG (actually an EXE disguised as PNG)
    const fakePngBuffer = Buffer.from([0x4D, 0x5A, 0x90, 0x00]); // 'MZ' DOS header
    const fakePngPath = path.join(testDir, 'trojan.png');
    fs.writeFileSync(fakePngPath, fakePngBuffer);

    // Test rejection of fake magic bytes
    const fakeFormData = new FormData();
    fakeFormData.append('name', 'Hacker Bob');
    fakeFormData.append('email', 'bob@example.com');
    fakeFormData.append('subject', 'Malicious File Test');
    fakeFormData.append('category', 'General Contact');
    fakeFormData.append('message', 'Trying to upload an executable disguised as PNG.');
    fakeFormData.append('attachments', new Blob([fakePngBuffer], { type: 'image/png' }), 'trojan.png');

    const resFake = await fetch(`${BASE_URL}/api/tickets`, {
      method: 'POST',
      body: fakeFormData
    });
    assert(resFake.status === 400, 'Rejects file upload with disguised binary/mismatched magic bytes (400)');

    // Test valid file upload with real PNG
    const validFormData = new FormData();
    validFormData.append('name', 'Legit Artist');
    validFormData.append('email', 'artist@example.com');
    validFormData.append('subject', 'Payment Proof Screenshot');
    validFormData.append('category', 'Billing & Pricing');
    validFormData.append('message', 'Attached my genuine bank payment screenshot for the single release.');
    validFormData.append('attachments', new Blob([validPngBuffer], { type: 'image/png' }), 'test_receipt.png');

    const resValidUpload = await fetch(`${BASE_URL}/api/tickets`, {
      method: 'POST',
      body: validFormData
    });
    assert(resValidUpload.status === 201, 'Accepts valid PNG attachment with verified magic bytes (201)');
    const uploadData = await resValidUpload.json();
    assert(uploadData.ticket.attachments && uploadData.ticket.attachments.length === 1, 'Saved attachment metadata in ticket');
    
    const att = uploadData.ticket.attachments[0];
    uploadedFileId = att.fileId;
    downloadToken = att.downloadToken;
    const uploadTicketId = uploadData.ticketId;

    // Test secure download: unauthorized access without token
    const resNoToken = await fetch(`${BASE_URL}/api/tickets/attachments/${uploadTicketId}/${uploadedFileId}`);
    assert(resNoToken.status === 403, 'Denies unauthorized attachment download without token (403 Forbidden)');

    // Test secure download: authorized access WITH valid token
    const resWithToken = await fetch(`${BASE_URL}/api/tickets/attachments/${uploadTicketId}/${uploadedFileId}?token=${downloadToken}`);
    assert(resWithToken.status === 200, 'Allows attachment download with valid security token (200 OK)');
    assert(resWithToken.headers.get('content-type') === 'image/png', 'Download returns correct image/png Content-Type');

    // Test secure download: authorized access WITH Admin JWT
    const resWithAdminJwt = await fetch(`${BASE_URL}/api/tickets/attachments/${uploadTicketId}/${uploadedFileId}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(resWithAdminJwt.status === 200, 'Allows admin attachment download via Bearer token (200 OK)');

    // Clean up temporary test files
    try {
      fs.unlinkSync(validPngPath);
      fs.unlinkSync(fakePngPath);
      fs.rmdirSync(testDir);
    } catch (e) {}
  }

  console.log('\n--- SUITE 4: SECURE PAYMENT WORKFLOW & UTR PROTECTION (TASK 3 & 4) ---');
  const uniqueUtr = '4' + Math.floor(10000000000 + Math.random() * 90000000000); // 12-digit valid format
  let submittedPaymentId = null;
  {
    // 1. Rejection of fake UTR pattern (all same digits or sequential)
    const resFakeUtr = await fetch(`${BASE_URL}/api/payments/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        paymentType: 'release',
        targetId: 'rel_test_1',
        releaseTitle: 'Summer Hit',
        amount: 100,
        utr: '111111111111',
        upiApp: 'PhonePe'
      })
    });
    assert(resFakeUtr.status === 400, 'Rejects fake/repeating UTR pattern (400 Bad Request)');

    // 2. Unauthenticated payment submission rejected
    const resUnauth = await fetch(`${BASE_URL}/api/payments/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentType: 'release',
        amount: 100,
        utr: uniqueUtr
      })
    });
    assert(resUnauth.status === 401, 'Rejects unauthenticated payment submission (401 Unauthorized)');

    // 3. Valid payment submission
    const resValidPay = await fetch(`${BASE_URL}/api/payments/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        paymentType: 'release',
        targetId: 'rel_test_single',
        releaseTitle: 'Himalayan Nights',
        amount: 100,
        utr: uniqueUtr,
        upiApp: 'Google Pay'
      })
    });
    assert(resValidPay.status === 201, 'Submits valid payment successfully (201 Created)');
    const payData = await resValidPay.json();
    assert(payData.payment.status === 'pending_verification', 'New payment status is strictly "pending_verification"');
    assert(payData.payment.userEmail === 'testartist@example.com', 'Identity strictly derived from auth token, not forged payload');
    submittedPaymentId = payData.payment.paymentId || payData.payment._id;

    // 4. DUPLICATE UTR PREVENTION: Try submitting the same UTR a second time
    const resDup = await fetch(`${BASE_URL}/api/payments/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        paymentType: 'release',
        targetId: 'rel_another_release',
        releaseTitle: 'Another Release',
        amount: 100,
        utr: uniqueUtr, // Identical UTR!
        upiApp: 'PhonePe'
      })
    });
    assert(resDup.status === 409, 'Rejects duplicate UTR with 409 Conflict');

    // 5. Admin verification: Non-admin rejected with 403
    const resUserVerify = await fetch(`${BASE_URL}/api/payments/verify-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}` // Regular artist token
      },
      body: JSON.stringify({
        paymentId: submittedPaymentId,
        action: 'verified'
      })
    });
    assert(resUserVerify.status === 403, 'Non-admin forbidden from verifying payment (403 Forbidden)');

    // 6. Admin verification: Authorized Admin can verify
    const resAdminVerify = await fetch(`${BASE_URL}/api/payments/verify-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}` // Admin token
      },
      body: JSON.stringify({
        paymentId: submittedPaymentId,
        action: 'verified',
        reasonNotes: 'UTR matched in bank statement credit log.'
      })
    });
    assert(resAdminVerify.status === 200, 'Authorized admin verifies payment successfully (200 OK)');
    const verifiedData = await resAdminVerify.json();
    assert(verifiedData.payment.status === 'verified', 'Payment status updated to "verified"');
    assert(verifiedData.payment.auditLog.length >= 2, 'Audit log records submission and admin verification trail');
  }

  console.log('\n--- SUITE 5: PAYMENT GATEWAY WEBHOOK VERIFICATION (TASK 3 & 4) ---');
  {
    // Test Webhook without signature header -> 401
    const resNoSig = await fetch(`${BASE_URL}/api/payments/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'payment.captured' })
    });
    assert(resNoSig.status === 401, 'Rejects webhook with missing signature header (401)');

    // Test Webhook with forged/invalid signature -> 401
    const resBadSig = await fetch(`${BASE_URL}/api/payments/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-signature': 'forged_fake_signature_hash'
      },
      body: JSON.stringify({ event: 'payment.captured' })
    });
    assert(resBadSig.status === 401, 'Rejects webhook with forged HMAC signature (401)');

    // Test Webhook with authentic HMAC-SHA256 signature
    const webhookPayload = JSON.stringify({
      order_id: submittedPaymentId,
      payment_id: 'cf_pay_' + Date.now(),
      status: 'SUCCESS',
      amount: 100
    });
    const validSignature = crypto
      .createHmac('sha256', process.env.PAYMENT_WEBHOOK_SECRET)
      .update(webhookPayload)
      .digest('hex');

    const resGoodWebhook = await fetch(`${BASE_URL}/api/payments/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-signature': validSignature
      },
      body: webhookPayload
    });
    assert(resGoodWebhook.status === 200, 'Accepts cryptographically verified webhook (200 OK)');
  }

  console.log('\n--- SUITE 6: SECURED NOTIFICATION ENDPOINTS (TASK 4) ---');
  {
    // Test /api/notify-payment-result: verify that unauthenticated calls are REJECTED!
    const resNotifyUnauth = await fetch(`${BASE_URL}/api/notify-payment-result`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userEmail: 'victim@example.com',
        status: 'verified',
        amount: 100,
        utr: '123456789012'
      })
    });
    assert(resNotifyUnauth.status === 401 || resNotifyUnauth.status === 403, 'Unauthenticated calls to /api/notify-payment-result are blocked (401/403)');

    // Test /api/notify-payment-result: non-admin call is REJECTED
    const resNotifyArtist = await fetch(`${BASE_URL}/api/notify-payment-result`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        userEmail: 'victim@example.com',
        status: 'verified',
        amount: 100,
        utr: '123456789012'
      })
    });
    assert(resNotifyArtist.status === 403, 'Regular users cannot forge /api/notify-payment-result (403 Forbidden)');
  }

  console.log('\n========================================================');
  console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
  console.log('========================================================\n');
  process.exit(0);
}

runTests().catch(err => {
  console.error('\n❌ Test suite failed with error:', err);
  process.exit(1);
});
