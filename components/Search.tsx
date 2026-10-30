"use client";

import { categoryBySlug } from "@/lib/data";

export type Searchable = { name: string; tagline: string; domain: string; category: string; description?: string };

export function matches(p: Searchable, q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  const cat = categoryBySlug(p.category);
  return s
    .split(/\s+/)
    .every((w) =>
      [p.name, p.tagline, p.domain, p.description ?? "", cat?.name ?? ""].some((f) => f.toLowerCase().includes(w)),
    );
}

export function SearchBox({ value, onChange, count }: { value: string; onChange: (v: string) => void; count?: number }) {
  return (
    <div className="search">
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden className="search-icon">
        <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search products, taglines, websites…"
        aria-label="Search listings"
      />
      {value && (
        <>
          {count !== undefined && <span className="search-count">{count} found</span>}
          <button className="search-clear" onClick={() => onChange("")} aria-label="Clear search">×</button>
        </>
      )}
    </div>
  );
}
