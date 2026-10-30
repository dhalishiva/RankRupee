import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { SiteFooter, SiteHeader } from "@/components/ui";

export const metadata: Metadata = {
  metadataBase: new URL("https://rankrupee.vercel.app"),
  title: {
    default: "RankRupee — India’s pay-to-rank leaderboard",
    template: "%s · RankRupee",
  },
  description:
    "No ads, no algorithm, no follower count. Pay in ₹ to claim a rank on India’s public product leaderboard. Pay ₹1 more and take the spot above.",
  keywords: ["RankRupee", "pay to rank", "Indian startups", "product leaderboard", "claim a rank", "indie hackers India"],
  openGraph: {
    title: "RankRupee — Claim your rank in ₹",
    description: "India’s public pay-to-rank leaderboard. Pay ₹1 more, take the spot.",
    type: "website",
    locale: "en_IN",
    siteName: "RankRupee",
  },
  twitter: { card: "summary_large_image", creator: "@dhalishiva" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f0e4" },
    { media: "(prefers-color-scheme: dark)", color: "#17150f" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,700;1,9..144,500&family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap"
        />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body>
        <StoreProvider>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </StoreProvider>
      </body>
    </html>
  );
}
