import { API_URL } from '../config';
import { auth } from '../firebase';
import { AI_CONFIG } from '../config/aiConfig';

/**
 * Resolves prompt using client knowledge engine when backend AI endpoint is unreachable
 */
const resolveClientKnowledge = (promptText) => {
  const q = promptText.toLowerCase().trim();

  if (q.includes('single') && (q.includes('cost') || q.includes('price') || q.includes('rate') || q.includes('how much') || q.includes('fee'))) {
    return AI_CONFIG.KNOWLEDGE_BASE.PRICING.SINGLE;
  }
  if (q.includes('ep') && (q.includes('cost') || q.includes('price') || q.includes('rate') || q.includes('how much') || q.includes('fee'))) {
    return AI_CONFIG.KNOWLEDGE_BASE.PRICING.EP;
  }
  if (q.includes('album') && (q.includes('cost') || q.includes('price') || q.includes('rate') || q.includes('how much') || q.includes('fee'))) {
    return AI_CONFIG.KNOWLEDGE_BASE.PRICING.ALBUM;
  }
  if (q.includes('pricing') || q.includes('plan') || q.includes('package') || q.includes('charge') || q.includes('cost')) {
    return AI_CONFIG.KNOWLEDGE_BASE.PRICING.OVERVIEW;
  }
  if (q.includes('payment') || q.includes('upi') || q.includes('pay') || q.includes('merchant') || q.includes('utr')) {
    return AI_CONFIG.KNOWLEDGE_BASE.PAYMENT;
  }
  if (q.includes('isrc') || q.includes('upc') || q.includes('barcode') || q.includes('ean')) {
    return AI_CONFIG.KNOWLEDGE_BASE.ISRC_UPC;
  }
  if (q.includes('image') || q.includes('artwork') || q.includes('picture') || q.includes('photo') || q.includes('cover art')) {
    if (q.includes('copyright') || q.includes('rule') || q.includes('legal') || q.includes('google') || q.includes('allowed')) {
      return AI_CONFIG.KNOWLEDGE_BASE.IMAGE_COPYRIGHT;
    }
    return AI_CONFIG.KNOWLEDGE_BASE.TECHNICAL_SPECS;
  }
  if (q.includes('royalty') || q.includes('royalties') || q.includes('percent') || q.includes('share') || q.includes('cut') || q.includes('earnings')) {
    return AI_CONFIG.KNOWLEDGE_BASE.ROYALTIES;
  }
  if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q === 'help') {
    return "Hello! I am the Adventure Records AI Assistant. How can I help you with your music distribution, pricing (Single ₹100 / EP ₹500 / Album ₹1,000), metadata, or release status today?";
  }

  return "Adventure Records distributes your music to Spotify, Apple Music, YouTube Music, Instagram, TikTok, and 150+ stores. Pricing is ₹100 for Singles, ₹500 for EPs, and ₹1,000 for Albums with 100% royalty retention. How else can I assist you with your release?";
};

/**
 * Executes secure AI query request with full error handling, network check, timeout, and fallback
 */
export const queryAiAssistant = async ({ message, history }) => {
  // 1. Check Offline Status
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      success: false,
      errorType: 'OFFLINE',
      message: 'No internet connection. Please check your network connection and try again.',
      canRetry: true
    };
  }

  const trimmed = (message || '').trim();
  if (!trimmed) {
    return {
      success: false,
      errorType: 'INVALID_INPUT',
      message: 'Please enter a valid question or message.',
      canRetry: false
    };
  }

  // 2. Setup Request Abort Timeout (15 seconds)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.REQUEST_TIMEOUT_MS);

  try {
    // 3. Get Auth Token if user is logged in
    let idToken = null;
    if (auth && auth.currentUser) {
      try {
        idToken = await auth.currentUser.getIdToken(false);
      } catch (authErr) {
        console.warn('[AI Service] Auth token retrieval skipped:', authErr.message);
      }
    }

    const headers = { 'Content-Type': 'application/json' };
    if (idToken) {
      headers['Authorization'] = `Bearer ${idToken}`;
    }

    // 4. Send API query request
    const response = await fetch(`${API_URL}/api/chatbot/query`, {
      method: 'POST',
      headers,
      signal: controller.signal,
      body: JSON.stringify({
        message: trimmed,
        history: (history || []).map(m => ({ role: m.role, content: m.text }))
      })
    });

    clearTimeout(timeoutId);

    // 5. Handle Status Codes
    if (response.ok) {
      const data = await response.json();
      if (data && data.reply) {
        return {
          success: true,
          reply: data.reply
        };
      }
    }

    if (response.status === 429) {
      return {
        success: false,
        errorType: 'RATE_LIMIT',
        message: 'AI service is temporarily busy. Please wait a moment and try again.',
        canRetry: true
      };
    }

    if (response.status === 400) {
      return {
        success: false,
        errorType: 'BAD_REQUEST',
        message: 'Your message could not be processed. Please try rephrasing your question.',
        canRetry: true
      };
    }

    // If server error or unconfigured backend endpoint, fallback to client knowledge engine
    const fallbackAnswer = resolveClientKnowledge(trimmed);
    return {
      success: true,
      reply: fallbackAnswer
    };

  } catch (err) {
    clearTimeout(timeoutId);

    // Check if error was caused by AbortController timeout
    if (err.name === 'AbortError') {
      // Return client knowledge fallback on timeout so user is never stranded!
      const fallbackAnswer = resolveClientKnowledge(trimmed);
      return {
        success: true,
        reply: fallbackAnswer
      };
    }

    console.warn('[AI Service] Request exception caught, activating client knowledge fallback:', err.message);

    // Return client knowledge resolution on network/CORS exception
    const fallbackAnswer = resolveClientKnowledge(trimmed);
    return {
      success: true,
      reply: fallbackAnswer
    };
  }
};
