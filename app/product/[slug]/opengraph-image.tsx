import { ImageResponse } from "next/og";
import { usd } from "@/lib/format";
import { serverListing } from "@/lib/server";

export const alt = "Product rank on Softing";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 600;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const l = await serverListing(slug);
  const name = l?.name ?? "Softing";
  const tagline = l?.tagline ?? "The pay-to-rank product leaderboard";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, background: "#f6f0e4", color: "#1d1b16" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 40, fontWeight: 700 }}>
          <svg width="60" height="60" viewBox="0 0 40 40">
            <path d="M7 9 L13 15 L20 12 L27 15 L33 9 L33 27 Q33 37 20 37 Q7 37 7 27 Z" fill="#1d1b16" />
            <circle cx="14" cy="21" r="5.6" fill="#f6f0e4" />
            <circle cx="26" cy="21" r="5.6" fill="#f6f0e4" />
            <circle cx="14.8" cy="21.4" r="2.6" fill="#1d1b16" />
            <circle cx="26.8" cy="21.4" r="2.6" fill="#1d1b16" />
            <path d="M18 26 L22 26 L20 30 Z" fill="#e2580b" />
          </svg>
          Softing
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          <div style={{ fontSize: 150, fontWeight: 800, color: l && l.rank <= 3 ? "#c99a12" : "#e2580b" }}>#{l?.rank ?? "?"}</div>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 820 }}>
            <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.05 }}>{name.slice(0, 40)}</div>
            <div style={{ fontSize: 34, color: "#4a453b", marginTop: 12 }}>{tagline.slice(0, 90)}</div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 34 }}>
          <div style={{ display: "flex", color: "#12795a", fontWeight: 800 }}>{l ? `${usd(l.total_cents)} paid` : ""}</div>
          <div style={{ display: "flex", background: "#e2580b", color: "#fff8ec", padding: "14px 26px", borderRadius: 16, fontWeight: 800 }}>
            {l ? `Take this spot for ${usd(l.total_cents + 100)}` : "Claim your rank"}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
