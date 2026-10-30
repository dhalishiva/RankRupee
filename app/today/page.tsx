"use client";

import Link from "next/link";
import { Board, BoardLayout, CategoryChips } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function Today() {
  const { today } = useStore();
  return (
    <>
      <section className="hero hero-sm wrap">
        <p className="eyebrow">Resets at midnight IST</p>
        <h1>
          Today&apos;s <em>ranking</em>
        </h1>
        <p className="lede">Only listings claimed or topped up since 12:00 AM India time. Cheapest way onto a front page.</p>
      </section>
      <div className="wrap">
        <CategoryChips />
        <div className="tabs">
          <Link href="/">All-time</Link>
          <Link href="/today" className="on">Today</Link>
        </div>
      </div>
      <BoardLayout>
        <Board items={today} rerank emptyText="No claims yet today. The #1 spot is wide open." />
      </BoardLayout>
    </>
  );
}
