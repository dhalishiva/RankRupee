"use client";

import { useEffect, useState } from "react";
import { inr } from "@/lib/format";
import { PaymentResult } from "@/lib/payments";

type Method = "upi" | "card" | "netbanking" | "wallet";

const METHODS: { id: Method; label: string; note: string }[] = [
  { id: "upi", label: "UPI", note: "GPay, PhonePe, Paytm, BHIM" },
  { id: "card", label: "Card", note: "Visa, Mastercard, RuPay" },
  { id: "netbanking", label: "Netbanking", note: "All major banks" },
  { id: "wallet", label: "Wallet", note: "Paytm, Amazon Pay" },
];

/**
 * Demo checkout. It never asks for real card, UPI or bank details —
 * every payment is simulated. Swap for Razorpay Checkout via lib/payments.ts.
 */
export function PaymentModal({
  open,
  amount,
  description,
  onClose,
  onResult,
}: {
  open: boolean;
  amount: number;
  description: string;
  onClose: () => void;
  onResult: (r: PaymentResult) => void;
}) {
  const [method, setMethod] = useState<Method>("upi");
  const [stage, setStage] = useState<"choose" | "processing" | "failed">("choose");

  useEffect(() => {
    if (open) setStage("choose");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && stage !== "processing" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, stage, onClose]);

  if (!open) return null;

  const simulate = (ok: boolean) => {
    setStage("processing");
    setTimeout(() => {
      if (ok) {
        const id = `pay_demo_${Math.random().toString(36).slice(2, 12)}`;
        onResult({ ok: true, paymentId: id, method });
      } else {
        setStage("failed");
        onResult({ ok: false, error: "Payment declined (simulated)" });
      }
    }, 1400);
  };

  return (
    <div className="modal-backdrop" onClick={() => stage !== "processing" && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Demo payment" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="muted small">RankRupee · Demo Pay</div>
            <div className="modal-amount">{inr(amount)}</div>
            <div className="muted small">{description}</div>
          </div>
          <button className="x" onClick={onClose} disabled={stage === "processing"} aria-label="Close">
            ×
          </button>
        </div>

        <div className="test-pill">TEST MODE · no money moves · don&apos;t enter real details anywhere</div>

        {stage === "processing" ? (
          <div className="processing">
            <span className="spinner" />
            <p>Processing {method.toUpperCase()} payment…</p>
          </div>
        ) : (
          <>
            <div className="methods">
              {METHODS.map((m) => (
                <button key={m.id} className={`method ${method === m.id ? "on" : ""}`} onClick={() => setMethod(m.id)}>
                  <strong>{m.label}</strong>
                  <span>{m.note}</span>
                </button>
              ))}
            </div>

            {method === "upi" && (
              <div className="fake-qr" aria-label="Sample QR pattern, not scannable">
                <QR />
                <p className="muted small">Sample QR — not a real payment code</p>
              </div>
            )}

            {stage === "failed" && <p className="error">Simulated failure. Try again or pick another method.</p>}

            <button className="btn btn-block" onClick={() => simulate(true)}>
              Simulate successful payment
            </button>
            <button className="btn btn-ghost btn-block" onClick={() => simulate(false)}>
              Simulate failure
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function QR() {
  // deterministic decorative pattern
  const cells: React.ReactNode[] = [];
  const n = 21;
  let seed = 7;
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      seed = (seed * 9301 + 49297) % 233280;
      const finder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
      if (finder) {
        const fx = x > 13 ? x - 14 : x;
        const fy = y > 13 ? y - 14 : y;
        const ring = fx === 0 || fx === 6 || fy === 0 || fy === 6 || (fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4);
        if (ring) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />);
      } else if (seed / 233280 > 0.55) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />);
    }
  return (
    <svg viewBox="-1 -1 23 23" width="132" height="132" className="qr">
      <rect x={-1} y={-1} width={23} height={23} fill="#fff" />
      <g fill="#1d1b16">{cells}</g>
    </svg>
  );
}
