import type { Metadata } from "next";
import { categoryBySlug, SITE } from "@/lib/data";
import { usd } from "@/lib/format";
import { serverListing } from "@/lib/server";

export const revalidate = 600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const l = await serverListing(slug);
  if (!l) return { title: "Listing not found", robots: { index: false } };
  const title = `${l.name} — #${l.rank} on Softing`;
  const description = `${l.tagline}. ${l.name} (${l.domain}) is ranked #${l.rank} with ${usd(l.total_cents)} paid. Pay ${usd(l.total_cents + 100)} to take this spot.`;
  return {
    title,
    description,
    alternates: { canonical: `/product/${l.slug}` },
    openGraph: { title, description, url: `/product/${l.slug}`, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function L({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const l = await serverListing(slug);
  const jsonLd = l && {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${l.name} on Softing`,
    url: `${SITE.url}/product/${l.slug}`,
    about: {
      "@type": "SoftwareApplication",
      name: l.name,
      url: l.url,
      description: l.description || l.tagline,
      applicationCategory: categoryBySlug(l.category)?.name ?? "Software",
    },
    isPartOf: { "@id": `${SITE.url}/#website` },
  };
  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />}
      {children}
    </>
  );
}
