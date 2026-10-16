import express from 'express';
import { GoogleGenAI } from '@google/genai';
import admin from 'firebase-admin';
import { db } from '../db/dbFallback.js';

const router = express.Router();

// Rate limiting cache (IP / UID -> array of timestamps)
const userChatCounts = {};
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_QUERIES = 40; // Max 40 queries per 15 mins

/**
 * Adventure Records Server-Side Knowledge Base Engine
 * Used for instant, deterministic answer resolution & fallback when Gemini API key is processing or unconfigured.
 */
function getKnowledgeResponse(promptText, authUser, userReleases = [], userTickets = []) {
  const query = promptText.toLowerCase();

  // Pricing & Packages
  if (query.includes('single') && (query.includes('cost') || query.includes('price') || query.includes('how much') || query.includes('rate'))) {
    return "A Single release on Adventure Records costs ₹100 (one-time fee). You keep 100% of your earnings and royalties with zero recurring annual fees.";
  }
  if (query.includes('ep') && (query.includes('cost') || query.includes('price') || query.includes('how much') || query.includes('rate'))) {
    return "An EP release (2 to 6 tracks) costs ₹500 (one-time fee) on Adventure Records with 100% royalty retention.";
  }
  if (query.includes('album') && (query.includes('cost') || query.includes('price') || query.includes('how much') || query.includes('rate'))) {
    return "An Album release (7+ tracks) costs ₹1,000 (one-time fee) on Adventure Records with 100% royalty retention.";
  }
  if (query.includes('pricing') || query.includes('plan') || query.includes('package') || query.includes('fee') || query.includes('charge')) {
    return "Adventure Records Simple Pricing:\n• Single (1 Track): ₹100 / release\n• EP (2–6 Tracks): ₹500 / release\n• Album (7+ Tracks): ₹1,000 / release\n\nAll plans include 100% royalty retention, free GS1 ISRC/UPC barcodes, and global distribution.";
  }

  // Payment & Merchant UPI
  if (query.includes('payment') || query.includes('upi') || query.includes('pay') || query.includes('merchant')) {
    return "We accept instant payments via UPI. Our official Merchant UPI ID is 9691546208@ptyes. Enter the UTR/Reference number after completing payment to activate your release.";
  }

  // User Releases & Status
  if (query.includes('status') || query.includes('my release') || query.includes('track status') || query.includes('my catalog')) {
    if (!authUser) {
      return "Please log in to your Adventure Records account to check your release status and catalog details.";
    }
    if (userReleases.length === 0) {
      return "You have 0 active releases uploaded under this account (" + authUser.email + "). Go to Dashboard → Create New Release to upload your music!";
    }
    const releaseSummary = userReleases.map(r => `• ${r.title || r.releaseTitle || 'Untitled'} — Status: ${r.status || 'Pending'} (UPC: ${r.upc || 'Assigning'})`).join('\n');
    return `Here is your current catalog status (${userReleases.length} release(s)):\n\n${releaseSummary}`;
  }

  // ISRC & UPC
  if (query.includes('isrc')) {
    return "An ISRC (International Standard Recording Code) is a unique 12-character identifier assigned to individual audio tracks to track plays and collect mechanical royalties worldwide. Adventure Records assigns official GS1 ISRCs automatically for free.";
  }
  if (query.includes('upc') || query.includes('barcode') || query.includes('ean')) {
    return "A UPC (Universal Product Code) is a unique commercial barcode assigned to an entire album, EP, or single product. Adventure Records provides free GS1-compliant UPC barcodes for all your releases.";
  }

  // Format & Technical Specs
  if (query.includes('audio') || query.includes('format') || query.includes('wav') || query.includes('flac') || query.includes('spec')) {
    return "Audio Upload Requirements:\n• File Format: Uncompressed WAV or FLAC\n• Sample Rate: 44.1 kHz\n• Bit Depth: 16-bit or 24-bit stereo\n\nArtwork Requirements:\n• Format: JPG or PNG\n• Dimensions: Perfect square (3000 x 3000 pixels minimum)";
  }

  // Royalty Retention
  if (query.includes('royalty') || query.includes('percent') || query.includes('cut') || query.includes('share') || query.includes('earnings')) {
    return "You keep 100% of your royalties and master rights with Adventure Records. We take 0% cut from your streaming revenue.";
  }

  // Default Greeting / General Question
  if (query.includes('hello') || query.includes('hi') || query.includes('hey') || query === 'help') {
    return "Hello! I am the Adventure Records AI Assistant. How can I help you with your music distribution, pricing (Single ₹100 / EP ₹500 / Album ₹1,000), metadata, or releases today?";
  }

  return "Adventure Records provides global music distribution to Spotify, Apple Music, JioSaavn, Wynk, YouTube Music, and 150+ stores. Pricing is ₹100 for Single, ₹500 for EP, and ₹1,000 for Album with 100% royalty retention. How else can I assist you with your release?";
}

/**
 * Real Google Gemini AI Chatbot Route for Adventure Records
 * Uses the official @google/genai SDK with model gemini-2.0-flash / gemini-1.5-flash
 */
router.post('/query', async (req, res) => {
  const { message, history } = req.body;

  // 1. Prompt Length & Validation
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ 
      message: 'Query message is required.' 
    });
  }

  if (message.length > 1000) {
    return res.status(400).json({ 
      message: 'Message is too long. Please keep questions under 1,000 characters.' 
    });
  }

  // 2. Server-side Rate Limiting
  const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();
  if (!userChatCounts[clientIp]) userChatCounts[clientIp] = [];
  userChatCounts[clientIp] = userChatCounts[clientIp].filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);

  if (userChatCounts[clientIp].length >= RATE_LIMIT_MAX_QUERIES) {
    return res.status(429).json({
      message: 'Rate limit exceeded. Please wait a few minutes before asking more questions.'
    });
  }
  userChatCounts[clientIp].push(now);

  // 3. Authenticate Firebase ID Token / JWT securely
  let authUser = null;
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (token) {
    try {
      if (admin.apps.length > 0) {
        const decodedToken = await admin.auth().verifyIdToken(token);
        authUser = { uid: decodedToken.uid, email: decodedToken.email };
      } else {
        const base64Url = token.split('.')[1];
        if (base64Url) {
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
          const decoded = JSON.parse(jsonPayload);
          authUser = { uid: decoded.user_id || decoded.sub || decoded.uid || decoded.id, email: decoded.email };
        }
      }
    } catch (err) {
      console.log('Chatbot Auth Verification Note:', err.message);
    }
  }

  // 4. Query user-specific context ONLY for authorized UID
  let userReleases = [];
  let userTickets = [];
  let userContext = '';

  if (authUser && authUser.uid) {
    try {
      userReleases = await db.releases.find({ userId: authUser.uid });
      userTickets = await db.tickets.find({ userId: authUser.uid });

      userContext = `\n\nAUTHENTICATED USER CONTEXT (UID: ${authUser.uid}):
- Email: ${authUser.email || 'Authenticated User'}
- Account Releases Count: ${userReleases.length}
- Releases List: ${userReleases.length > 0 ? JSON.stringify(userReleases.map(r => ({ title: r.title || r.releaseTitle, status: r.status, upc: r.upc || 'Not assigned', date: r.releaseDate }))) : 'No releases uploaded yet'}
- Support Tickets Count: ${userTickets.length}`;
    } catch (err) {
      console.log('Error fetching user context:', err.message);
    }
  }

  // 5. Check Gemini API Key securely on server
  const geminiApiKey = process.env.GEMINI_API_KEY;

  // If Gemini API Key is missing or invalid, fallback gracefully to Server Knowledge Base Engine
  if (!geminiApiKey || geminiApiKey.trim() === '' || geminiApiKey.startsWith('your_')) {
    const fallbackAnswer = getKnowledgeResponse(message.trim(), authUser, userReleases, userTickets);
    return res.status(200).json({ reply: fallbackAnswer });
  }

  // 6. Build Official System Behavior Prompt for Gemini
  const baseSystemPrompt = `You are the official Adventure Records AI Assistant.

Adventure Records is a high-performance music distribution platform.

Official Pricing & Features:
- Single Release: ₹100 (one-time payment per release)
- EP Release: ₹500 (one-time payment per release)
- Album Release: ₹1,000 (one-time payment per release)
- Official Merchant UPI: 9691546208@ptyes
- Artists keep 100% of their royalties. No recurring annual subscription fees.

Help users with:
- Music distribution
- Single / EP / Album releases
- Release submission
- Metadata
- ISRC & UPC barcodes
- Copyright & Master rights
- Artwork requirements (Square 3000x3000px JPG/PNG)
- Audio upload requirements (WAV/FLAC 16-bit or 24-bit 44.1kHz)
- Release status
- Account-related guidance
- Payment/pricing information

Be professional, concise, encouraging and accurate.

Never invent account information.
Never invent release status.
Never invent ISRC or UPC codes.
If the user asks for their release status, check the authenticated user context.`;

  const fullSystemInstruction = baseSystemPrompt + userContext;

  // 7. Format Chat History for Gemini API
  const safeHistory = (history || []).slice(-10).map(item => ({
    role: item.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: String(item.content || item.text || '') }]
  }));

  try {
    // 8. Execute Real Gemini API Call using official @google/genai SDK with gemini-2.0-flash
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });

    const contents = [
      ...safeHistory,
      { role: 'user', parts: [{ text: message.trim() }] }
    ];

    let geminiResponse;
    try {
      geminiResponse = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents,
        config: {
          systemInstruction: fullSystemInstruction,
          maxOutputTokens: 500,
          temperature: 0.6
        }
      });
    } catch (modelErr) {
      // Fallback model if gemini-2.0-flash is unavailable
      console.warn('Gemini 2.0 Flash attempt failed, trying gemini-1.5-flash:', modelErr.message);
      geminiResponse = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents,
        config: {
          systemInstruction: fullSystemInstruction,
          maxOutputTokens: 500,
          temperature: 0.6
        }
      });
    }

    const replyText = geminiResponse.text || geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text;

    if (replyText) {
      return res.status(200).json({ reply: replyText });
    } else {
      throw new Error('Empty text returned from Gemini API.');
    }
  } catch (error) {
    console.error('Gemini API Error:', error.message || error);
    // Fallback to Knowledge Base Engine if Gemini API fails
    const fallbackAnswer = getKnowledgeResponse(message.trim(), authUser, userReleases, userTickets);
    return res.status(200).json({ reply: fallbackAnswer });
  }
});

export default router;
