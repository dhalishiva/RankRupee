"use client";

import Link from "next/link";
import { Spotlight } from "@/components/Spotlight";
import { matches, SearchStatus, useSearchQuery } from "@/components/Search";
import { BoardLayout, BoardSkeleton, CategoryChips, EmptyBoard, ProductCard } from "@/components/ui";
import { fetchToday, useData } from "@/lib/api";

export default function Today() {
  const { data, error } = useData("today", fetchToday);
  const [q] = useSearchQuery();
  const items = data?.filter((p) => matches(p, q));
  return (
    <>
      <section className="hero hero-sm wrap">
        <p className="eyebrow">Resets at midnight UTC</p>
        <h1>Today&apos;s <em>ranking</em></h1>
        <p className="lede">Ranked only by what each listing paid today. The cheapest way onto a front page.</p>
      </section>
      <div className="wrap">
        <Spotlight />
        <CategoryChips />
        <div className="toolbar">
          <div className="tabs">
            <Link href="/">All-time</Link>
            <Link href="/today" className="on">Today</Link>
          </div>
          <SearchStatus count={items?.length} />
        </div>
      </div>
      <BoardLayout>
        {error && !data ? (
          <p className="empty">Couldn&apos;t load today&apos;s board. Refresh to try again.</p>
        ) : !data ? (
          <BoardSkeleton />
        ) : data.length === 0 ? (
          <div className="empty"><EmptyBoard text="No payments yet today." /></div>
        ) : items && items.length === 0 ? (
          <p className="empty">No listing today matches &ldquo;{q}&rdquo;.</p>
        ) : (
          <ol className="board">
            {(items ?? []).map((p) => (
              <ProductCard key={p.slug} p={p} displayRank={p.rank} amountCents={p.today_cents} />
            ))}
          </ol>
        )}
      </BoardLayout>
    </>
  );
}
