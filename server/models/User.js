import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional if using Firebase Google Sign-in
  role: { type: String, enum: ['Artist', 'Label', 'Admin'], default: 'Artist' },
  name: { type: String, default: '' },
  artistName: { type: String, default: '' },
  phone: { type: String, default: '' },
  streams: { type: Number, default: 0 },
  listeners: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  totalRoyalties: { type: Number, default: 0 },
  verificationStatus: { type: String, enum: ['None', 'Pending', 'Verified'], default: 'None' },
  legalName: { type: String, default: '' },
  idFilePath: { type: String, default: '' },
  isActive: { type: Boolean, default: false },
  otpCode: { type: String, default: null },
  twoFactorEnabled: { type: Boolean, default: false },
  loginHistory: [
    {
      ip: String,
      userAgent: String,
      timestamp: { type: Date, default: Date.now }
    }
  ],
  payouts: [
    {
      amount: Number,
      date: { type: Date, default: Date.now },
      status: { type: String, default: 'Pending' } // Pending, Paid
    }
  ]
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);
