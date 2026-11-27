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
  verifiedBy = 'CASHFREE_WEBHOOK_VERIFIED',
  targetId,
  paymentType = 'release',
  userId,
  userEmail,
  customerName = '',
  releaseTitle = '',
  verifiedAt
}) {
  const completionTimestamp = verifiedAt || new Date().toISOString();

  // 1. Update Local Database (or create record if backend restarted before verification)
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
          notes: `Verified ₹${amount ?? localPayment.amount ?? 0} via ${paymentMethod} (${gatewayPaymentId || bankReference || ''})`
        }
      ]
    });

    const resolvedTargetId = localPayment.targetId || targetId;
    const resolvedType = localPayment.paymentType || paymentType;
    if (resolvedType === 'release' && resolvedTargetId) {
      try {
        await localDb.releases.findByIdAndUpdate(resolvedTargetId, {
          paymentStatus: 'paid',
          uploadUnlocked: true,
          updatedAt: completionTimestamp
        });
        console.log(`🔓 [LOCAL DB] Release ${resolvedTargetId} unlocked!`);
      } catch (e) {
        console.warn('Local release update error:', e.message);
      }
    }
  } else {
    await localDb.payments.create({
      orderId,
      gatewayPaymentId: gatewayPaymentId || null,
      bankReference: bankReference || null,
      paymentGateway: paymentMethod === 'RAZORPAY' ? 'RAZORPAY' : 'CASHFREE',
      userId: userId ? String(userId) : 'guest',
      userEmail: userEmail || '',
      customerName,
      paymentType,
      targetId: targetId || null,
      releaseTitle,
      amount: amount ?? 0,
      currency: 'INR',
      paymentMethod,
      status: 'SUCCESS',
      verifiedAt: completionTimestamp,
      verifiedBy,
      completedAt: completionTimestamp,
      createdAt: completionTimestamp,
      updatedAt: completionTimestamp,
      auditLog: [
        {
          action: 'payment_verified_success',
          performedBy: verifiedBy,
          timestamp: completionTimestamp,
          notes: `Verified ₹${amount ?? 0} via ${paymentMethod} (${gatewayPaymentId || bankReference || ''})`
        }
      ]
    });
  }

  // 2. Update Firestore if Firebase Admin is initialized
  if (isFirebaseAdminInitialized && adminDb) {
    try {
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

          const resolvedTargetId = docData.targetId || targetId;
          const resolvedType = docData.paymentType || paymentType;
          if (resolvedTargetId && resolvedType === 'release') {
            try {
              await adminDb.collection('releases').doc(resolvedTargetId).update({
                paymentStatus: 'paid',
                uploadUnlocked: true,
                updatedAt: completionTimestamp
              });
              console.log(`🔓 [FIRESTORE ADMIN] Release ${resolvedTargetId} unlocked in Firestore!`);
            } catch (relErr) {
              console.warn('Firestore release unlock notice:', relErr.message);
            }
          }
        }
        console.log(`✅ [FIRESTORE ADMIN] Payment order ${orderId} updated to SUCCESS.`);
      } else if (userId || userEmail) {
        await paymentsRef.add({
          orderId,
          gatewayPaymentId: gatewayPaymentId || null,
          bankReference: bankReference || null,
          paymentGateway: paymentMethod === 'RAZORPAY' ? 'RAZORPAY' : 'CASHFREE',
          userId: userId ? String(userId) : 'guest',
          userEmail: userEmail || '',
          customerName,
          paymentType,
          targetId: targetId || null,
          releaseTitle,
          amount: amount ?? 0,
          currency: 'INR',
          paymentMethod,
          status: 'SUCCESS',
          verifiedAt: completionTimestamp,
          verifiedBy,
          completedAt: completionTimestamp,
          createdAt: completionTimestamp,
          updatedAt: completionTimestamp
        });
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
