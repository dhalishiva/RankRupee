"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Board, BoardLayout, BoardSkeleton, CategoryChips, EmptyBoard, ProductCard, useRanked } from "./ui";
import { OnlineBadge } from "./Online";
import { matches, SearchStatus, useSearchQuery } from "./Search";
import { fetchToday, useData } from "@/lib/api";
import { CATEGORIES, MIN_CENTS } from "@/lib/data";
import { usd } from "@/lib/format";

export type Mode = "all" | "today";

/** Home + /today: one page with an All-time / Today toggle that swaps the claim target and the list. */
export function HomeBoard({ initialMode }: { initialMode: Mode }) {
  const [mode, setModeState] = useState<Mode>(initialMode);
  const ranked = useRanked();
  const today = useData("today", fetchToday);
  const [q] = useSearchQuery();

  // keep the URL in step (/ or /today) without reloading the page
  const setMode = (m: Mode) => {
    setModeState(m);
    try {
      window.history.replaceState(null, "", m === "today" ? "/today" : "/");
    } catch {
      /* ignore */
    }
  };

  const top = ranked.data?.[0];
  const allItems = ranked.data?.filter((p) => matches(p, q));
  const todayItems = today.data?.filter((p) => matches(p, q));
  const count = mode === "all" ? allItems?.length : todayItems?.length;

  return (
    <>
      <section className="hero wrap">
        <div className="eyebrow-row">
          <p className="eyebrow">The public pay-to-rank leaderboard</p>
          <OnlineBadge />
        </div>
        <h1>
          Money talks. <em>Here it ranks.</em>
        </h1>
        <p className="lede">
          No ads, no algorithm, no upvote rings. Whoever pays the most sits at #1 — until someone pays $1 more.
          {top ? (
            <> Right now <Link href={`/product/${top.slug}`}>{top.name}</Link> holds #1 at {usd(top.total_cents)}.</>
          ) : ranked.data ? (
            <> The board is empty, so #1 costs $1.</>
          ) : null}
        </p>
      </section>

      <div className="wrap">
        <ClaimBar
          mode={mode}
          setMode={setMode}
          minCents={
            mode === "all"
              ? Math.max(MIN_CENTS, (ranked.data?.[0]?.total_cents ?? 0) + 100)
              : Math.max(MIN_CENTS, (today.data?.[0]?.today_cents ?? 0) + 100)
          }
          ready={mode === "all" ? ranked.data !== undefined : today.data !== undefined}
          holder={mode === "all" ? ranked.data?.[0]?.name : today.data?.[0]?.name}
        />
        <CategoryChips />
        <SearchStatus count={count} />
      </div>

      <BoardLayout hideClaim>
        {mode === "all" ? (
          <Board
            key={`all-${q}`}
            items={allItems}
            loading={ranked.loading}
            error={ranked.error}
            empty={q && ranked.data?.length ? <p>No listing matches &ldquo;{q}&rdquo;.</p> : <EmptyBoard />}
          />
        ) : today.error && !today.data ? (
          <p className="empty">Couldn&apos;t load today&apos;s board. Refresh to try again.</p>
        ) : !today.data ? (
          <BoardSkeleton />
        ) : today.data.length === 0 ? (
          <div className="empty"><EmptyBoard text="No payments yet today. Today's #1 costs $1." /></div>
        ) : todayItems && todayItems.length === 0 ? (
          <p className="empty">No listing today matches &ldquo;{q}&rdquo;.</p>
        ) : (
          <>
            <p className="muted small board-note">Ranked by what each listing paid today (resets at midnight UTC).</p>
            <ol className="board">
              {(todayItems ?? []).map((p) => (
                <ProductCard key={p.slug} p={p} displayRank={p.rank} amountCents={p.today_cents} />
              ))}
            </ol>
          </>
        )}
      </BoardLayout>
    </>
  );
}

function ClaimBar({ mode, setMode, minCents, ready, holder }: { mode: Mode; setMode: (m: Mode) => void; minCents: number; ready: boolean; holder?: string }) {
  const router = useRouter();
  const min = minCents / 100;
  const [raw, setRaw] = useState<string | null>(null);
  const [cat, setCat] = useState("");

  // switching tabs (or someone outbidding) resets to the new minimum
  useEffect(() => setRaw(null), [mode]);

  const typed = raw === null ? min : Number(raw);
  const tooLow = raw !== null && (!Number.isFinite(typed) || typed < min);
  const value = Math.max(min, Number.isFinite(typed) ? typed : min);
  const step = value >= 10000 ? 1000 : value >= 1000 ? 100 : value >= 100 ? 10 : 1;
  const set = (n: number) => setRaw(String(Math.max(min, Math.ceil(n))));

  const claim = () => {
    if (!ready || tooLow) return;
    router.push(`/claim?amount=${Math.round(value * 100)}&target=${mode === "all" ? "1" : "today"}${cat ? `&category=${cat}` : ""}`);
  };

  return (
    <section className="claimbar" aria-label="Claim the top spot">
      <div className="mode-toggle" role="tablist" aria-label="Board">
        <button role="tab" aria-selected={mode === "all"} className={mode === "all" ? "on" : ""} onClick={() => setMode("all")}>
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
            <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          All-time
        </button>
        <button role="tab" aria-selected={mode === "today"} className={mode === "today" ? "on" : ""} onClick={() => setMode("today")}>
          <span className="live-dot" />
          Today
        </button>
      </div>

      <h2 className="claimbar-title">
        <span>{mode === "all" ? "Claim #1 for" : "Claim today's #1 for"}</span>
        <span className="claimbar-amount">
          <button type="button" className="round-btn" onClick={() => set(value - step)} disabled={!ready || value <= min} aria-label="Decrease amount">−</button>
          <span className={`amount-edit ${tooLow ? "invalid" : ""}`}>
            $
            <input
              inputMode="numeric"
              value={ready ? (raw ?? String(min)) : ""}
              style={{ width: `${Math.max(1, (ready ? (raw ?? String(min)) : "").length) + 0.2}ch` }}
              onChange={(e) => setRaw(e.target.value.replace(/[^\d]/g, "").slice(0, 9))}
              onBlur={() => raw !== null && set(Number(raw) || min)}
              onKeyDown={(e) => e.key === "Enter" && claim()}
              aria-label="Amount in US dollars"
            />
          </span>
          <button type="button" className="round-btn" onClick={() => set(value + step)} disabled={!ready} aria-label="Increase amount">+</button>
        </span>
      </h2>

      {tooLow ? (
        <p className="error small center">Minimum is {usd(minCents)} — {mode === "all" ? "current #1" : "today's top"} + $1.</p>
      ) : (
        <p className="muted small center">
          {holder ? <>Beats <strong>{holder}</strong>{mode === "all" ? " for the top spot" : " on today's board"}. </> : <>The spot is empty. </>}
          India pays in ₹ via UPI.
        </p>
      )}

      <div className="claimbar-row">
        <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category">
          <option value="">Choose a category</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <button type="button" className="btn btn-lg" onClick={claim} disabled={!ready || tooLow}>
          Claim rank
        </button>
      </div>
    </section>
  );
}
