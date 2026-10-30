"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES, categoryBySlug, hueFor, MIN_AMOUNT } from "@/lib/data";
import { inr } from "@/lib/format";
import { useStore } from "@/lib/store";
import { Logo } from "@/components/ui";
import { PaymentModal } from "@/components/PaymentModal";

export default function ClaimPage() {
  return (
    <Suspense fallback={<div className="wrap page">Loading…</div>}>
      <ClaimForm />
    </Suspense>
  );
}

const normaliseUrl = (u: string) => {
  const t = u.trim();
  if (!t) return "";
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
};

function validUrl(u: string) {
  try {
    const x = new URL(u);
    return (x.protocol === "https:" || x.protocol === "http:") && x.hostname.includes(".");
  } catch {
    return false;
  }
}

function ClaimForm() {
  const params = useSearchParams();
  const router = useRouter();
  const { ranked, ready, rankForAmount, addListing } = useStore();

  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(params.get("category") ?? "");
  const [maker, setMaker] = useState("");
  const [amount, setAmount] = useState<number>(() => Math.max(MIN_AMOUNT, Number(params.get("amount")) || 0));
  const [touched, setTouched] = useState(false);
  const [paying, setPaying] = useState(false);

  const effectiveAmount = amount || Math.max(MIN_AMOUNT, (ranked[0]?.amount ?? 0) + 1);
  const rank = ready ? rankForAmount(effectiveAmount) : 0;
  const full = normaliseUrl(url);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!validUrl(full)) e.url = "Enter a valid website, e.g. yourproduct.in";
    if (name.trim().length < 2) e.name = "Give your product a name";
    if (tagline.trim().length < 4) e.tagline = "A short tagline helps people click";
    if (!categoryBySlug(category)) e.category = "Pick a category";
    if (effectiveAmount < MIN_AMOUNT) e.amount = `Minimum is ${inr(MIN_AMOUNT)}`;
    return e;
  }, [full, name, tagline, category, effectiveAmount]);

  const ok = Object.keys(errors).length === 0;
  const above = ranked.find((p) => p.rank === rank - 1);
  const holder = ranked.find((p) => p.rank === rank);
  const show = (k: string) => touched && errors[k];

  return (
    <div className="wrap page claim-layout">
      <div>
        <p className="eyebrow">Claim a rank</p>
        <h1>
          Put your product <em>on the board</em>
        </h1>
        <p className="lede">Pay once. Your listing stays up for good, and you can top it up any time to climb.</p>

        <form
          className="form card"
          onSubmit={(e) => {
            e.preventDefault();
            setTouched(true);
            if (ok) setPaying(true);
          }}
          noValidate
        >
          <label>
            Website
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="yourproduct.in" inputMode="url" />
            {show("url") && <span className="error">{errors.url}</span>}
          </label>
          <label>
            Product name
            <input value={name} onChange={(e) => setName(e.target.value.slice(0, 60))} placeholder="ChaiStack" />
            {show("name") && <span className="error">{errors.name}</span>}
          </label>
          <label>
            Tagline <span className="muted small">{tagline.length}/80</span>
            <input value={tagline} onChange={(e) => setTagline(e.target.value.slice(0, 80))} placeholder="What it does, in one line" />
            {show("tagline") && <span className="error">{errors.tagline}</span>}
          </label>
          <label>
            Description <span className="muted small">{description.length}/220 · optional</span>
            <textarea value={description} rows={3} onChange={(e) => setDescription(e.target.value.slice(0, 220))} placeholder="Who it’s for and why they should care" />
          </label>
          <div className="form-row">
            <label>
              Category
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Choose…</option>
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
              {show("category") && <span className="error">{errors.category}</span>}
            </label>
            <label>
              Your X handle <span className="muted small">optional</span>
              <input value={maker} onChange={(e) => setMaker(e.target.value.slice(0, 30))} placeholder="@yourhandle" />
            </label>
          </div>
          <label>
            Amount
            <div className="amount-field">
              <span>₹</span>
              <input
                inputMode="numeric"
                value={ready ? effectiveAmount : ""}
                onChange={(e) => setAmount(Number(e.target.value.replace(/\D/g, "")) || 0)}
              />
            </div>
            {show("amount") && <span className="error">{errors.amount}</span>}
          </label>
          <div className="quick">
            {[MIN_AMOUNT, 99, 499, 1999].map((v) => (
              <button type="button" key={v} className="chip" onClick={() => setAmount(v)}>
                {inr(v)}
              </button>
            ))}
            {ranked[0] && (
              <button type="button" className="chip on" onClick={() => setAmount(ranked[0].amount + 1)}>
                Take #1 · {inr(ranked[0].amount + 1)}
              </button>
            )}
          </div>
          <button type="submit" className="btn btn-block btn-lg">
            Pay {ready ? inr(effectiveAmount) : ""} &amp; claim #{rank || "…"}
          </button>
          <p className="muted small">By claiming you agree to the <a href="/rules">rules</a>. Demo mode: nothing is charged.</p>
        </form>
      </div>

      <aside className="claim-preview">
        <div className="card sticky">
          <h3>Preview</h3>
          <div className="preview-row">
            <span className="rank">#{rank || "…"}</span>
            <Logo name={name || "?"} hue={hueFor(name || "?")} />
            <span className="product-text">
              <span className="product-name">{name || "Your product"}</span>
              <span className="product-tagline">{tagline || "Your tagline goes here"}</span>
            </span>
            <span className="product-amount">{inr(effectiveAmount)}</span>
          </div>
          {ready && (
            <ul className="rank-math muted small">
              {above && (
                <li>
                  Below <strong>{above.name}</strong> ({inr(above.amount)}) — {inr(above.amount - effectiveAmount + 1)} more to pass them.
                </li>
              )}
              {holder && (
                <li>
                  Pushes <strong>{holder.name}</strong> down to #{holder.rank + 1}.
                </li>
              )}
              {rank === 1 && <li>You&apos;d be #1 overall. Enjoy the view.</li>}
            </ul>
          )}
        </div>
      </aside>

      <PaymentModal
        open={paying}
        amount={effectiveAmount}
        description={`Rank #${rank} for ${name || "your product"}`}
        onClose={() => setPaying(false)}
        onResult={(r) => {
          if (!r.ok) return;
          const slug = addListing({ url: full, name, tagline, description, category, maker }, effectiveAmount);
          setPaying(false);
          router.push(`/product/${slug}?claimed=${r.paymentId}`);
        }}
      />
    </div>
  );
}
