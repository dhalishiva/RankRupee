"use client";

import { Suspense, use, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { categoryBySlug, MIN_AMOUNT } from "@/lib/data";
import { inr, num, timeAgo } from "@/lib/format";
import { useStore } from "@/lib/store";
import { Logo } from "@/components/ui";
import { PaymentModal } from "@/components/PaymentModal";

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return (
    <Suspense fallback={<div className="wrap page">Loading…</div>}>
      <ProductDetail slug={slug} />
    </Suspense>
  );
}

function ProductDetail({ slug }: { slug: string }) {
  const { ready, bySlug, ranked, activity, topUp, rankForAmount, recordClick } = useStore();
  const params = useSearchParams();
  const claimed = params.get("claimed");
  const [topAmount, setTopAmount] = useState(0);
  const [paying, setPaying] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  if (!ready) return <div className="wrap page"><div className="card skeleton tall" /></div>;
  const p = bySlug(slug);
  if (!p)
    return (
      <div className="wrap page">
        <h1>Listing not found</h1>
        <p className="lede">It may have been claimed in another browser — demo claims live only where they were made.</p>
        <Link href="/" className="btn">Back to the board</Link>
      </div>
    );

  const cat = categoryBySlug(p.category);
  const above = ranked.find((r) => r.rank === p.rank - 1);
  const toPass = above ? above.amount - p.amount + 1 : 0;
  const amt = topAmount || Math.max(MIN_AMOUNT, toPass || MIN_AMOUNT);
  const newRank = rankForAmount(p.amount + amt, p.slug);
  const history = activity.filter((a) => a.slug === p.slug);

  return (
    <div className="wrap page">
      {claimed && (
        <div className="success card">
          <strong>You&apos;re on the board at #{p.rank}.</strong> Payment {claimed} (simulated). Share it before someone outbids you.
        </div>
      )}
      {toast && <div className="success card">{toast}</div>}

      <div className="detail">
        <div className="detail-main card">
          <div className="detail-head">
            <span className={`rank rank-xl ${p.rank <= 3 ? `podium-${p.rank}` : ""}`}>#{p.rank}</span>
            <Logo name={p.name} hue={p.hue} size={64} />
            <div>
              <h1 className="detail-title">
                {p.name}
                {p.sample && <span className="tag">sample</span>}
              </h1>
              <p className="product-tagline">{p.tagline}</p>
            </div>
          </div>
          {p.description && <p className="detail-desc">{p.description}</p>}
          <dl className="facts">
            <div><dt>Total paid</dt><dd>{inr(p.amount)}</dd></div>
            <div><dt>Clicks</dt><dd>{num(p.clicks)}</dd></div>
            <div><dt>Category</dt><dd>{cat ? <Link href={`/category/${cat.slug}`}>{cat.short}</Link> : "—"}</dd></div>
            <div><dt>Listed</dt><dd>{timeAgo(p.createdAt)}</dd></div>
            {p.maker && <div><dt>Maker</dt><dd><a href={`https://x.com/${p.maker}`} target="_blank" rel="noopener">@{p.maker}</a></dd></div>}
          </dl>
          <div className="detail-actions">
            {p.url ? (
              <a className="btn" href={`${p.url}${p.url.includes("?") ? "&" : "?"}utm_source=rankrupee`} target="_blank" rel="noopener" onClick={() => recordClick(p.slug)}>
                Visit {p.domain} ↗
              </a>
            ) : (
              <span className="muted small">Sample listing — no website attached.</span>
            )}
            <button
              className="btn btn-ghost"
              onClick={() => {
                const text = `I'm #${p.rank} on RankRupee with ${p.name}. Pay ${inr(p.amount + 1)} to take my spot 😏`;
                const link = typeof window !== "undefined" ? window.location.href.split("?")[0] : "";
                window.open(`https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`, "_blank", "noopener");
              }}
            >
              Share on X
            </button>
          </div>
        </div>

        <aside className="detail-side">
          <section className="card">
            <h3>Climb higher</h3>
            {p.rank === 1 ? (
              <p className="muted small">Already #1. Top up to build a cushion against challengers.</p>
            ) : (
              <p className="muted small">
                {inr(toPass)} more passes <strong>{above?.name}</strong> at #{p.rank - 1}.
              </p>
            )}
            <div className="amount-field">
              <span>₹</span>
              <input inputMode="numeric" value={amt} onChange={(e) => setTopAmount(Number(e.target.value.replace(/\D/g, "")) || 0)} aria-label="Top-up amount" />
            </div>
            <button className="btn btn-block" onClick={() => setPaying(true)} disabled={amt < MIN_AMOUNT}>
              Top up {inr(amt)} → #{newRank}
            </button>
          </section>
          <section className="card">
            <h3>Steal this spot</h3>
            <p className="muted small">List your own product above this one.</p>
            <Link className="btn btn-ghost btn-block" href={`/claim?amount=${p.amount + 1}${cat ? `&category=${cat.slug}` : ""}`}>
              Claim #{p.rank} for {inr(p.amount + 1)}
            </Link>
          </section>
          {history.length > 0 && (
            <section className="card">
              <h3>Payments</h3>
              <ul className="activity">
                {history.map((h) => (
                  <li key={h.id}>
                    {inr(h.amount)} <span className="muted">· {timeAgo(h.at)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>

      <PaymentModal
        open={paying}
        amount={amt}
        description={`Top up ${p.name} → rank #${newRank}`}
        onClose={() => setPaying(false)}
        onResult={(r) => {
          if (!r.ok) return;
          topUp(p.slug, amt);
          setPaying(false);
          setTopAmount(0);
          setToast(`Topped up ${inr(amt)} (payment ${r.paymentId}, simulated). ${p.name} is now #${newRank}.`);
        }}
      />
    </div>
  );
}
