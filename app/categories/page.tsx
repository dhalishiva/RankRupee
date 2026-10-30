"use client";

import Link from "next/link";
import { CATEGORIES } from "@/lib/data";
import { usd } from "@/lib/format";
import { useRanked } from "@/components/ui";

export default function Categories() {
  const { data } = useRanked();
  return (
    <div className="wrap page">
      <p className="eyebrow">Explore</p>
      <h1>Every <em>category</em></h1>
      <div className="cat-grid">
        {CATEGORIES.map((c) => {
          const items = (data ?? []).filter((p) => p.category === c.slug);
          const leader = items[0];
          return (
            <Link key={c.slug} href={`/category/${c.slug}`} className="card cat-card">
              <span className="cat-name">{c.name}</span>
              <span className="muted small">{data ? `${items.length} listed` : "…"}</span>
              <span className="cat-leader">
                {leader ? <>#1 <strong>{leader.name}</strong> · {usd(leader.total_cents)}</> : <>#1 is up for grabs</>}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
