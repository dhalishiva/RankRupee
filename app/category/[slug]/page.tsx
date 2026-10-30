"use client";

import { use } from "react";
import Link from "next/link";
import { Board, BoardLayout, CategoryChips, EmptyBoard, useRanked } from "@/components/ui";
import { categoryBySlug } from "@/lib/data";

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const cat = categoryBySlug(slug);
  const { data, error, loading } = useRanked();
  if (!cat)
    return (
      <div className="wrap page">
        <h1>Category not found</h1>
        <Link href="/categories">See all categories →</Link>
      </div>
    );
  const items = data?.filter((p) => p.category === slug);
  return (
    <>
      <section className="hero hero-sm wrap">
        <p className="eyebrow">Category</p>
        <h1><em>{cat.name}</em></h1>
        <p className="lede">Numbers here are category ranks. Each listing page shows its overall rank.</p>
      </section>
      <div className="wrap">
        <CategoryChips active={slug} />
      </div>
      <BoardLayout category={slug}>
        <Board items={items} loading={loading} error={error} rerank empty={<EmptyBoard text={`No one has claimed ${cat.short} yet.`} />} />
      </BoardLayout>
    </>
  );
}
