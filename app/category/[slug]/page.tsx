"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Board, BoardLayout, CategoryChips, EmptyBoard, useRanked } from "@/components/ui";
import { categoryBySlug } from "@/lib/data";
import { matches, SearchBox } from "@/components/Search";

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const cat = categoryBySlug(slug);
  const { data, error, loading } = useRanked();
  const [q, setQ] = useState("");
  if (!cat)
    return (
      <div className="wrap page">
        <h1>Category not found</h1>
        <Link href="/categories">See all categories →</Link>
      </div>
    );
  // category rank is fixed before searching, so a search keeps each listing's real position
  const inCat = data?.filter((p) => p.category === slug).map((p, i) => ({ ...p, rank: i + 1 }));
  const items = inCat?.filter((p) => matches(p, q));
  return (
    <>
      <section className="hero hero-sm wrap">
        <p className="eyebrow">Category</p>
        <h1><em>{cat.name}</em></h1>
        <p className="lede">Numbers here are category ranks. Each listing page shows its overall rank.</p>
      </section>
      <div className="wrap">
        <CategoryChips active={slug} />
        <div className="toolbar">
          <span />
          <SearchBox value={q} onChange={setQ} count={q ? items?.length : undefined} />
        </div>
      </div>
      <BoardLayout category={slug}>
        <Board
          key={q}
          items={items}
          loading={loading}
          error={error}
          empty={q && inCat?.length ? <p>No {cat.short} listing matches &ldquo;{q}&rdquo;.</p> : <EmptyBoard text={`No one has claimed ${cat.short} yet.`} />}
        />
      </BoardLayout>
    </>
  );
}
