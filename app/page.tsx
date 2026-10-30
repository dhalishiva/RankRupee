"use client";

import Link from "next/link";
import { Board, BoardLayout, CategoryChips } from "@/components/ui";
import { useStore } from "@/lib/store";
import { inr } from "@/lib/format";

export default function Home() {
  const { ranked, ready } = useStore();
  const top = ranked[0];
  return (
    <>
      <section className="hero wrap">
        <p className="eyebrow">India&apos;s public pay-to-rank leaderboard</p>
        <h1>
          Money talks. <em>Here it ranks.</em>
        </h1>
        <p className="lede">
          No ads, no algorithm, no follower count. Whoever pays the most sits at #1 — until someone pays ₹1 more.
          {ready && top && (
            <>
              {" "}Right now <Link href={`/product/${top.slug}`}>{top.name}</Link> holds the throne at {inr(top.amount)}.
            </>
          )}
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
        <Board items={ranked} />
      </BoardLayout>
    </>
  );
}
