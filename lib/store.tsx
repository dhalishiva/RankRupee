"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Activity, buildSeed, domainOf, hueFor, Product, slugify } from "./data";
import { startOfTodayIST } from "./format";

const KEY = "rankrupee:v1";

type Saved = {
  added: Product[];
  topups: Record<string, number>;
  clicks: Record<string, number>;
  activity: Activity[];
};

const empty: Saved = { added: [], topups: {}, clicks: {}, activity: [] };

function load(): Saved {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw);
    return { ...empty, ...parsed };
  } catch {
    return empty;
  }
}

function save(s: Saved) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable — demo keeps working in memory */
  }
}

export type Ranked = Product & { rank: number };

export type NewListing = {
  url: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  maker?: string;
};

type Store = {
  ready: boolean;
  ranked: Ranked[];
  today: Ranked[];
  activity: Activity[];
  bySlug: (slug: string) => Ranked | undefined;
  rankForAmount: (amount: number, excludeSlug?: string) => number;
  addListing: (l: NewListing, amount: number) => string;
  topUp: (slug: string, amount: number) => void;
  recordClick: (slug: string) => void;
  resetDemo: () => void;
};

const Ctx = createContext<Store | null>(null);

const order = (a: Product, b: Product) => b.amount - a.amount || a.updatedAt - b.updatedAt;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(0);
  const [saved, setSaved] = useState<Saved>(empty);

  useEffect(() => {
    setNow(Date.now());
    setSaved(load());
    setReady(true);
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const update = useCallback((fn: (s: Saved) => Saved) => {
    setSaved((prev) => {
      const next = fn(prev);
      save(next);
      return next;
    });
  }, []);

  const seed = useMemo(() => (now ? buildSeed(now) : { products: [], activity: [] }), [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const products = useMemo(() => {
    const all = [...saved.added, ...seed.products.filter((p) => !saved.added.some((a) => a.slug === p.slug))];
    return all.map((p) => ({
      ...p,
      amount: p.amount + (saved.topups[p.slug] ?? 0),
      clicks: p.clicks + (saved.clicks[p.slug] ?? 0),
    }));
  }, [saved, seed]);

  const ranked = useMemo<Ranked[]>(
    () => [...products].sort(order).map((p, i) => ({ ...p, rank: i + 1 })),
    [products]
  );

  const today = useMemo<Ranked[]>(() => {
    const start = startOfTodayIST(now || Date.now());
    return ranked
      .filter((p) => p.createdAt >= start || p.updatedAt >= start)
      .sort(order)
      .map((p, i) => ({ ...p, rank: i + 1 }));
  }, [ranked, now]);

  const activity = useMemo(
    () => [...saved.activity, ...seed.activity].sort((a, b) => b.at - a.at).slice(0, 30).map((a) => ({
      ...a,
      rankAfter: a.rankAfter || ranked.find((r) => r.slug === a.slug)?.rank || 0,
    })),
    [saved.activity, seed.activity, ranked]
  );

  const bySlug = useCallback((slug: string) => ranked.find((p) => p.slug === slug), [ranked]);

  const rankForAmount = useCallback(
    (amount: number, excludeSlug?: string) =>
      ranked.filter((p) => p.slug !== excludeSlug && p.amount >= amount).length + 1,
    [ranked]
  );

  const addListing = useCallback(
    (l: NewListing, amount: number) => {
      const t = Date.now();
      const base = slugify(domainOf(l.url));
      let slug = base;
      let n = 2;
      while (products.some((p) => p.slug === slug)) slug = `${base}-${n++}`;
      const product: Product = {
        slug,
        name: l.name.trim(),
        tagline: l.tagline.trim(),
        description: l.description.trim(),
        url: l.url,
        domain: domainOf(l.url),
        category: l.category,
        amount,
        clicks: 0,
        createdAt: t,
        updatedAt: t,
        maker: l.maker?.replace(/^@/, "").trim() || undefined,
        hue: hueFor(l.name),
        mine: true,
      };
      const rankAfter = ranked.filter((p) => p.amount >= amount).length + 1;
      update((s) => ({
        ...s,
        added: [product, ...s.added],
        activity: [{ id: `a-${t}`, slug, name: product.name, amount, rankAfter, at: t }, ...s.activity],
      }));
      return slug;
    },
    [products, ranked, update]
  );

  const topUp = useCallback(
    (slug: string, amount: number) => {
      const t = Date.now();
      const p = ranked.find((r) => r.slug === slug);
      if (!p) return;
      const total = p.amount + amount;
      const rankAfter = ranked.filter((r) => r.slug !== slug && r.amount >= total).length + 1;
      update((s) => ({
        ...s,
        topups: { ...s.topups, [slug]: (s.topups[slug] ?? 0) + amount },
        // a top-up resets the tie-break clock for that listing
        added: s.added.map((a) => (a.slug === slug ? { ...a, updatedAt: t } : a)),
        activity: [{ id: `a-${t}`, slug, name: p.name, amount, rankAfter, at: t }, ...s.activity],
      }));
    },
    [ranked, update]
  );

  const recordClick = useCallback(
    (slug: string) => update((s) => ({ ...s, clicks: { ...s.clicks, [slug]: (s.clicks[slug] ?? 0) + 1 } })),
    [update]
  );

  const resetDemo = useCallback(() => update(() => empty), [update]);

  const value: Store = { ready, ranked, today, activity, bySlug, rankForAmount, addListing, topUp, recordClick, resetDemo };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside StoreProvider");
  return s;
}
