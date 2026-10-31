"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ApiError, callApi, fetchPayConfig, PayConfig } from "@/lib/api";
import { inr, inrFor, isIndia, usd } from "@/lib/format";
import { SITE } from "@/lib/data";

type Method = "razorpay" | "paypal";

export type CheckoutPayload =
  | { kind: "new"; url: string; name: string; tagline: string; description: string; category: string; maker: string }
  | { kind: "topup"; slug: string };

type Created = { orderId: string; providerOrderId: string; chargeAmount: number; chargeCurrency: string; description: string };

declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => { open: () => void; on: (ev: string, fn: (r: unknown) => void) => void };
    paypal?: { Buttons: (opts: Record<string, unknown>) => { render: (el: HTMLElement) => Promise<void>; close: () => void } };
  }
}

const loaded = new Map<string, Promise<void>>();
function loadScript(src: string) {
  if (!loaded.has(src)) {
    loaded.set(
      src,
      new Promise<void>((resolve, reject) => {
        const s = document.createElement("script");
        s.src = src;
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => {
          loaded.delete(src);
          reject(new Error("Could not load the payment window. Check your connection or disable blockers."));
        };
        document.head.appendChild(s);
      }),
    );
  }
  return loaded.get(src)!;
}

const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());

export function Checkout({
  open,
  amountCents,
  payload,
  title,
  onClose,
  onPaid,
}: {
  open: boolean;
  amountCents: number;
  payload: CheckoutPayload;
  title: string;
  onClose: () => void;
  onPaid: (slug: string) => void;
}) {
  const [config, setConfig] = useState<PayConfig | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [method, setMethod] = useState<Method>("paypal");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<React.ReactNode>(null);
  const paypalRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef(email);
  const orderRef = useRef<string | null>(null);
  emailRef.current = email;

  useEffect(() => {
    if (!open) return;
    setError(null);
    setBusy(null);
    fetchPayConfig().then(
      (c) => {
        setConfig(c);
        const preferIndia = isIndia();
        if (preferIndia && c.razorpay.enabled) setMethod("razorpay");
        else if (c.paypal.enabled) setMethod("paypal");
        else if (c.razorpay.enabled) setMethod("razorpay");
      },
      () => setConfigError("Payments are unavailable right now. Please try again in a few minutes."),
    );
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onClose]);

  const describeError = (e: unknown): React.ReactNode => {
    if (e instanceof ApiError && e.status === 409 && typeof e.data.slug === "string")
      return (
        <>
          {e.message}. <Link href={`/product/${e.data.slug}`}>Open the listing →</Link>
        </>
      );
    return e instanceof Error ? e.message : "Something went wrong";
  };

  const create = async (provider: Method) => {
    const created = await callApi<Created>({ action: "create-order", provider, amountCents, email: emailRef.current, ...payload });
    orderRef.current = created.orderId;
    return created;
  };

  const finish = async (extra: Record<string, unknown>) => {
    setBusy("Confirming your payment…");
    try {
      const r = await callApi<{ slug: string }>({ action: "verify", orderId: orderRef.current, ...extra });
      onPaid(r.slug);
    } catch (e) {
      setBusy(null);
      setError(describeError(e));
    }
  };

  // PayPal buttons render inline once an email is entered.
  const emailOk = validEmail(email);
  useEffect(() => {
    if (!open || method !== "paypal" || !config?.paypal.enabled || !config.paypal.clientId || !emailOk) return;
    let cancelled = false;
    let buttons: { close: () => void } | null = null;
    const src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(config.paypal.clientId)}&currency=USD&intent=capture&components=buttons&enable-funding=card`;
    loadScript(src)
      .then(() => {
        if (cancelled || !window.paypal || !paypalRef.current) return;
        paypalRef.current.innerHTML = "";
        const b = window.paypal.Buttons({
          style: { layout: "vertical", shape: "rect", label: "pay", height: 44 },
          createOrder: async () => {
            setError(null);
            try {
              return (await create("paypal")).providerOrderId;
            } catch (e) {
              setError(describeError(e));
              throw e;
            }
          },
          onApprove: async () => finish({}),
          onCancel: () => setError("Payment cancelled. Nothing was charged."),
          onError: () => setError((prev: React.ReactNode) => prev || "PayPal hit an error. Please try again."),
        });
        buttons = b;
        return b.render(paypalRef.current);
      })
      .catch((e) => !cancelled && setError(describeError(e)));
    return () => {
      cancelled = true;
      try {
        buttons?.close();
      } catch {
        /* already closed */
      }
    };
  }, [open, method, config, emailOk]); // eslint-disable-line react-hooks/exhaustive-deps

  const payRazorpay = async () => {
    if (!config?.razorpay.keyId) return;
    if (!emailOk) return setError("Enter your email for the receipt.");
    setError(null);
    setBusy("Opening Razorpay…");
    try {
      const [created] = await Promise.all([create("razorpay"), loadScript("https://checkout.razorpay.com/v1/checkout.js")]);
      if (!window.Razorpay) throw new Error("Razorpay could not load");
      setBusy("Complete the payment in the Razorpay window…");
      const rz = new window.Razorpay({
        key: config.razorpay.keyId,
        order_id: created.providerOrderId,
        amount: created.chargeAmount,
        currency: "INR",
        name: "Softing by Kriosity",
        description: created.description,
        prefill: { email: emailRef.current },
        notes: { softing_order: created.orderId },
        theme: { color: "#e2580b" },
        handler: (r: Record<string, string>) => finish(r),
        modal: {
          ondismiss: () => {
            setBusy(null);
            setError("Payment window closed. If money left your account, your listing appears within a few minutes.");
          },
        },
      });
      rz.on("payment.failed", () => setError("Payment failed. You weren't charged — try another method."));
      rz.open();
    } catch (e) {
      setBusy(null);
      setError(describeError(e));
    }
  };

  if (!open) return null;
  const inrAmount = config ? inrFor(amountCents, config.inrPerUsd) : null;
  const none = config && !config.razorpay.enabled && !config.paypal.enabled;

  return (
    <div className="modal-backdrop" onClick={() => !busy && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Checkout" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="muted small">Softing checkout</div>
            <div className="modal-amount">{usd(amountCents)}</div>
            <div className="muted small">{title}</div>
          </div>
          <button className="x" onClick={onClose} disabled={Boolean(busy)} aria-label="Close">×</button>
        </div>

        {configError ? (
          <p className="error">{configError}</p>
        ) : !config ? (
          <div className="processing"><span className="spinner" /></div>
        ) : none ? (
          <p className="notice">Payments are being switched on. Please check back shortly or email {SITE.supportEmail}.</p>
        ) : busy ? (
          <div className="processing"><span className="spinner" /><p>{busy}</p></div>
        ) : (
          <>
            <label className="field">
              Email for your receipt
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" />
              <span className="muted small">Private. Used only for receipts and support.</span>
            </label>

            <div className={`methods ${config.razorpay.enabled ? "" : "methods-one"}`}>
              {config.razorpay.enabled && (
              <button className={`method ${method === "razorpay" ? "on" : ""}`} onClick={() => setMethod("razorpay")}>
                <strong>India · {inrAmount !== null ? inr(inrAmount) : ""}</strong>
                <span>{config.razorpay.enabled ? "UPI, cards, netbanking via Razorpay" : "Coming soon"}</span>
              </button>
              )}
              <button className={`method ${method === "paypal" ? "on" : ""}`} disabled={!config.paypal.enabled} onClick={() => setMethod("paypal")}>
                <strong>{config.razorpay.enabled ? "International" : "PayPal or card"} · {usd(amountCents)}</strong>
                <span>{config.paypal.enabled ? (config.razorpay.enabled ? "PayPal or card, USA/EU & worldwide" : "Pay with your PayPal balance or any debit/credit card") : "Coming soon"}</span>
              </button>
            </div>

            {method === "razorpay" ? (
              <>
                <button className="btn btn-block btn-lg" onClick={payRazorpay} disabled={!emailOk}>
                  Pay {inrAmount !== null ? inr(inrAmount) : ""} with Razorpay
                </button>
                <p className="muted small">Charged in INR at ₹{config.inrPerUsd} per $1. Your rank counts {usd(amountCents)}.</p>
              </>
            ) : emailOk ? (
              <div ref={paypalRef} className="paypal-slot" />
            ) : (
              <p className="muted small center">Enter your email to see PayPal and card options.</p>
            )}
            {config.paypal.env === "sandbox" && method === "paypal" && config.paypal.enabled && (
              <p className="notice small">PayPal is in sandbox mode — test payments only.</p>
            )}
          </>
        )}

        {error && <p className="error">{error}</p>}
        <p className="muted small">
          Payments are processed by {config?.razorpay.enabled ? "Razorpay or PayPal" : "PayPal"} and may appear on your statement as <strong>Shiva Dhali</strong> or <strong>Kriosity</strong>.
          By paying you agree to the <Link href="/terms">Terms</Link> and <Link href="/refund-policy">Refund policy</Link>.
        </p>
      </div>
    </div>
  );
}
