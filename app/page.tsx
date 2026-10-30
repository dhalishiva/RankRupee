"use client";

import Link from "next/link";
import { Board, BoardLayout, CategoryChips, EmptyBoard, useRanked } from "@/components/ui";
import { Spotlight } from "@/components/Spotlight";
import { OnlineBadge } from "@/components/Online";
import { matches, SearchStatus, useSearchQuery } from "@/components/Search";
import { usd } from "@/lib/format";

export default function Home() {
  const { data, error, loading } = useRanked();
  const top = data?.[0];
  const [q] = useSearchQuery();
  const items = data?.filter((p) => matches(p, q));
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
          ) : data ? (
            <> The board is empty, so #1 costs $1.</>
          ) : null}
        </p>
      </section>
      <div className="wrap">
        <Spotlight />
        <CategoryChips />
        <div className="toolbar">
          <div className="tabs">
            <Link href="/" className="on">All-time</Link>
            <Link href="/today">Today</Link>
          </div>
          <SearchStatus count={items?.length} />
        </div>
      </div>
      <BoardLayout>
        <Board
          key={q}
          items={items}
          loading={loading}
          error={error}
          empty={q && data?.length ? <p>No listing matches &ldquo;{q}&rdquo;. <Link href="/claim">Be the first →</Link></p> : <EmptyBoard />}
        />
      </BoardLayout>
    </>
  );
}
