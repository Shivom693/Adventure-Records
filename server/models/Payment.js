import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  performedBy: { type: String, required: true },
  timestamp: { type: String, default: () => new Date().toISOString() },
  ip: { type: String, default: '' },
  notes: { type: String, default: '' }
}, { _id: false });

const paymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  userEmail: { type: String, required: true },
  paymentType: { type: String, enum: ['release', 'subscription'], default: 'release' },
  targetId: { type: String, default: null },
  releaseTitle: { type: String, default: '' },
  planName: { type: String, default: '' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  merchantUpiId: { type: String, default: '9691546208-3@ybl' },
  merchantName: { type: String, default: 'Adventure Records' },
  utr: { type: String, required: true, unique: true, index: true },
  upiApp: { type: String, default: 'UPI App' },
  screenshotUrl: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['pending_verification', 'verified', 'rejected', 'refunded'], 
    default: 'pending_verification' 
  },
  providerTransactionId: { type: String, default: null },
  verifiedAt: { type: String, default: null },
  verifiedBy: { type: String, default: null },
  rejectedReason: { type: String, default: null },
  auditLog: [auditLogSchema]
}, { timestamps: true });

export default mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
