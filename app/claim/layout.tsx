import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Claim a rank — list your product from $1",
  description: "Put your product on Softing's public leaderboard. Pay once from $1, top up any time to climb. Pay in ₹ via UPI or worldwide via PayPal.",
  alternates: { canonical: "/claim" },
};

export default function L({ children }: { children: React.ReactNode }) {
  return children;
}
