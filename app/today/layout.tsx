import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Today's ranking — cheapest front page on the internet",
  description: "Softing's daily board ranks products only by what they paid today and resets at midnight UTC. Grab today's #1 for a few dollars.",
  alternates: { canonical: "/today" },
};

export default function L({ children }: { children: React.ReactNode }) {
  return children;
}
