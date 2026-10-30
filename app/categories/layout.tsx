import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categories — AI, SaaS, developer tools and more",
  description: "Browse Softing's pay-to-rank leaderboards by category: AI, developer tools, SaaS, marketing, SEO, fintech, ecommerce and more.",
  alternates: { canonical: "/categories" },
};

export default function L({ children }: { children: React.ReactNode }) {
  return children;
}
