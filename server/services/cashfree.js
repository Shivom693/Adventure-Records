import crypto from 'crypto';

/**
 * Cashfree Payments Dynamic UPI QR Gateway Service
 * Adventure Records Payment Integration Module
 *
 * Implements:
 * - Dynamic UPI QR order creation
 * - Real Cashfree PG API communication (Sandbox & Production)
 * - Cryptographic webhook signature verification (HMAC-SHA256)
 * - Server-side transaction verification via Cashfree Payments API
 */

export const getCashfreeConfig = () => {
  const env = (process.env.CASHFREE_ENVIRONMENT || 'TEST').toUpperCase();
  const isProd = env === 'PROD' || env === 'PRODUCTION';
  const baseUrl = isProd ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';
  const appId = process.env.CASHFREE_APP_ID || '';
  const secretKey = process.env.CASHFREE_SECRET_KEY || '';
  const apiVersion = process.env.CASHFREE_API_VERSION || '2023-08-01';
  const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || secretKey;

  const isConfigured = Boolean(
    appId && 
    secretKey && 
    !appId.includes('your_') && 
    !secretKey.includes('your_')
  );

  return {
    env,
    isProd,
    baseUrl,
    appId,
    secretKey,
    apiVersion,
    webhookSecret,
    isConfigured
  };
};

/**
 * 1. Create Order on Cashfree
 */
export async function createCashfreeOrder({
  orderId,
  amount,
  currency = 'INR',
  customerId,
  customerName = 'Artist',
  customerEmail,
  customerPhone = '9999999999',
  orderNote = 'Adventure Records - Music Distribution',
  notifyUrl
}) {
  const config = getCashfreeConfig();

  if (!config.isConfigured) {
    return {
      success: false,
      isConfigured: false,
      error: 'Cashfree credentials not configured. Please set CASHFREE_APP_ID and CASHFREE_SECRET_KEY in server/.env'
    };
  }

  // Sanitize customer phone (Cashfree requires 10 digits)
  let cleanPhone = String(customerPhone).replace(/\D/g, '');
  if (cleanPhone.length > 10) cleanPhone = cleanPhone.slice(-10);
  if (cleanPhone.length < 10) cleanPhone = '9999999999';

  const orderPayload = {
    order_id: orderId,
    order_amount: Number(Number(amount).toFixed(2)),
    order_currency: currency,
    customer_details: {
      customer_id: String(customerId).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50),
      customer_name: customerName.slice(0, 100) || 'Artist',
      customer_email: customerEmail,
      customer_phone: cleanPhone
    },
    order_meta: {
      notify_url: notifyUrl || undefined,
      payment_methods: 'upi'
    },
    order_note: orderNote.slice(0, 200)
  };

  try {
    const res = await fetch(`${config.baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'x-client-id': config.appId,
        'x-client-secret': config.secretKey,
        'x-api-version': config.apiVersion,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderPayload)
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('❌ [CASHFREE CREATE ORDER FAILED]:', data);
      return {
        success: false,
        error: data.message || 'Cashfree order creation failed.',
        details: data
      };
    }

    return {
      success: true,
      orderId: data.order_id,
      paymentSessionId: data.payment_session_id,
      orderStatus: data.order_status,
      orderAmount: data.order_amount,
      raw: data
    };
  } catch (err) {
    console.error('❌ [CASHFREE HTTP ERROR]:', err.message);
    return {
      success: false,
      error: `Failed to connect to Cashfree: ${err.message}`
    };
  }
}

/**
 * 2. Generate Dynamic UPI QR for Cashfree Order
 */
export async function generateCashfreeUPIQR(orderId, paymentSessionId) {
  const config = getCashfreeConfig();

  if (!config.isConfigured) {
    return {
      success: false,
      error: 'Cashfree credentials not configured.'
    };
  }

  try {
    // Call Cashfree payments API to generate dynamic UPI QR code
    const res = await fetch(`${config.baseUrl}/orders/${orderId}/payments`, {
      method: 'POST',
      headers: {
        'x-client-id': config.appId,
        'x-client-secret': config.secretKey,
        'x-api-version': config.apiVersion,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        payment_session_id: paymentSessionId,
        payment_method: {
          upi: {
            channel: 'qrcode'
          }
        }
      })
    });

    const data = await res.json();

    if (!res.ok) {
      console.warn('⚠️ [CASHFREE QR GENERATE NOTICE]:', data);
      return {
        success: false,
        error: data.message || 'Failed to generate dynamic UPI QR from Cashfree.',
        details: data
      };
    }

    // Extract dynamic UPI QR string from Cashfree response
    const upiQrString = 
      data?.data?.payload?.qrcode ||
      data?.payment_method?.upi?.qrcode ||
      data?.payload?.qrcode ||
      data?.data?.payload?.upi_intent ||
      null;

    const cfPaymentId = data?.cf_payment_id || data?.data?.cf_payment_id || null;

    return {
      success: true,
      upiQrString,
      cfPaymentId,
      raw: data
    };
  } catch (err) {
    console.error('❌ [CASHFREE QR ERROR]:', err.message);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * 3. Fetch Order Payments from Cashfree to verify transaction status directly
 */
export async function fetchCashfreeOrderPayments(orderId) {
  const config = getCashfreeConfig();

  if (!config.isConfigured) {
    return {
      success: false,
      error: 'Cashfree credentials not configured.'
    };
  }

  try {
    const res = await fetch(`${config.baseUrl}/orders/${orderId}/payments`, {
      method: 'GET',
      headers: {
        'x-client-id': config.appId,
        'x-client-secret': config.secretKey,
        'x-api-version': config.apiVersion,
        'Content-Type': 'application/json'
      }
    });

    const payments = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: payments.message || 'Failed to fetch payments for order.',
        details: payments
      };
    }

    const paymentsList = Array.isArray(payments) ? payments : [];
    // Check if any payment is SUCCESS
    const successfulPayment = paymentsList.find(
      p => p.payment_status === 'SUCCESS' || p.payment_status === 'PAID'
    );

    return {
      success: true,
      payments: paymentsList,
      hasSuccessfulPayment: Boolean(successfulPayment),
      successfulPayment: successfulPayment || null
    };
  } catch (err) {
    console.error('❌ [CASHFREE FETCH PAYMENTS ERROR]:', err.message);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * 4. Fetch Order Details from Cashfree
 */
export async function fetchCashfreeOrder(orderId) {
  const config = getCashfreeConfig();

  if (!config.isConfigured) {
    return {
      success: false,
      error: 'Cashfree credentials not configured.'
    };
  }

  try {
    const res = await fetch(`${config.baseUrl}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'x-client-id': config.appId,
        'x-client-secret': config.secretKey,
        'x-api-version': config.apiVersion,
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: data.message || 'Failed to fetch order status.',
        details: data
      };
    }

    return {
      success: true,
      order: data,
      isPaid: data.order_status === 'PAID',
      status: data.order_status,
      orderAmount: data.order_amount
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * 5. Verify Cashfree Webhook Signature (HMAC-SHA256)
 * In Cashfree PG 2023-08-01:
 * Signature = Base64(HMAC-SHA256(timestamp + rawBody, secretKey))
 * or Hex string depending on webhook configuration
 */
export function verifyCashfreeWebhookSignature(rawBody, timestamp, signature) {
  const config = getCashfreeConfig();
  const secret = config.webhookSecret;

  if (!signature || !secret) {
    return false;
  }

  try {
    const dataToSign = timestamp ? `${timestamp}${rawBody}` : rawBody;
    
    // Check Base64 signature
    const hmacBase64 = crypto
      .createHmac('sha256', secret)
      .update(dataToSign)
      .digest('base64');

    // Check Hex signature
    const hmacHex = crypto
      .createHmac('sha256', secret)
      .update(dataToSign)
      .digest('hex');

    const cleanSig = signature.trim();

    if (cleanSig === hmacBase64 || cleanSig === hmacHex) {
      return true;
    }

    // Try timing-safe equal for Base64
    try {
      const sigBuf = Buffer.from(cleanSig);
      const b64Buf = Buffer.from(hmacBase64);
      if (sigBuf.length === b64Buf.length && crypto.timingSafeEqual(sigBuf, b64Buf)) {
        return true;
      }
    } catch (e) {}

    // Try timing-safe equal for Hex
    try {
      const sigBuf = Buffer.from(cleanSig);
      const hexBuf = Buffer.from(hmacHex);
      if (sigBuf.length === hexBuf.length && crypto.timingSafeEqual(sigBuf, hexBuf)) {
        return true;
      }
    } catch (e) {}

    return false;
  } catch (err) {
    console.error('Error verifying Cashfree webhook signature:', err.message);
    return false;
  }
}
