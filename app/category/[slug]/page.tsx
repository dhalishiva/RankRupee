"use client";

import { use } from "react";
import Link from "next/link";
import { Board, BoardLayout, CategoryChips } from "@/components/ui";
import { categoryBySlug } from "@/lib/data";
import { useStore } from "@/lib/store";

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const cat = categoryBySlug(slug);
  const { ranked } = useStore();
  if (!cat)
    return (
      <div className="wrap page">
        <h1>Category not found</h1>
        <Link href="/categories">See all categories →</Link>
      </div>
    );
  const items = ranked.filter((p) => p.category === slug);
  return (
    <>
      <section className="hero hero-sm wrap">
        <p className="eyebrow">Category</p>
        <h1>
          <em>{cat.name}</em>
        </h1>
        <p className="lede">Ranks shown here are category ranks. The overall rank is on each listing.</p>
      </section>
      <div className="wrap">
        <CategoryChips active={slug} />
      </div>
      <BoardLayout category={slug}>
        <Board items={items} rerank emptyText="No one has claimed this category yet. Take #1 for the minimum." />
      </BoardLayout>
    </>
  );
}
