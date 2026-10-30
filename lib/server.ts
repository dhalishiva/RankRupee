import { CATEGORIES, Listing, SUPABASE_KEY, SUPABASE_URL } from "./data";

/** Server-side reads (sitemap, metadata, share images). Cached for 10 minutes. */
async function rpc<T>(fn: string, query = ""): Promise<T | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}${query}`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
      body: "{}",
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function serverRanked(): Promise<Listing[]> {
  return (await rpc<Listing[]>("ranked_listings", "?order=rank.asc&limit=5000")) ?? [];
}

export async function serverListing(slug: string): Promise<Listing | null> {
  const rows = await rpc<Listing[]>("ranked_listings", `?slug=eq.${encodeURIComponent(slug)}&limit=1`);
  return rows?.[0] ?? null;
}

export const categorySlugs = () => CATEGORIES.map((c) => c.slug);
