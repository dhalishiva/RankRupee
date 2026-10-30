// Razorpay webhook: safety net for payments where the buyer closed the tab before verify ran.
// In Razorpay Dashboard → Webhooks, point to:
//   https://<project>.supabase.co/functions/v1/razorpay-webhook
// with events: order.paid, payment.captured — and set RAZORPAY_WEBHOOK_SECRET to the same secret.
import { createClient } from "npm:@supabase/supabase-js@2";

const env = (k: string) => Deno.env.get(k)?.trim() || "";
const db = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });

async function hmacHex(secret: string, message: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const secret = env("RAZORPAY_WEBHOOK_SECRET");
  if (!secret) return new Response("Webhook not configured", { status: 503 });

  const raw = await req.text();
  const sig = req.headers.get("x-razorpay-signature") || "";
  if (!safeEqual(await hmacHex(secret, raw), sig)) return new Response("Bad signature", { status: 401 });

  let event: any;
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response("Bad payload", { status: 400 });
  }
  if (event.event !== "order.paid" && event.event !== "payment.captured") return new Response("ignored");

  const payment = event.payload?.payment?.entity;
  if (!payment || payment.status !== "captured") return new Response("ignored");

  const { data: order } = await db
    .from("orders")
    .select("id, status, charge_amount, provider")
    .eq("provider", "razorpay")
    .eq("provider_order_id", payment.order_id)
    .maybeSingle();
  if (!order) return new Response("unknown order");
  if (order.status === "paid") return new Response("already paid");
  if (Number(payment.amount) !== Number(order.charge_amount) || payment.currency !== "INR") {
    console.error("amount mismatch", payment.id, payment.amount, order.charge_amount);
    return new Response("amount mismatch", { status: 400 });
  }

  const { error } = await db.rpc("fulfill_order", { p_order_id: order.id, p_payment_id: payment.id });
  if (error) {
    console.error("fulfill failed", error);
    return new Response("retry", { status: 500 });
  }
  return new Response("ok");
});
