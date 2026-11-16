import mongoose from 'mongoose';

const trackSchema = new mongoose.Schema({
  title: { type: String, required: true },
  audioUrl: { type: String },
  audioDriveLink: { type: String },
  audioPath: { type: String },
  isrc: { type: String }
});

const releaseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artistName: { type: String, required: true },
  releaseDate: { type: String },
  upc: { type: String },
  coverArtUrl: { type: String },
  coverArtPath: { type: String },
  artworkUrl: { type: String },
  artworkDriveLink: { type: String },
  audioUrl: { type: String },
  audioDriveLink: { type: String },
  googleDriveLink: { type: String },
  status: { type: String, enum: ['Pending', 'Processing', 'Distributed', 'approved', 'rejected', 'changes_required', 'submitted'], default: 'Pending' },
  userId: { type: String, required: true },
  tracks: [trackSchema]
}, { timestamps: true });

export default mongoose.models.Release || mongoose.model('Release', releaseSchema);
