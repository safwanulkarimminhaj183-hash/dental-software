// backend/services/paymentService.js
// Unified payment gateway adapter supporting bKash, Nagad, and Stripe card.
// In production swap the mock blocks for real SDK / REST calls.

import crypto from 'crypto';

// ── Helpers ──────────────────────────────────────────────────────────────────
const generateTxnId = () => `TXN-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

// ── bKash ─────────────────────────────────────────────────────────────────────
async function processBkash({ amount, paymentDetails, invoiceId }) {
  /**
   * Production flow (tokenized API v1.2.0):
   *   1. POST /token/grant  → get id_token
   *   2. POST /create       → create payment, get bkashURL
   *   3. Redirect patient to bkashURL
   *   4. Receive callback at /bkash/callback, then
   *   5. POST /execute      → confirm payment
   *
   * Here we simulate a successful response for development/testing.
   */
  console.log(`[bKash] Processing BDT ${amount} for invoice ${invoiceId}`);

  // TODO: Replace with real bKash tokenized API calls
  // const tokenRes = await fetch(`${process.env.BKASH_BASE_URL}/token/grant`, { ... });
  // const createRes = await fetch(`${process.env.BKASH_BASE_URL}/create`, { ... });

  return {
    success: true,
    transactionId: generateTxnId(),
    gateway: 'bkash',
    amount,
    currency: 'BDT',
    message: 'bKash payment processed successfully.',
    raw: { status: 'Completed', paymentDetails },
  };
}

// ── Nagad ─────────────────────────────────────────────────────────────────────
async function processNagad({ amount, paymentDetails, invoiceId }) {
  /**
   * Production flow (Nagad PGW API):
   *   1. POST /check-out/initialize  → sensitiveData + signature
   *   2. POST /check-out/complete    → verify OTP / PIN
   *   3. GET  /verify/{paymentRefId} → confirm transaction
   *
   * Simulated below.
   */
  console.log(`[Nagad] Processing BDT ${amount} for invoice ${invoiceId}`);

  // TODO: Replace with real Nagad API calls
  return {
    success: true,
    transactionId: generateTxnId(),
    gateway: 'nagad',
    amount,
    currency: 'BDT',
    message: 'Nagad payment processed successfully.',
    raw: { status: 'Success', paymentDetails },
  };
}

// ── Card (Stripe) ─────────────────────────────────────────────────────────────
async function processCard({ amount, paymentDetails, invoiceId }) {
  /**
   * Production flow (Stripe):
   *   1. Create a PaymentIntent on the server: stripe.paymentIntents.create(...)
   *   2. Return client_secret to the frontend
   *   3. Frontend uses Stripe.js to confirm the payment
   *   4. Webhook at /api/payments/stripe/webhook confirms final status
   *
   * Simulated below.
   */
  console.log(`[Card/Stripe] Processing BDT ${amount} for invoice ${invoiceId}`);

  // TODO: Uncomment and configure for production
  // import Stripe from 'stripe';
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  // const intent = await stripe.paymentIntents.create({
  //   amount: Math.round(amount * 100), // Stripe uses smallest currency unit
  //   currency: 'bdt',
  //   metadata: { invoiceId: invoiceId.toString() },
  // });
  // return { success: true, clientSecret: intent.client_secret, transactionId: intent.id, ... };

  return {
    success: true,
    transactionId: generateTxnId(),
    gateway: 'stripe',
    amount,
    currency: 'BDT',
    message: 'Card payment processed successfully.',
    raw: { status: 'succeeded', paymentDetails },
  };
}

// ── Public API ────────────────────────────────────────────────────────────────
/**
 * processPayment({ amount, method, paymentDetails, invoiceId })
 *
 * @param {number}  amount         - Total amount in BDT
 * @param {string}  method         - 'bkash' | 'nagad' | 'card'
 * @param {object}  paymentDetails - Gateway-specific payload (phone, token, etc.)
 * @param {string}  invoiceId      - Reference invoice ObjectId
 * @returns {{ success, transactionId, gateway, amount, currency, message, raw }}
 */
export const processPayment = async ({ amount, method, paymentDetails, invoiceId }) => {
  if (!amount || amount <= 0) throw new Error('Payment amount must be greater than zero.');

  const methodMap = {
    bkash: processBkash,
    nagad: processNagad,
    card: processCard,
  };

  const handler = methodMap[method?.toLowerCase()];
  if (!handler) {
    throw Object.assign(
      new Error(`Unsupported payment method "${method}". Supported: bkash, nagad, card.`),
      { statusCode: 400 }
    );
  }

  return handler({ amount, paymentDetails: paymentDetails || {}, invoiceId });
};

export default { processPayment };
