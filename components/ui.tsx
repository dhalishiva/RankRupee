"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CATEGORIES, categoryBySlug, LAUNCH_DATE, MIN_AMOUNT } from "@/lib/data";
import { inr, num, timeAgo } from "@/lib/format";
import { Ranked, useStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export function Logo({ name, hue, size = 44 }: { name: string; hue: number; size?: number }) {
  return (
    <span
      className="logo"
      style={{ width: size, height: size, fontSize: size * 0.42, background: `hsl(${hue} 70% 88%)`, color: `hsl(${hue} 60% 28%)` }}
      aria-hidden
    >
      {name.trim().charAt(0).toUpperCase()}
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
    <>
      <div className="demo-banner">
        Demo mode · payments are simulated and most listings are samples. Nothing is charged.
      </div>
      <header className="site-header">
        <div className="wrap header-inner">
          <Link href="/" className="brand">
            <span className="brand-mark">₹</span>
            <span>
              Rank<em>Rupee</em>
            </span>
          </Link>
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
    </>
  );
}

export function CategoryChips({ active }: { active?: string }) {
  return (
    <div className="chips" role="navigation" aria-label="Categories">
      <Link href="/" className={`chip ${!active ? "on" : ""}`}>
        All
      </Link>
      {CATEGORIES.map((c) => (
        <Link key={c.slug} href={`/category/${c.slug}`} className={`chip ${active === c.slug ? "on" : ""}`} title={c.name}>
          {c.short}
        </Link>
      ))}
    </div>
  );
}

export function ClaimBox({ category }: { category?: string }) {
  const { ranked, ready } = useStore();
  const router = useRouter();
  const top = ranked[0]?.amount ?? 0;
  const suggested = Math.max(MIN_AMOUNT, top + 1);
  const [amount, setAmount] = useState<number | null>(null);
  const [cat, setCat] = useState(category ?? "");
  const value = amount ?? suggested;
  const step = value >= 10000 ? 1000 : value >= 1000 ? 100 : 10;

  return (
    <section className="card claim-box">
      <h2>
        Claim #1 for <span className="amount-big">{ready ? inr(value) : "…"}</span>
      </h2>
      <div className="stepper">
        <button type="button" onClick={() => setAmount(Math.max(MIN_AMOUNT, value - step))} aria-label="Decrease amount">
          −
        </button>
        <label className="stepper-input">
          <span>₹</span>
          <input
            inputMode="numeric"
            value={ready ? value : ""}
            onChange={(e) => setAmount(Number(e.target.value.replace(/\D/g, "")) || MIN_AMOUNT)}
            aria-label="Amount in rupees"
          />
        </label>
        <button type="button" onClick={() => setAmount(value + step)} aria-label="Increase amount">
          +
        </button>
      </div>
      <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category">
        <option value="">Choose a category</option>
        {CATEGORIES.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="btn btn-block"
        onClick={() => router.push(`/claim?amount=${value}${cat ? `&category=${cat}` : ""}`)}
      >
        Claim rank
      </button>
      <p className="muted small">Pay ₹1 more than anyone above you and you jump past them. Minimum {inr(MIN_AMOUNT)}.</p>
    </section>
  );
}

export function TodayMini() {
  const { today, ready } = useStore();
  return (
    <section className="card">
      <div className="card-head">
        <h3>Today&apos;s ranking</h3>
        <Link href="/today" className="link-sm">
          See all →
        </Link>
      </div>
      {!ready ? (
        <p className="muted small">Loading…</p>
      ) : today.length === 0 ? (
        <p className="muted small">Nobody has claimed today yet. Be first.</p>
      ) : (
        <ol className="mini-list">
          {today.slice(0, 3).map((p) => (
            <li key={p.slug}>
              <span className="mini-rank">#{p.rank}</span>
              <Link href={`/product/${p.slug}`} className="mini-name">
                {p.name}
              </Link>
              <span className="mini-amt">{inr(p.amount)}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function ActivityFeed() {
  const { activity, ready } = useStore();
  const [n, setN] = useState(5);
  return (
    <section className="card">
      <h3>Latest activity</h3>
      {!ready ? (
        <p className="muted small">Loading…</p>
      ) : (
        <>
          <ul className="activity">
            {activity.slice(0, n).map((a) => (
              <li key={a.id}>
                <Link href={`/product/${a.slug}`}>{a.name}</Link>
                <span className="muted">
                  {" "}
                  at #{a.rankAfter} · {inr(a.amount)} · {timeAgo(a.at)}
                </span>
              </li>
            ))}
          </ul>
          {activity.length > n && (
            <button className="link-btn" onClick={() => setN(n + 10)}>
              Show more
            </button>
          )}
        </>
      )}
    </section>
  );
}

export function ProductCard({ p, displayRank }: { p: Ranked; displayRank?: number }) {
  const { recordClick } = useStore();
  const cat = categoryBySlug(p.category);
  const rank = displayRank ?? p.rank;
  const href = p.url ? `${p.url}${p.url.includes("?") ? "&" : "?"}utm_source=rankrupee` : `/product/${p.slug}`;
  const external = Boolean(p.url);
  return (
    <li className={`product ${rank <= 3 ? `podium podium-${rank}` : ""}`}>
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener" : undefined}
        className="product-main"
        onClick={() => recordClick(p.slug)}
      >
        <span className="rank">#{rank}</span>
        <Logo name={p.name} hue={p.hue} />
        <span className="product-text">
          <span className="product-name">
            {p.name}
            {p.sample && <span className="tag">sample</span>}
            {p.mine && <span className="tag tag-mine">yours</span>}
          </span>
          <span className="product-tagline">{p.tagline}</span>
          <span className="product-desc">{p.description}</span>
        </span>
        <span className="product-amount">{inr(p.amount)}</span>
      </a>
      <div className="product-meta">
        {cat && <Link href={`/category/${cat.slug}`}>{cat.short}</Link>}
        <span>·</span>
        <span>{timeAgo(p.createdAt)}</span>
        <span>·</span>
        <span>{p.domain}</span>
        <span>·</span>
        <span>{num(p.clicks)} clicks</span>
        <span>·</span>
        <Link href={`/product/${p.slug}`}>details</Link>
        <Link href={`/claim?amount=${p.amount + 1}`} className="steal">
          claim this rank for {inr(p.amount + 1)}
        </Link>
      </div>
    </li>
  );
}

const PAGE = 20;

export function Board({ items, emptyText, rerank }: { items: Ranked[]; emptyText?: string; rerank?: boolean }) {
  const { ready } = useStore();
  const [page, setPage] = useState(0);
  if (!ready) return <BoardSkeleton />;
  if (items.length === 0) return <p className="empty">{emptyText ?? "Nothing here yet."}</p>;
  const pages = Math.ceil(items.length / PAGE);
  const slice = items.slice(page * PAGE, page * PAGE + PAGE);
  return (
    <>
      <ol className="board">
        {slice.map((p, i) => (
          <ProductCard key={p.slug} p={p} displayRank={rerank ? page * PAGE + i + 1 : undefined} />
        ))}
      </ol>
      {pages > 1 && (
        <div className="pager">
          {Array.from({ length: pages }, (_, i) => (
            <button key={i} className={i === page ? "on" : ""} onClick={() => { setPage(i); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
              {i + 1}
            </button>
          ))}
          <span className="muted small">
            {page * PAGE + 1}–{Math.min(items.length, (page + 1) * PAGE)} of {items.length}
          </span>
        </div>
      )}
    </>
  );
}

function BoardSkeleton() {
  return (
    <ol className="board">
      {Array.from({ length: 6 }, (_, i) => (
        <li key={i} className="product skeleton" />
      ))}
    </ol>
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
  const { ranked, ready, resetDemo } = useStore();
  const total = ranked.reduce((s, p) => s + p.amount, 0);
  const days = ready ? Math.max(1, Math.ceil((Date.now() - LAUNCH_DATE) / 86400_000)) : 0;
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="stats">
          <div>
            <strong>{ready ? num(ranked.length) : "…"}</strong>
            <span>products listed</span>
          </div>
          <div>
            <strong>{ready ? inr(total) : "…"}</strong>
            <span>pledged (demo)</span>
          </div>
          <div>
            <strong>{ready ? `Day ${days}` : "…"}</strong>
            <span>since launch</span>
          </div>
        </div>
        <p className="muted small">
          Built in Noida by <a href="https://x.com/dhalishiva" target="_blank" rel="noopener">@dhalishiva</a> · a{" "}
          <a href="https://kriosity.in" target="_blank" rel="noopener">Kriosity</a> project
        </p>
        <p className="muted small footer-links">
          <Link href="/rules">Rules</Link> · <Link href="/faq">FAQ</Link> · <Link href="/about">About</Link> ·{" "}
          <button className="link-btn" onClick={() => { if (confirm("Clear your demo claims from this browser?")) resetDemo(); }}>
            Reset demo data
          </button>
        </p>
      </div>
    </footer>
  );
}
