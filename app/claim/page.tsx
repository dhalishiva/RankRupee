"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES, categoryBySlug, MIN_CENTS } from "@/lib/data";
import { usd } from "@/lib/format";
import { invalidate } from "@/lib/api";
import { useRanked } from "@/components/ui";
import { Checkout } from "@/components/Checkout";

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

function hostOf(u: string) {
  try {
    const x = new URL(u);
    if (!/^https?:$/.test(x.protocol) || !x.hostname.includes(".")) return null;
    return x.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

function ClaimForm() {
  const params = useSearchParams();
  const router = useRouter();
  const { data: ranked } = useRanked();

  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(params.get("category") ?? "");
  const [maker, setMaker] = useState("");
  const [dollars, setDollars] = useState<string>(() => {
    const c = Number(params.get("amount"));
    return c >= MIN_CENTS ? String(Math.ceil(c / 100)) : "";
  });
  const [touched, setTouched] = useState(false);
  const [paying, setPaying] = useState(false);

  const fallback = Math.max(MIN_CENTS, (ranked?.[0]?.total_cents ?? 0) + 100);
  const amountCents = dollars ? Math.round(Number(dollars) * 100) : fallback;
  const rank = ranked ? ranked.filter((p) => p.total_cents >= amountCents).length + 1 : 0;
  const full = normaliseUrl(url);
  const host = hostOf(full);
  const existing = host ? ranked?.find((p) => p.domain === host && hostOf(p.url) === host && new URL(p.url).pathname.replace(/\/+$/, "") === new URL(full).pathname.replace(/\/+$/, "")) : undefined;

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!host) e.url = "Enter a valid website, e.g. yourproduct.com";
    if (name.trim().length < 2) e.name = "Give your product a name";
    if (tagline.trim().length < 4) e.tagline = "Add a short tagline (4+ characters)";
    if (!categoryBySlug(category)) e.category = "Pick a category";
    if (maker && !/^@?[A-Za-z0-9_]{1,15}$/.test(maker.trim())) e.maker = "Letters, numbers and _ only";
    if (!Number.isFinite(amountCents) || amountCents < MIN_CENTS) e.amount = "Minimum is $1";
    if (amountCents > 100_000_000) e.amount = "Maximum is $1,000,000";
    return e;
  }, [host, name, tagline, category, maker, amountCents]);

  const ok = Object.keys(errors).length === 0 && !existing;
  const above = ranked?.find((p) => p.rank === rank - 1);
  const holder = ranked?.find((p) => p.rank === rank);
  const show = (k: string) => touched && errors[k];

  return (
    <div className="wrap page claim-layout">
      <div>
        <p className="eyebrow">Claim a rank</p>
        <h1>Put your product <em>on the board</em></h1>
        <p className="lede">Pay once and your listing stays up. Top it up any time to climb. Rank is decided by the total paid, in US dollars.</p>

        <form className="form card" noValidate onSubmit={(e) => { e.preventDefault(); setTouched(true); if (ok) setPaying(true); }}>
          <label>
            Website
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="yourproduct.com" inputMode="url" autoComplete="url" />
            {show("url") && <span className="error">{errors.url}</span>}
            {existing && (
              <span className="error">
                Already listed at #{existing.rank}. <a href={`/product/${existing.slug}`}>Top it up instead →</a>
              </span>
            )}
          </label>
          <label>
            Product name
            <input value={name} onChange={(e) => setName(e.target.value.slice(0, 60))} placeholder="Acme Analytics" />
            {show("name") && <span className="error">{errors.name}</span>}
          </label>
          <label>
            Tagline <span className="muted small">{tagline.length}/90</span>
            <input value={tagline} onChange={(e) => setTagline(e.target.value.slice(0, 90))} placeholder="What it does, in one line" />
            {show("tagline") && <span className="error">{errors.tagline}</span>}
          </label>
          <label>
            Description <span className="muted small">{description.length}/240 · optional</span>
            <textarea value={description} rows={3} onChange={(e) => setDescription(e.target.value.slice(0, 240))} placeholder="Who it's for and why they should care" />
          </label>
          <div className="form-row">
            <label>
              Category
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Choose…</option>
                {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
              {show("category") && <span className="error">{errors.category}</span>}
            </label>
            <label>
              Your X handle <span className="muted small">optional</span>
              <input value={maker} onChange={(e) => setMaker(e.target.value.slice(0, 16))} placeholder="@yourhandle" />
              {show("maker") && <span className="error">{errors.maker}</span>}
            </label>
          </div>
          <label>
            Amount (USD)
            <div className="amount-field">
              <span>$</span>
              <input inputMode="decimal" value={dollars || (ranked ? String(fallback / 100) : "")} onChange={(e) => setDollars(e.target.value.replace(/[^\d.]/g, "").slice(0, 10))} />
            </div>
            {show("amount") && <span className="error">{errors.amount}</span>}
          </label>
          <div className="quick">
            {[1, 5, 25, 100].map((v) => (
              <button type="button" key={v} className="chip" onClick={() => setDollars(String(v))}>${v}</button>
            ))}
            {ranked?.[0] && (
              <button type="button" className="chip on" onClick={() => setDollars(String((ranked[0].total_cents + 100) / 100))}>
                Take #1 · {usd(ranked[0].total_cents + 100)}
              </button>
            )}
          </div>
          <button type="submit" className="btn btn-block btn-lg">
            Continue to pay {usd(amountCents)} · rank #{rank || "…"}
          </button>
          <p className="muted small">India: pay in ₹ with UPI, cards or netbanking. Everyone else: PayPal or card in USD.</p>
        </form>
      </div>

      <aside className="claim-preview">
        <div className="card sticky">
          <h3>Preview</h3>
          <div className="preview-row">
            <span className="rank">#{rank || "…"}</span>
            <span className="logo" style={{ width: 44, height: 44, fontSize: 18, background: "var(--accent-soft)", color: "var(--accent)" }}>
              {(name || "?").charAt(0).toUpperCase()}
            </span>
            <span className="product-text">
              <span className="product-name">{name || "Your product"}</span>
              <span className="product-tagline">{tagline || "Your tagline goes here"}</span>
            </span>
            <span className="product-amount">{usd(amountCents)}</span>
          </div>
          {ranked && (
            <ul className="rank-math muted small">
              {above && <li>Below <strong>{above.name}</strong> ({usd(above.total_cents)}). {usd(above.total_cents - amountCents + 100)} more passes them.</li>}
              {holder && <li>Pushes <strong>{holder.name}</strong> down to #{holder.rank + 1}.</li>}
              {rank === 1 && <li>You&apos;d be #1 overall.</li>}
            </ul>
          )}
        </div>
      </aside>

      <Checkout
        open={paying}
        amountCents={amountCents}
        title={`Rank #${rank} for ${name || "your product"}`}
        payload={{ kind: "new", url: full, name, tagline, description, category, maker: maker.replace(/^@/, "") }}
        onClose={() => setPaying(false)}
        onPaid={(slug) => {
          invalidate();
          setPaying(false);
          router.push(`/product/${slug}?welcome=1`);
        }}
      />
    </div>
  );
}
