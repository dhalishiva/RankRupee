"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
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

// ---- one shared search query for the whole site ----
let query = "";
const listeners = new Set<() => void>();
const setQuery = (q: string) => {
  query = q;
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useSearchQuery(): [string, (q: string) => void] {
  const q = useSyncExternalStore(subscribe, () => query, () => "");
  return [q, setQuery];
}

const showResults = () =>
  setTimeout(() => document.querySelector(".search-status")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);

const isBoardPath = (p: string) => p === "/" || p === "/today" || p.startsWith("/category/");

function Glass({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Search in the site header: full input on desktop, a magnifier that expands on mobile. */
export function HeaderSearch() {
  const [q, setQ] = useSearchQuery();
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const router = useRouter();
  const mobileInput = useRef<HTMLInputElement>(null);

  // leaving the boards clears the search so other pages aren't affected
  useEffect(() => {
    if (!isBoardPath(path) && query) setQuery("");
  }, [path]);

  useEffect(() => {
    if (open) mobileInput.current?.focus();
  }, [open]);

  const change = (v: string) => {
    setQ(v);
    if (v && !isBoardPath(path)) router.push("/");
  };

  const input = (ref?: React.Ref<HTMLInputElement>) => (
    <input
      ref={ref}
      type="search"
      value={q}
      onChange={(e) => change(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          change("");
          setOpen(false);
        }
        if (e.key === "Enter") {
          (e.target as HTMLInputElement).blur();
          setOpen(false);
          showResults();
        }
      }}
      placeholder="Search products…"
      aria-label="Search listings"
      enterKeyHint="search"
    />
  );

  return (
    <>
      <div className="hsearch hsearch-desktop" role="search">
        <span className="hsearch-icon"><Glass /></span>
        {input()}
        {q && <button className="hsearch-clear" onClick={() => change("")} aria-label="Clear search">×</button>}
      </div>

      <button className="hsearch-toggle" onClick={() => setOpen(true)} aria-label="Search">
        <Glass size={20} />
        {q && <span className="hsearch-dot" />}
      </button>

      {open && (
        <div className="hsearch-mobile" role="search">
          <span className="hsearch-icon"><Glass /></span>
          {input(mobileInput)}
          <button className="hsearch-close" onClick={() => { setOpen(false); if (q) showResults(); }} aria-label="Close search">
            {q ? "Done" : "Cancel"}
          </button>
        </div>
      )}
    </>
  );
}

/** Small "N results for …" line shown above a board while searching. */
export function SearchStatus({ count }: { count?: number }) {
  const [q, setQ] = useSearchQuery();
  if (!q) return null;
  return (
    <p className="search-status">
      {count === undefined ? "Searching…" : `${count} result${count === 1 ? "" : "s"} for “${q.trim()}”`}{" "}
      <button className="link-btn" onClick={() => setQ("")}>Clear</button>
    </p>
  );
}
