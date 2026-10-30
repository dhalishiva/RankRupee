"use client";

import Link from "next/link";
import { Board, BoardLayout, CategoryChips, EmptyBoard, useRanked } from "@/components/ui";
import { usd } from "@/lib/format";

export default function Home() {
  const { data, error, loading } = useRanked();
  const top = data?.[0];
  return (
    <>
      <section className="hero wrap">
        <p className="eyebrow">The public pay-to-rank leaderboard</p>
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
        <CategoryChips />
        <div className="tabs">
          <Link href="/" className="on">All-time</Link>
          <Link href="/today">Today</Link>
        </div>
      </div>
      <BoardLayout>
        <Board items={data} loading={loading} error={error} empty={<EmptyBoard />} />
      </BoardLayout>
    </>
  );
}
