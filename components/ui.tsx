"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES, categoryBySlug, Listing, MIN_CENTS, SITE } from "@/lib/data";
import { num, timeAgo, usd } from "@/lib/format";
import { fetchActivity, fetchRanked, fetchStats, fetchToday, recordClick, useData } from "@/lib/api";
import { HeaderSearch } from "./Search";

export function Owl({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden className="owl">
      <path d="M7 9 L13 15 L20 12 L27 15 L33 9 L33 27 Q33 37 20 37 Q7 37 7 27 Z" fill="var(--ink)" />
      <circle cx="14" cy="21" r="5.6" fill="var(--paper)" />
      <circle cx="26" cy="21" r="5.6" fill="var(--paper)" />
      <circle cx="14.8" cy="21.4" r="2.6" fill="var(--ink)" />
      <circle cx="26.8" cy="21.4" r="2.6" fill="var(--ink)" />
      <circle cx="15.6" cy="20.4" r="0.9" fill="var(--paper)" />
      <circle cx="27.6" cy="20.4" r="0.9" fill="var(--paper)" />
      <path d="M18 26 L22 26 L20 30 Z" fill="var(--accent)" />
    </svg>
  );
}

export function ListingLogo({ name, domain, size = 44 }: { name: string; domain: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return (
    <span className="logo" style={{ width: size, height: size, fontSize: size * 0.42, background: `hsl(${h} 70% 88%)`, color: `hsl(${h} 60% 28%)` }} aria-hidden>
      {failed || !domain ? (
        name.trim().charAt(0).toUpperCase()
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`} alt="" width={size * 0.62} height={size * 0.62} onError={() => setFailed(true)} loading="lazy" />
      )}
    </span>
  );
}

export function SiteHeader() {
  const path = usePathname();
  const nav = [
    { href: "/today", label: "Today" },
    { href: "/categories", label: "Categories" },
    { href: "/about", label: "About" },
    { href: "/rules", label: "Rules" },
  ];
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link href="/" className="brand" aria-label="Softing home">
          <Owl />
          <span>Softing</span>
        </Link>
        <HeaderSearch />
        <nav className="nav">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className={path === n.href ? "active" : ""}>
              {n.label}
            </Link>
          ))}
          <Link href="/claim" className="btn btn-sm">
            Claim a rank
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function CategoryChips({ active }: { active?: string }) {
  return (
    <div className="chips" role="navigation" aria-label="Categories">
      <Link href="/" className={`chip ${!active ? "on" : ""}`}>All</Link>
      {CATEGORIES.map((c) => (
        <Link key={c.slug} href={`/category/${c.slug}`} className={`chip ${active === c.slug ? "on" : ""}`} title={c.name}>
          {c.short}
        </Link>
      ))}
    </div>
  );
}

export function useRanked() {
  return useData("ranked", fetchRanked);
}

export function ClaimBox({ category }: { category?: string }) {
  const { data } = useRanked();
  const router = useRouter();
  const top = data?.[0]?.total_cents ?? 0;
  const minDollars = Math.max(MIN_CENTS, top + 100) / 100; // #1 needs current #1 + $1
  const [raw, setRaw] = useState<string | null>(null); // what the user typed; null = follow the minimum
  const [cat, setCat] = useState(category ?? "");
  const typed = raw === null ? minDollars : Number(raw);
  const tooLow = raw !== null && (!Number.isFinite(typed) || typed < minDollars);
  // if someone outbids while this page is open, never offer less than the new minimum
  const value = Math.max(minDollars, Number.isFinite(typed) ? typed : minDollars);
  const step = value >= 10000 ? 1000 : value >= 1000 ? 100 : value >= 100 ? 10 : 1;
  const ready = data !== undefined;
  const set = (n: number) => setRaw(String(Math.max(minDollars, Math.ceil(n))));

  return (
    <section className="card claim-box">
      <h2>
        Claim #1 for <span className="amount-big">{ready ? usd(Math.round(value * 100)) : "…"}</span>
      </h2>
      <div className="stepper">
        <button type="button" onClick={() => set(value - step)} disabled={!ready || value <= minDollars} aria-label="Decrease amount">−</button>
        <label className={`stepper-input ${tooLow ? "invalid" : ""}`}>
          <span>$</span>
          <input
            inputMode="numeric"
            value={ready ? (raw ?? String(minDollars)) : ""}
            onChange={(e) => setRaw(e.target.value.replace(/[^\d]/g, "").slice(0, 9))}
            onBlur={() => raw !== null && set(Number(raw) || minDollars)}
            aria-label="Amount in US dollars"
            aria-invalid={tooLow}
          />
        </label>
        <button type="button" onClick={() => set(value + step)} disabled={!ready} aria-label="Increase amount">+</button>
      </div>
      {tooLow && <p className="error small">To take #1 you need at least {usd(minDollars * 100)} (current #1 + $1).</p>}
      <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category">
        <option value="">Choose a category</option>
        {CATEGORIES.map((c) => (
          <option key={c.slug} value={c.slug}>{c.name}</option>
        ))}
      </select>
      <button
        type="button"
        className="btn btn-block"
        disabled={!ready || tooLow}
        onClick={() => router.push(`/claim?amount=${Math.round(value * 100)}&target=1${cat ? `&category=${cat}` : ""}`)}
      >
        Claim #1
      </button>
      <p className="muted small">
        {top ? <>Current #1 paid {usd(top)}. </> : null}Pay $1 more than the listing above you and you jump past it. India pays in ₹ via UPI and cards.
      </p>
    </section>
  );
}

export function TodayMini() {
  const { data } = useData("today", fetchToday);
  return (
    <section className="card">
      <div className="card-head">
        <h3>Today&apos;s ranking</h3>
        <Link href="/today" className="link-sm">See all →</Link>
      </div>
      {!data ? (
        <p className="muted small">Loading…</p>
      ) : data.length === 0 ? (
        <p className="muted small">No one has paid today yet. Today&apos;s #1 costs $1.</p>
      ) : (
        <ol className="mini-list">
          {data.slice(0, 3).map((p) => (
            <li key={p.slug}>
              <span className="mini-rank">#{p.rank}</span>
              <Link href={`/product/${p.slug}`} className="mini-name">{p.name}</Link>
              <span className="mini-amt">{usd(p.today_cents)}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function ActivityFeed() {
  const [n, setN] = useState(5);
  const { data } = useData("activity", () => fetchActivity(40));
  return (
    <section className="card">
      <h3>Latest activity</h3>
      {!data ? (
        <p className="muted small">Loading…</p>
      ) : data.length === 0 ? (
        <p className="muted small">Nothing yet. The first payment shows up here.</p>
      ) : (
        <>
          <ul className="activity">
            {data.slice(0, n).map((a, i) => (
              <li key={`${a.slug}-${a.paid_at}-${i}`}>
                <Link href={`/product/${a.slug}`}>{a.name}</Link>
                <span className="muted"> {a.kind === "topup" ? "topped up" : "joined"} · {usd(a.amount_cents)} · {timeAgo(a.paid_at)}</span>
              </li>
            ))}
          </ul>
          {data.length > n && <button className="link-btn" onClick={() => setN(n + 10)}>Show more</button>}
        </>
      )}
    </section>
  );
}

export const outbound = (url: string) => `${url}${url.includes("?") ? "&" : "?"}ref=softing`;

export function ProductCard({ p, displayRank, amountCents }: { p: Pick<Listing, "slug" | "name" | "tagline" | "domain" | "category"> & Partial<Listing>; displayRank: number; amountCents: number }) {
  const cat = categoryBySlug(p.category);
  return (
    <li className={`product ${displayRank <= 3 ? `podium podium-${displayRank}` : ""}`}>
      <a href={p.url ? outbound(p.url) : `/product/${p.slug}`} target={p.url ? "_blank" : undefined} rel={p.url ? "noopener" : undefined} className="product-main" onClick={() => p.url && recordClick(p.slug)}>
        <span className="rank">#{displayRank}</span>
        <ListingLogo name={p.name} domain={p.domain} />
        <span className="product-text">
          <span className="product-name">{p.name}</span>
          <span className="product-tagline">{p.tagline}</span>
          {p.description && <span className="product-desc">{p.description}</span>}
        </span>
        <span className="product-amount">{usd(amountCents)}</span>
      </a>
      <div className="product-meta">
        {cat && <Link href={`/category/${cat.slug}`}>{cat.short}</Link>}
        {p.created_at && (<><span>·</span><span>{timeAgo(p.created_at)}</span></>)}
        <span>·</span>
        <span>{p.domain}</span>
        {p.clicks !== undefined && (<><span>·</span><span>{num(p.clicks)} clicks</span></>)}
        <span>·</span>
        <Link href={`/product/${p.slug}`}>details</Link>
        {p.total_cents !== undefined && (
          <Link href={`/claim?amount=${p.total_cents + 100}`} className="steal">claim this rank for {usd(p.total_cents + 100)}</Link>
        )}
      </div>
    </li>
  );
}

const PAGE = 25;

export function Board({ items, loading, error, empty, rerank }: { items: Listing[] | undefined; loading?: boolean; error?: string | null; empty: React.ReactNode; rerank?: boolean }) {
  const [page, setPage] = useState(0);
  if (error && !items) return <p className="empty">Couldn&apos;t load the board. Refresh to try again.</p>;
  if (loading || !items) return <BoardSkeleton />;
  if (items.length === 0) return <div className="empty">{empty}</div>;
  const pages = Math.ceil(items.length / PAGE);
  const slice = items.slice(page * PAGE, page * PAGE + PAGE);
  return (
    <>
      <ol className="board">
        {slice.map((p, i) => (
          <ProductCard key={p.slug} p={p} displayRank={rerank ? page * PAGE + i + 1 : p.rank} amountCents={p.total_cents} />
        ))}
      </ol>
      {pages > 1 && (
        <div className="pager">
          {Array.from({ length: pages }, (_, i) => (
            <button key={i} className={i === page ? "on" : ""} onClick={() => { setPage(i); window.scrollTo({ top: 0, behavior: "smooth" }); }}>{i + 1}</button>
          ))}
          <span className="muted small">{page * PAGE + 1}–{Math.min(items.length, (page + 1) * PAGE)} of {items.length}</span>
        </div>
      )}
    </>
  );
}

export function BoardSkeleton() {
  return (
    <ol className="board">
      {Array.from({ length: 5 }, (_, i) => <li key={i} className="product skeleton" />)}
    </ol>
  );
}

export function EmptyBoard({ text = "The board is empty." }: { text?: string }) {
  return (
    <>
      <Owl size={56} />
      <p><strong>{text}</strong></p>
      <p className="muted">Whoever pays first takes #1, for as little as $1.</p>
      <Link href="/claim" className="btn">Take #1 now</Link>
    </>
  );
}

export function BoardLayout({ children, category }: { children: React.ReactNode; category?: string }) {
  return (
    <div className="wrap layout">
      <div className="main-col">{children}</div>
      <aside className="side-col">
        <ClaimBox category={category} />
        <TodayMini />
        <ActivityFeed />
      </aside>
    </div>
  );
}

export function SiteFooter() {
  const { data } = useData("stats", fetchStats);
  const days = Math.max(1, Math.ceil((Date.now() - SITE.launch) / 86400_000));
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="stats">
          <div><strong>{data ? num(data.listings) : "…"}</strong><span>products listed</span></div>
          <div><strong>{data ? usd(data.total_cents) : "…"}</strong><span>paid to rank</span></div>
          <div><strong suppressHydrationWarning>Day {days}</strong><span>since launch</span></div>
        </div>
        <p className="muted small">
          Softing is a product of <a href="https://kriosity.in" target="_blank" rel="noopener">Kriosity</a>, built by {SITE.owner}.
        </p>
        <p className="muted small footer-links">
          <Link href="/about">About</Link> · <Link href="/rules">Rules</Link> · <Link href="/faq">FAQ</Link> ·{" "}
          <Link href="/terms">Terms</Link> · <Link href="/privacy">Privacy</Link> · <Link href="/refund-policy">Refunds</Link> ·{" "}
          <Link href="/delivery-policy">Delivery</Link> · <Link href="/contact">Contact</Link>
        </p>
      </div>
    </footer>
  );
}

export function WhatsAppButton() {
  const text = encodeURIComponent("Hi! I have a question about Softing.");
  return (
    <a className="wa-fab" href={`https://wa.me/${SITE.whatsapp}?text=${text}`} target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp" title="Chat with us on WhatsApp">
      <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
        <path d="M12 3C6.9 3 3 6.6 3 11.2c0 2.3 1 4.4 2.7 5.9L5 21l4.2-1.9c.9.3 1.8.4 2.8.4 5.1 0 9-3.6 9-8.2S17.1 3 12 3z" fill="#fff" />
        <circle cx="8.5" cy="11.3" r="1.2" fill="#1fae5b" />
        <circle cx="12" cy="11.3" r="1.2" fill="#1fae5b" />
        <circle cx="15.5" cy="11.3" r="1.2" fill="#1fae5b" />
      </svg>
      <span className="wa-label">Chat with us</span>
    </a>
  );
}
