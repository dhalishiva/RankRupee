/**
 * Payment boundary.
 *
 * Today: the demo gateway in components/PaymentModal.tsx simulates every payment.
 *
 * Razorpay later:
 *   1. Server route creates an order:  POST /api/orders  -> razorpay.orders.create({ amount: rupees * 100, currency: "INR" })
 *   2. Client opens Razorpay Checkout with that order_id.
 *   3. Server verifies the signature (order_id|payment_id, HMAC-SHA256 with key secret)
 *      and only then writes the listing / top-up to the database.
 *   4. Rank is always computed server-side from verified payments, never from client state.
 */
export type PaymentResult =
  | { ok: true; paymentId: string; method: string }
  | { ok: false; error: string };

export const PAYMENT_MODE: "demo" | "razorpay" = "demo";
