import type { MetadataRoute } from "next";
import { CATEGORIES, SITE } from "@/lib/data";
import { serverRanked } from "@/lib/server";

export const revalidate = 600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const base = SITE.url;
  const fixed: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "hourly", priority: 1, lastModified: now },
    { url: `${base}/today`, changeFrequency: "hourly", priority: 0.9, lastModified: now },
    { url: `${base}/claim`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/categories`, changeFrequency: "daily", priority: 0.7 },
    ...["about", "rules", "faq", "contact", "terms", "privacy", "refund-policy", "delivery-policy"].map((p) => ({
      url: `${base}/${p}`,
      changeFrequency: "monthly" as const,
      priority: p === "about" || p === "faq" ? 0.5 : 0.3,
    })),
    ...CATEGORIES.map((c) => ({ url: `${base}/category/${c.slug}`, changeFrequency: "daily" as const, priority: 0.6 })),
  ];
  const listings = await serverRanked();
  return [
    ...fixed,
    ...listings.map((l) => ({
      url: `${base}/product/${l.slug}`,
      lastModified: new Date(l.last_paid_at),
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
  ];
}
