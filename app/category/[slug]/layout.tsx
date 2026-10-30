import type { Metadata } from "next";
import { categoryBySlug } from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cat = categoryBySlug(slug);
  if (!cat) return { title: "Category not found", robots: { index: false } };
  return {
    title: `Best ${cat.name} products, ranked by money`,
    description: `The ${cat.name} leaderboard on Softing. Products ranked purely by what they paid — pay $1 more than the one above you to pass it.`,
    alternates: { canonical: `/category/${cat.slug}` },
  };
}

export default function L({ children }: { children: React.ReactNode }) {
  return children;
}
