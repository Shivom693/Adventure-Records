/**
 * Fix Fake Payment Script
 * Finds all payments with fake/sequential UTRs in Firestore and rejects them.
 * Uses Firebase Admin SDK via Application Default Credentials (Firebase CLI login).
 * Run: node scripts/fix-fake-payment.mjs
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- Fake UTR Detector (mirrors production logic) ---
function detectFakeUtr(utr) {
  const u = (utr || '').trim();
  if (!/^\d{12}$/.test(u)) return { isFake: true, reason: 'Not 12 digits' };
  if (/^(\d)\1{11}$/.test(u)) return { isFake: true, reason: 'All same digits' };
  const seqAsc  = '01234567890123456789012345678901234567890';
  const seqDesc = '98765432109876543210987654321098765432109';
  if (seqAsc.includes(u) || seqDesc.includes(u)) return { isFake: true, reason: 'Sequential pattern' };
  const digits = u.split('').map(Number);
  let ascRun = 1, descRun = 1;
  for (let i = 1; i < digits.length; i++) {
    ascRun  = digits[i] === digits[i-1]+1 ? ascRun+1 : 1;
    descRun = digits[i] === digits[i-1]-1 ? descRun+1 : 1;
    if (ascRun >= 7 || descRun >= 7) return { isFake: true, reason: `Sequential run (asc:${ascRun} desc:${descRun})` };
  }
  if (/^(\d{2})\1{5}$/.test(u)||/^(\d{3})\1{3}$/.test(u)||/^(\d{6})\1$/.test(u)) return { isFake: true, reason: 'Repeating block' };
  const knownFakes = ['123456789987','123456789876','987654321012','123123123123','121212121212','112233445566','123456654321'];
  if (knownFakes.includes(u)) return { isFake: true, reason: 'Known dummy pattern' };
  if (digits[0] === 0) return { isFake: true, reason: 'Starts with 0' };
  for (let d = 0; d <= 9; d++) {
    const c = digits.filter(x => x === d).length;
    if (c >= 9) return { isFake: true, reason: `Digit ${d} x${c}` };
  }
  if (new Set(digits).size <= 2) return { isFake: true, reason: 'Low entropy' };
  const rev = u.split('').reverse().join('');
  if (u.slice(0,6) === rev.slice(0,6) || u.slice(6) === rev.slice(6)) return { isFake: true, reason: 'Palindrome/mirror pattern' };
  return { isFake: false, reason: '' };
}

// --- Init Firebase Admin using Application Default Credentials ---
let adminApp;
try {
  if (getApps().length === 0) {
    // Use application default credentials (firebase CLI login sets this up)
    adminApp = initializeApp({ projectId: 'music-b2696' });
  } else {
    adminApp = getApps()[0];
  }
} catch (e) {
  console.error('Firebase Admin init error:', e.message);
  process.exit(1);
}

const db = getFirestore(adminApp);
db.settings({ ignoreUndefinedProperties: true });

async function fixFakePayments() {
  console.log('\n🔍 Scanning Firestore payments collection for fake UTRs...\n');

  const snapshot = await db.collection('payments').get();

  if (snapshot.empty) {
    console.log('⚠️  No payments found in Firestore.');
    return;
  }

  let fixed = 0;
  let skipped = 0;

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const { utr, status, userEmail } = data;
    const check = detectFakeUtr(utr);

    if (check.isFake && status !== 'rejected') {
      console.log(`❌ FAKE UTR found: ${utr} (${userEmail}) — Reason: ${check.reason}`);
      console.log(`   Current status: ${status} → Resetting to: rejected`);

      const auditEntry = {
        action: 'auto_rejected_fake_utr',
        performedBy: 'SYSTEM_FRAUD_DETECTOR',
        timestamp: new Date().toISOString(),
        notes: `Automatic rejection: ${check.reason}. UTR failed fraud detection.`
      };

      const currentAudit = Array.isArray(data.auditLog) ? data.auditLog : [];

      await db.collection('payments').doc(docSnap.id).update({
        status: 'rejected',
        rejectedReason: `Fake UTR detected: ${check.reason}`,
        verifiedAt: null,
        verifiedBy: null,
        auditLog: [...currentAudit, auditEntry],
        updatedAt: new Date().toISOString()
      });

      // Also lock the release if it was unlocked
      if (data.paymentType === 'release' && data.targetId) {
        try {
          const relRef = db.collection('releases').doc(data.targetId);
          const relSnap = await relRef.get();
          if (relSnap.exists) {
            await relRef.update({
              paymentStatus: 'rejected',
              uploadUnlocked: false,
              updatedAt: new Date().toISOString()
            });
            console.log(`   🔒 Release ${data.targetId} re-locked.`);
          }
        } catch (e) {
          console.log(`   ⚠️  Could not lock release: ${e.message}`);
        }
      }

      console.log(`   ✅ Payment ${docSnap.id} rejected in Firestore.\n`);
      fixed++;
    } else if (check.isFake && status === 'rejected') {
      console.log(`⏭️  Already rejected: UTR ${utr} — skipping.`);
      skipped++;
    } else {
      console.log(`✅ Valid UTR: ${utr} (${userEmail}) — status: ${status}`);
    }
  }

  console.log(`\n========================================`);
  console.log(`✅ Done. Fixed: ${fixed} | Already rejected: ${skipped}`);
  console.log(`========================================\n`);
}

fixFakePayments().catch(err => {
  console.error('Script error:', err);
  process.exit(1);
});
