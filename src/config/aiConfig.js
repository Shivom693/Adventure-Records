/**
 * Adventure Records AI Centralized Configuration
 * Defines Gemini AI model settings, timeouts, system instructions, and deterministic knowledge rules.
 */

export const AI_CONFIG = {
  // Configured Gemini AI Models
  PRIMARY_MODEL: 'gemini-2.0-flash',
  FALLBACK_MODEL: 'gemini-1.5-flash',

  // Request & Retry Limits
  REQUEST_TIMEOUT_MS: 15000, // 15 Seconds timeout
  MAX_RETRY_ATTEMPTS: 3,

  // Platform Knowledge Base for Instant Fallback Resolution
  KNOWLEDGE_BASE: {
    PRICING: {
      SINGLE: 'A Single release (1 track) costs ₹100 (one-time fee) with 100% royalty retention and zero recurring annual fees.',
      EP: 'An EP release (2–6 tracks) costs ₹500 (one-time fee) with 100% royalty retention and zero recurring annual fees.',
      ALBUM: 'An Album release (7+ tracks) costs ₹1,000 (one-time fee) with 100% royalty retention and zero recurring annual fees.',
      OVERVIEW: 'Adventure Records Pricing:\n• Single (1 Track): ₹100\n• EP (2–6 Tracks): ₹500\n• Album (7+ Tracks): ₹1,000\nAll plans include 100% royalty retention, free standard ISRC/UPC barcodes, and global store distribution.'
    },
    PAYMENT: 'We accept payments via instant UPI. Payment UPI ID: 9691546208@ptyes. Submit your payment UTR proof after completing payment to activate your release.',
    ISRC_UPC: 'ISRC (International Standard Recording Code) identifies individual audio tracks, while UPC (Universal Product Code) identifies full releases (Singles, EPs, Albums). Adventure Records assigns standard ISRCs and UPCs for all your releases.',
    TECHNICAL_SPECS: 'Audio Specs: Uncompressed WAV or FLAC, 44.1 kHz, 16-bit or 24-bit stereo.\nArtwork Specs: Perfect square JPG or PNG, 3000 x 3000 pixels minimum, RGB color mode.',
    ROYALTIES: 'You retain 100% of your earned streaming royalties and master rights. Adventure Records takes 0% commission.',
    IMAGE_COPYRIGHT: 'Artwork Image Copyright Rules:\n• You must own full commercial distribution rights for your cover artwork (original photos, custom graphics, or licensed stock images).\n• Royalty-free stock images with commercial license are allowed.\n• Prohibited: Images downloaded from Google Images, celebrity photos without consent, store logos (Spotify/Apple logos), or trademarked brands.'
  }
};
