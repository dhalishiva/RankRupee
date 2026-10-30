"use client";

import Link from "next/link";
import { CATEGORIES } from "@/lib/data";
import { inr } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function Categories() {
  const { ranked, ready } = useStore();
  return (
    <div className="wrap page">
      <p className="eyebrow">Explore</p>
      <h1>
        Every <em>category</em>
      </h1>
      <div className="cat-grid">
        {CATEGORIES.map((c) => {
          const items = ranked.filter((p) => p.category === c.slug);
          const leader = items[0];
          return (
            <Link key={c.slug} href={`/category/${c.slug}`} className="card cat-card">
              <span className="cat-name">{c.name}</span>
              <span className="muted small">{ready ? `${items.length} listed` : "…"}</span>
              <span className="cat-leader">
                {leader ? (
                  <>
                    #1 <strong>{leader.name}</strong> · {inr(leader.amount)}
                  </>
                ) : (
                  <>#1 is up for grabs</>
                )}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
