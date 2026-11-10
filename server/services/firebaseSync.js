import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db as localDb } from '../db/dbFallback.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let adminDb = null;
let isFirebaseAdminInitialized = false;

// Attempt Firebase Admin SDK Initialization
try {
  if (getApps().length === 0) {
    const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
    const serviceAccountFile = path.join(__dirname, '..', 'serviceAccountKey.json');
    let credential = null;

    if (serviceAccountEnv) {
      if (serviceAccountEnv.trim().startsWith('{')) {
        credential = cert(JSON.parse(serviceAccountEnv));
      } else if (fs.existsSync(serviceAccountEnv)) {
        credential = cert(JSON.parse(fs.readFileSync(serviceAccountEnv, 'utf8')));
      }
    } else if (fs.existsSync(serviceAccountFile)) {
      credential = cert(JSON.parse(fs.readFileSync(serviceAccountFile, 'utf8')));
    }

    if (credential) {
      const app = initializeApp({
        credential,
        projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'music-b2696'
      });
      adminDb = getFirestore(app);
      isFirebaseAdminInitialized = true;
      console.log('🔥 [FIREBASE ADMIN] Initialized with Service Account');
    } else {
      console.log('ℹ️ [FIREBASE ADMIN] Running in local-sync mode. (Set FIREBASE_SERVICE_ACCOUNT or place serviceAccountKey.json in server/ to enable direct Admin Firestore writes)');
    }
  } else {
    adminDb = getFirestore();
    isFirebaseAdminInitialized = true;
  }
} catch (err) {
  console.warn('⚠️ [FIREBASE ADMIN INIT NOTICE]:', err.message);
}

/**
 * Sync Payment Status update to Firestore and Local Database
 */
export async function syncPaymentSuccess({
  orderId,
  gatewayPaymentId,
  bankReference,
  amount,
  paymentMethod = 'UPI',
  verifiedBy = 'CASHFREE_WEBHOOK_VERIFIED'
}) {
  const completionTimestamp = new Date().toISOString();

  // 1. Update Local Database
  let localPayment = await localDb.payments.findOne({ orderId });
  if (localPayment) {
    await localDb.payments.findByIdAndUpdate(localPayment._id || localPayment.id, {
      status: 'SUCCESS',
      gatewayPaymentId: gatewayPaymentId || localPayment.gatewayPaymentId,
      bankReference: bankReference || localPayment.bankReference,
      paymentMethod,
      verifiedAt: completionTimestamp,
      verifiedBy,
      completedAt: completionTimestamp,
      updatedAt: completionTimestamp,
      auditLog: [
        ...(localPayment.auditLog || []),
        {
          action: 'payment_verified_success',
          performedBy: verifiedBy,
          timestamp: completionTimestamp,
          notes: `Verified ₹${amount} via ${paymentMethod} (${gatewayPaymentId || bankReference || ''})`
        }
      ]
    });

    // Unlock release in local DB if targetId exists
    if (localPayment.paymentType === 'release' && localPayment.targetId) {
      try {
        await localDb.releases.findByIdAndUpdate(localPayment.targetId, {
          paymentStatus: 'paid',
          uploadUnlocked: true,
          updatedAt: completionTimestamp
        });
        console.log(`🔓 [LOCAL DB] Release ${localPayment.targetId} unlocked!`);
      } catch (e) {
        console.warn('Local release update error:', e.message);
      }
    }
  }

  // 2. Update Firestore if Firebase Admin is initialized
  if (isFirebaseAdminInitialized && adminDb) {
    try {
      // Find matching payment doc by orderId
      const paymentsRef = adminDb.collection('payments');
      const qSnap = await paymentsRef.where('orderId', '==', orderId).get();

      if (!qSnap.empty) {
        for (const docSnap of qSnap.docs) {
          const docData = docSnap.data();
          await docSnap.ref.update({
            status: 'SUCCESS',
            gatewayPaymentId: gatewayPaymentId || docData.gatewayPaymentId,
            bankReference: bankReference || docData.bankReference || null,
            paymentMethod,
            verifiedAt: completionTimestamp,
            verifiedBy,
            completedAt: completionTimestamp,
            updatedAt: completionTimestamp
          });

          // Unlock associated release if present
          if (docData.targetId && docData.paymentType === 'release') {
            try {
              await adminDb.collection('releases').doc(docData.targetId).update({
                paymentStatus: 'paid',
                uploadUnlocked: true,
                updatedAt: completionTimestamp
              });
              console.log(`🔓 [FIRESTORE ADMIN] Release ${docData.targetId} unlocked in Firestore!`);
            } catch (relErr) {
              console.warn('Firestore release unlock notice:', relErr.message);
            }
          }
        }
        console.log(`✅ [FIRESTORE ADMIN] Payment order ${orderId} updated to SUCCESS.`);
      }
    } catch (fsErr) {
      console.warn('⚠️ [FIRESTORE ADMIN SYNC ERROR]:', fsErr.message);
    }
  }

  return {
    success: true,
    orderId,
    gatewayPaymentId,
    status: 'SUCCESS',
    completedAt: completionTimestamp
  };
}

/**
 * Record a payment order in Firestore and Local Database
 */
export async function syncOrderCreated(orderRecord) {
  // 1. Save in local database
  await localDb.payments.create(orderRecord);

  // 2. Save in Firestore if Firebase Admin is initialized
  if (isFirebaseAdminInitialized && adminDb) {
    try {
      await adminDb.collection('payments').add(orderRecord);
      console.log(`🔥 [FIRESTORE ADMIN] Payment order ${orderRecord.orderId} synced.`);
    } catch (err) {
      console.warn('⚠️ [FIRESTORE ADMIN ORDER SYNC NOTICE]:', err.message);
    }
  }

  return orderRecord;
}
