import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  performedBy: { type: String, required: true },
  timestamp: { type: String, default: () => new Date().toISOString() },
  ip: { type: String, default: '' },
  notes: { type: String, default: '' }
}, { _id: false });

const paymentSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true, index: true },
  gatewayPaymentId: { type: String, default: null, index: true },
  paymentGateway: { type: String, default: 'RAZORPAY' },
  userId: { type: String, required: true, index: true },
  userEmail: { type: String, required: true, index: true },
  customerName: { type: String, default: '' },
  paymentType: { type: String, enum: ['release', 'subscription'], default: 'release' },
  targetId: { type: String, default: null, index: true },
  releaseTitle: { type: String, default: '' },
  planName: { type: String, default: '' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  merchantUpiId: { type: String, default: '9691546208-3@ybl' },
  merchantName: { type: String, default: 'Adventure Records' },
  paymentMethod: { type: String, default: 'UPI' },
  upiApp: { type: String, default: 'UPI' },
  status: { 
    type: String, 
    enum: ['CREATED', 'PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'verified', 'pending_verification', 'rejected'], 
    default: 'CREATED',
    index: true
  },
  signature: { type: String, default: null },
  verifiedAt: { type: String, default: null },
  verifiedBy: { type: String, default: null },
  failureReason: { type: String, default: null },
  auditLog: [auditLogSchema]
}, { timestamps: true });

export default mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
