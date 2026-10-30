"use client";

import { Suspense, use, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { categoryBySlug, MIN_CENTS, SITE } from "@/lib/data";
import { num, timeAgo, usd } from "@/lib/format";
import { fetchPayments, invalidate, recordClick, useData } from "@/lib/api";
import { ListingLogo, outbound, useRanked } from "@/components/ui";
import { Checkout } from "@/components/Checkout";

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return (
    <Suspense fallback={<div className="wrap page">Loading…</div>}>
      <ProductDetail slug={slug} />
    </Suspense>
  );
}

function ProductDetail({ slug }: { slug: string }) {
  const { data: ranked, reload } = useRanked();
  const payments = useData(`payments:${slug}`, () => fetchPayments(slug));
  const params = useSearchParams();
  const [welcome, setWelcome] = useState(params.get("welcome") === "1");
  const [topDollars, setTopDollars] = useState("");
  const [paying, setPaying] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  if (!ranked) return <div className="wrap page"><div className="card skeleton tall" /></div>;
  const p = ranked.find((r) => r.slug === slug);
  if (!p)
    return (
      <div className="wrap page prose">
        <h1>Listing not found</h1>
        <p>It may have been removed, or the link is wrong. If you just paid, give it a minute and refresh.</p>
        <Link href="/" className="btn">Back to the board</Link>
      </div>
    );

  const cat = categoryBySlug(p.category);
  const above = ranked.find((r) => r.rank === p.rank - 1);
  const toPass = above ? above.total_cents - p.total_cents + 100 : 0;
  const amt = topDollars ? Math.round(Number(topDollars) * 100) : Math.max(MIN_CENTS, toPass || MIN_CENTS);
  const newRank = ranked.filter((r) => r.slug !== p.slug && r.total_cents >= p.total_cents + amt).length + 1;
  const pageUrl = `${SITE.url}/product/${p.slug}`;

  const share = () => {
    const text = `${p.name} is #${p.rank} on Softing with ${usd(p.total_cents)}. Pay ${usd(p.total_cents + 100)} to take the spot 🦉`;
    window.open(`https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(pageUrl)}`, "_blank", "noopener");
  };

  return (
    <div className="wrap page">
      {welcome && (
        <div className="success card">
          <strong>You&apos;re on the board at #{p.rank}.</strong> A receipt is on its way from the payment provider. Share it before someone outbids you.{" "}
          <button className="link-btn" onClick={share}>Share on X →</button>{" "}
          <button className="link-btn muted" onClick={() => setWelcome(false)}>Dismiss</button>
        </div>
      )}
      {toast && <div className="success card">{toast}</div>}

      <div className="detail">
        <div className="detail-main card">
          <div className="detail-head">
            <span className={`rank rank-xl ${p.rank <= 3 ? `podium-${p.rank}` : ""}`}>#{p.rank}</span>
            <ListingLogo name={p.name} domain={p.domain} size={64} />
            <div>
              <h1 className="detail-title">{p.name}</h1>
              <p className="product-tagline">{p.tagline}</p>
            </div>
          </div>
          {p.description && <p className="detail-desc">{p.description}</p>}
          <dl className="facts">
            <div><dt>Total paid</dt><dd>{usd(p.total_cents)}</dd></div>
            <div><dt>Clicks</dt><dd>{num(p.clicks)}</dd></div>
            <div><dt>Category</dt><dd>{cat ? <Link href={`/category/${cat.slug}`}>{cat.short}</Link> : "—"}</dd></div>
            <div><dt>Listed</dt><dd>{timeAgo(p.created_at)}</dd></div>
            {p.maker_handle && <div><dt>Maker</dt><dd><a href={`https://x.com/${p.maker_handle}`} target="_blank" rel="noopener">@{p.maker_handle}</a></dd></div>}
          </dl>
          <div className="detail-actions">
            <a className="btn" href={outbound(p.url)} target="_blank" rel="noopener" onClick={() => recordClick(p.slug)}>Visit {p.domain} ↗</a>
            <button className="btn btn-ghost" onClick={share}>Share on X</button>
          </div>
        </div>

        <aside className="detail-side">
          <section className="card">
            <h3>Climb higher</h3>
            {p.rank === 1 ? (
              <p className="muted small">Already #1. Top up to build a cushion against challengers.</p>
            ) : (
              <p className="muted small">{usd(toPass)} more passes <strong>{above?.name}</strong> at #{p.rank - 1}.</p>
            )}
            <div className="amount-field">
              <span>$</span>
              <input inputMode="decimal" value={topDollars || String(amt / 100)} onChange={(e) => setTopDollars(e.target.value.replace(/[^\d.]/g, "").slice(0, 10))} aria-label="Top-up amount in USD" />
            </div>
            <button className="btn btn-block" onClick={() => setPaying(true)} disabled={!Number.isFinite(amt) || amt < MIN_CENTS}>
              Top up {Number.isFinite(amt) ? usd(amt) : ""} → #{newRank}
            </button>
            <p className="muted small">Anyone can top up any listing — handy for fans and teammates.</p>
          </section>
          <section className="card">
            <h3>Steal this spot</h3>
            <p className="muted small">List your own product above this one.</p>
            <Link className="btn btn-ghost btn-block" href={`/claim?amount=${p.total_cents + 100}${cat ? `&category=${cat.slug}` : ""}`}>
              Claim #{p.rank} for {usd(p.total_cents + 100)}
            </Link>
          </section>
          {payments.data && payments.data.length > 0 && (
            <section className="card">
              <h3>Payments</h3>
              <ul className="activity">
                {payments.data.map((h, i) => (
                  <li key={i}>{usd(h.amount_cents)} <span className="muted">· {h.kind === "topup" ? "top-up" : "listing"} · {timeAgo(h.paid_at)}</span></li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>

      <Checkout
        open={paying}
        amountCents={amt}
        title={`Top up ${p.name} → rank #${newRank}`}
        payload={{ kind: "topup", slug: p.slug }}
        onClose={() => setPaying(false)}
        onPaid={() => {
          setPaying(false);
          setTopDollars("");
          invalidate();
          reload();
          payments.reload();
          setToast(`Payment confirmed. ${p.name} just got ${usd(amt)} closer to the top.`);
        }}
      />
    </div>
  );
}
