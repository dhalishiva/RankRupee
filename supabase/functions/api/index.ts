// Softing payments API — runs on Supabase Edge Functions.
// Actions: config | create-order | verify
// Secrets (Supabase → Edge Functions → Secrets):
//   RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET            (India, charges INR)
//   PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_ENV=sandbox|live   (rest of world, charges USD)
//   INR_PER_USD (optional, default 88)
import { createClient } from "npm:@supabase/supabase-js@2";

const CATEGORIES = [
  "ai", "developer-tools", "saas", "marketing", "seo", "fintech", "ecommerce", "crypto",
  "design", "education", "health", "games", "social", "agencies", "hiring", "other",
];
const MIN_CENTS = 100; // $1
const MAX_CENTS = 100_000_000; // $1,000,000

const env = (k: string) => Deno.env.get(k)?.trim() || "";
const db = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
class HttpError extends Error {
  constructor(public status: number, message: string, public extra: Record<string, unknown> = {}) {
    super(message);
  }
}

const rate = () => {
  const r = Number(env("INR_PER_USD") || "88");
  return Number.isFinite(r) && r > 10 && r < 1000 ? r : 88;
};
const inrPaise = (cents: number) => Math.ceil((cents * rate()) / 100) * 100;
// Razorpay is switched off unless RAZORPAY_ENABLED=true is set (keys alone are not enough).
const razorpayOn = () => env("RAZORPAY_ENABLED") === "true" && Boolean(env("RAZORPAY_KEY_ID") && env("RAZORPAY_KEY_SECRET"));
const paypalOn = () => Boolean(env("PAYPAL_CLIENT_ID") && env("PAYPAL_CLIENT_SECRET"));
const paypalBase = () => (env("PAYPAL_ENV") === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com");

// ---------- validation ----------
function cleanText(v: unknown, min: number, max: number, field: string) {
  const s = typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "";
  if (s.length < min || s.length > max) throw new HttpError(400, `${field} must be ${min}–${max} characters`);
  return s;
}

function normaliseUrl(raw: unknown) {
  let s = typeof raw === "string" ? raw.trim() : "";
  if (!s) throw new HttpError(400, "Website is required");
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    throw new HttpError(400, "Website is not a valid URL");
  }
  if (!/^https?:$/.test(u.protocol) || !u.hostname.includes(".") || u.username || u.password || s.length > 300)
    throw new HttpError(400, "Website is not a valid URL");
  if (/^(localhost|[\d.]+|\[.*\])$/i.test(u.hostname)) throw new HttpError(400, "Use a public website address");
  const host = u.hostname.toLowerCase().replace(/^www\./, "");
  const path = u.pathname.replace(/\/+$/, "");
  const urlKey = (host + path).toLowerCase();
  const slug = (host + path).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60) || "product";
  u.hash = "";
  return { url: u.toString(), urlKey, domain: host, slug };
}

function readAmount(v: unknown) {
  const n = Number(v);
  if (!Number.isInteger(n) || n < MIN_CENTS || n > MAX_CENTS) throw new HttpError(400, "Amount must be between $1 and $1,000,000");
  return n;
}

function readEmail(v: unknown) {
  const s = typeof v === "string" ? v.trim().toLowerCase() : "";
  if (s.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)) throw new HttpError(400, "Enter a valid email for your receipt");
  return s;
}

// ---------- providers ----------
async function razorpay(path: string, init: RequestInit = {}) {
  const auth = btoa(`${env("RAZORPAY_KEY_ID")}:${env("RAZORPAY_KEY_SECRET")}`);
  const res = await fetch(`https://api.razorpay.com/v1${path}`, {
    ...init,
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json", ...(init.headers || {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("razorpay error", path, res.status, JSON.stringify(body));
    throw new HttpError(502, body?.error?.description || "Razorpay request failed");
  }
  return body;
}

async function paypalToken() {
  const auth = btoa(`${env("PAYPAL_CLIENT_ID")}:${env("PAYPAL_CLIENT_SECRET")}`);
  const res = await fetch(`${paypalBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("paypal token error", res.status, JSON.stringify(body));
    throw new HttpError(502, "PayPal authentication failed");
  }
  return body.access_token as string;
}

async function paypal(path: string, init: RequestInit = {}) {
  const token = await paypalToken();
  const res = await fetch(`${paypalBase()}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(init.headers || {}) },
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body };
}

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

// ---------- actions ----------
function config() {
  return {
    razorpay: { enabled: razorpayOn(), keyId: razorpayOn() ? env("RAZORPAY_KEY_ID") : null },
    paypal: {
      enabled: paypalOn(),
      clientId: paypalOn() ? env("PAYPAL_CLIENT_ID") : null,
      env: env("PAYPAL_ENV") === "live" ? "live" : "sandbox",
    },
    inrPerUsd: rate(),
    minCents: MIN_CENTS,
  };
}

async function createOrder(input: Record<string, unknown>) {
  const provider = input.provider;
  if (provider === "razorpay" && !razorpayOn()) throw new HttpError(503, "Indian (₹) payments are paused right now");
  if (provider === "paypal" && !paypalOn()) throw new HttpError(503, "PayPal is not available yet");
  if (provider !== "razorpay" && provider !== "paypal") throw new HttpError(400, "Choose a payment method");

  const amountCents = readAmount(input.amountCents);
  const email = readEmail(input.email);
  let kind: "new" | "topup";
  let draft: Record<string, unknown> | null = null;
  let listingId: string | null = null;
  let label: string;

  if (input.kind === "topup") {
    kind = "topup";
    const slug = typeof input.slug === "string" ? input.slug : "";
    const { data, error } = await db.from("listings").select("id,name").eq("slug", slug).eq("hidden", false).maybeSingle();
    if (error) throw error;
    if (!data) throw new HttpError(404, "Listing not found");
    listingId = data.id;
    label = `Top up: ${data.name}`;
  } else {
    kind = "new";
    const u = normaliseUrl(input.url);
    const name = cleanText(input.name, 2, 60, "Name");
    const tagline = cleanText(input.tagline, 4, 90, "Tagline");
    const description = typeof input.description === "string" ? input.description.replace(/\s+/g, " ").trim().slice(0, 240) : "";
    const category = String(input.category || "");
    if (!CATEGORIES.includes(category)) throw new HttpError(400, "Choose a category");
    let maker = typeof input.maker === "string" ? input.maker.trim().replace(/^@/, "") : "";
    if (maker && !/^[A-Za-z0-9_]{1,15}$/.test(maker)) throw new HttpError(400, "X handle can only have letters, numbers and _");
    const { data: existing } = await db.from("listings").select("slug,hidden").eq("url_key", u.urlKey).maybeSingle();
    if (existing?.hidden) throw new HttpError(403, "This website can't be listed");
    if (existing) throw new HttpError(409, "This website is already listed — top it up instead", { slug: existing.slug });
    draft = { url: u.url, url_key: u.urlKey, domain: u.domain, slug: u.slug, name, tagline, description, category, maker_handle: maker };
    label = `Listing: ${name}`;
  }

  const chargeCurrency = provider === "razorpay" ? "INR" : "USD";
  const chargeAmount = provider === "razorpay" ? inrPaise(amountCents) : amountCents;

  const { data: order, error } = await db
    .from("orders")
    .insert({ kind, listing_id: listingId, draft, email, amount_cents: amountCents, provider, charge_amount: chargeAmount, charge_currency: chargeCurrency })
    .select("id")
    .single();
  if (error) throw error;

  let providerOrderId: string;
  if (provider === "razorpay") {
    const ro = await razorpay("/orders", {
      method: "POST",
      body: JSON.stringify({ amount: chargeAmount, currency: "INR", receipt: order.id, notes: { softing_order: order.id, usd_cents: String(amountCents) } }),
    });
    providerOrderId = ro.id;
  } else {
    const po = await paypal("/v2/checkout/orders", {
      method: "POST",
      headers: { "PayPal-Request-Id": order.id },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          reference_id: order.id,
          custom_id: order.id,
          description: `Softing — ${label}`.slice(0, 127),
          amount: { currency_code: "USD", value: (amountCents / 100).toFixed(2) },
        }],
        payment_source: { paypal: { experience_context: { brand_name: "Softing by Kriosity", shipping_preference: "NO_SHIPPING", user_action: "PAY_NOW" } } },
      }),
    });
    if (!po.ok) {
      console.error("paypal create error", po.status, JSON.stringify(po.body));
      throw new HttpError(502, "PayPal could not create the order");
    }
    providerOrderId = po.body.id;
  }

  await db.from("orders").update({ provider_order_id: providerOrderId }).eq("id", order.id);

  return {
    orderId: order.id,
    provider,
    providerOrderId,
    chargeAmount,
    chargeCurrency,
    description: label,
    email,
  };
}

async function verify(input: Record<string, unknown>) {
  const orderId = String(input.orderId || "");
  const { data: order, error } = await db.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (error) throw error;
  if (!order) throw new HttpError(404, "Order not found");

  if (order.status === "paid") {
    const { data: l } = await db.from("listings").select("slug").eq("id", order.result_listing_id).maybeSingle();
    return { slug: l?.slug };
  }

  let paymentId: string;
  if (order.provider === "razorpay") {
    const rOrder = String(input.razorpay_order_id || "");
    const rPay = String(input.razorpay_payment_id || "");
    const rSig = String(input.razorpay_signature || "");
    if (rOrder !== order.provider_order_id || !rPay || !rSig) throw new HttpError(400, "Payment details missing");
    const expected = await hmacHex(env("RAZORPAY_KEY_SECRET"), `${rOrder}|${rPay}`);
    if (!safeEqual(expected, rSig)) throw new HttpError(400, "Payment signature did not match");
    let p = await razorpay(`/payments/${encodeURIComponent(rPay)}`);
    if (p.order_id !== order.provider_order_id || Number(p.amount) !== Number(order.charge_amount) || p.currency !== "INR")
      throw new HttpError(400, "Payment does not match this order");
    if (p.status === "authorized") {
      p = await razorpay(`/payments/${encodeURIComponent(rPay)}/capture`, {
        method: "POST",
        body: JSON.stringify({ amount: order.charge_amount, currency: "INR" }),
      });
    }
    if (p.status !== "captured") throw new HttpError(402, "Payment not completed");
    paymentId = rPay;
  } else {
    let res = await paypal(`/v2/checkout/orders/${encodeURIComponent(order.provider_order_id)}/capture`, {
      method: "POST",
      headers: { "PayPal-Request-Id": `capture-${order.id}` },
    });
    if (!res.ok && res.body?.details?.[0]?.issue === "ORDER_ALREADY_CAPTURED") {
      res = await paypal(`/v2/checkout/orders/${encodeURIComponent(order.provider_order_id)}`);
    }
    if (!res.ok) {
      console.error("paypal capture error", res.status, JSON.stringify(res.body));
      throw new HttpError(402, "PayPal payment was not completed");
    }
    const unit = res.body?.purchase_units?.[0];
    const capture = unit?.payments?.captures?.[0];
    if (res.body?.status !== "COMPLETED" || capture?.status !== "COMPLETED")
      throw new HttpError(402, "PayPal payment is pending. Your listing goes live once PayPal confirms it.");
    const paidCents = Math.round(Number(capture.amount?.value) * 100);
    if (capture.amount?.currency_code !== "USD" || paidCents !== Number(order.charge_amount))
      throw new HttpError(400, "Payment does not match this order");
    paymentId = capture.id;
  }

  const { data: slug, error: fErr } = await db.rpc("fulfill_order", { p_order_id: order.id, p_payment_id: paymentId });
  if (fErr) throw fErr;
  return { slug };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const input = await req.json().catch(() => ({}));
    switch (input.action) {
      case "config":
        return json(config());
      case "create-order":
        return json(await createOrder(input));
      case "verify":
        return json(await verify(input));
      default:
        return json({ error: "Unknown action" }, 400);
    }
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.message, ...e.extra }, e.status);
    console.error("unhandled", e);
    return json({ error: "Something went wrong. If you were charged, email support@kriosity.in." }, 500);
  }
});
