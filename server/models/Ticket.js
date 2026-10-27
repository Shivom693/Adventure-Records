import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  fileId: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  storagePath: { type: String, required: true },
  downloadToken: { type: String, required: true },
  uploadedAt: { type: String, default: () => new Date().toISOString() }
}, { _id: false });

const ticketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true, index: true },
  userId: { type: String, default: null },
  name: { type: String, required: true },
  email: { type: String, required: true, index: true },
  subject: { type: String, required: true },
  category: { type: String, default: 'General Support' },
  message: { type: String, required: true },
  releaseId: { type: String, default: null },
  status: { 
    type: String, 
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'], 
    default: 'Open' 
  },
  attachments: [attachmentSchema],
  emailDelivery: {
    adminSent: { type: Boolean, default: false },
    customerSent: { type: Boolean, default: false },
    lastAttempt: { type: String, default: null },
    error: { type: String, default: null }
  }
}, { timestamps: true });

export default mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);
