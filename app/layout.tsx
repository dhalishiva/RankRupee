import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteFooter, SiteHeader, WhatsAppButton } from "@/components/ui";

export const metadata: Metadata = {
  metadataBase: new URL("https://softing.online"),
  title: {
    default: "Softing — the pay-to-rank product leaderboard",
    template: "%s · Softing",
  },
  description: "No ads, no algorithm, no upvote rings. Pay to claim a rank on Softing's public product leaderboard — pay $1 more and take the spot above.",
  keywords: ["Softing", "pay to rank", "product leaderboard", "claim a rank", "indie hackers", "startup launch"],
  openGraph: {
    title: "Softing — Money talks. Here it ranks.",
    description: "The public pay-to-rank leaderboard. Pay $1 more, take the spot.",
    type: "website",
    siteName: "Softing",
    url: "https://softing.online",
  },
  twitter: { card: "summary_large_image", creator: "@dhalishiva", title: "Softing — Money talks. Here it ranks.", description: "The public pay-to-rank leaderboard. Pay $1 more, take the spot." },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f0e4" },
    { media: "(prefers-color-scheme: dark)", color: "#17150f" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,700;1,9..144,500&family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap"
        />
      </head>
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <WhatsAppButton />
      </body>
    </html>
  );
}
