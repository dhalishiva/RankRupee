import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { SiteFooter, SiteHeader, WhatsAppButton } from "@/components/ui";
import { SITE } from "@/lib/data";

const description =
  "Softing is the public pay-to-rank product leaderboard. No ads, no algorithm, no upvote rings — pay $1 more than the product above you and take its spot. Pay in ₹ via UPI or worldwide via PayPal.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Softing — the pay-to-rank product leaderboard",
    template: "%s · Softing",
  },
  description,
  applicationName: "Softing",
  keywords: [
    "Softing", "pay to rank", "product leaderboard", "launch your product", "promote my startup", "indie hackers",
    "SaaS directory", "startup ranking", "product launch site", "Product Hunt alternative", "advertise my SaaS",
  ],
  authors: [{ name: SITE.owner, url: "https://kriosity.in" }],
  creator: SITE.owner,
  publisher: "Kriosity",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  openGraph: {
    title: "Softing — Money talks. Here it ranks.",
    description: "The public pay-to-rank product leaderboard. Pay $1 more, take the spot.",
    type: "website",
    siteName: "Softing",
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    creator: `@${SITE.x}`,
    title: "Softing — Money talks. Here it ranks.",
    description: "The public pay-to-rank product leaderboard. Pay $1 more, take the spot.",
  },
  verification: {
    // Set GOOGLE_SITE_VERIFICATION in Vercel (Search Console → HTML tag → content value), then redeploy.
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
  },
  category: "business",
};

export const viewport: Viewport = {
  themeColor: "#f6f0e4",
  colorScheme: "light",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://kriosity.in/#org",
      name: "Kriosity",
      url: "https://kriosity.in",
      founder: { "@type": "Person", name: SITE.owner },
      email: SITE.helloEmail,
      address: {
        "@type": "PostalAddress",
        streetAddress: "42-A / BLK-S.K. EWS, Sector 66",
        addressLocality: "Noida",
        addressRegion: "Uttar Pradesh",
        postalCode: "201301",
        addressCountry: "IN",
      },
      contactPoint: [
        { "@type": "ContactPoint", contactType: "customer support", email: SITE.supportEmail, telephone: `+${SITE.whatsapp}` },
      ],
      sameAs: [`https://x.com/${SITE.x}`, "https://www.linkedin.com/in/shivadhali", "https://www.youtube.com/@kriosityin"],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      name: "Softing",
      url: SITE.url,
      description,
      publisher: { "@id": "https://kriosity.in/#org" },
      inLanguage: "en",
    },
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <WhatsAppButton />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
