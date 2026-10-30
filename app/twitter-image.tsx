import { ImageResponse } from "next/og";

export const alt = "Softing — Money talks. Here it ranks.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#f6f0e4", color: "#1d1b16", fontFamily: "serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="88" height="88" viewBox="0 0 40 40">
            <path d="M7 9 L13 15 L20 12 L27 15 L33 9 L33 27 Q33 37 20 37 Q7 37 7 27 Z" fill="#1d1b16" />
            <circle cx="14" cy="21" r="5.6" fill="#f6f0e4" />
            <circle cx="26" cy="21" r="5.6" fill="#f6f0e4" />
            <circle cx="14.8" cy="21.4" r="2.6" fill="#1d1b16" />
            <circle cx="26.8" cy="21.4" r="2.6" fill="#1d1b16" />
            <path d="M18 26 L22 26 L20 30 Z" fill="#e2580b" />
          </svg>
          <div style={{ fontSize: 56, fontWeight: 700 }}>Softing</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 96, fontWeight: 700, lineHeight: 1 }}>Money talks.</div>
          <div style={{ fontSize: 96, fontStyle: "italic", color: "#e2580b", lineHeight: 1.1 }}>Here it ranks.</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 32, color: "#4a453b" }}>
          <div>Pay $1 more. Take the spot.</div>
          <div>softing.online</div>
        </div>
      </div>
    ),
    size,
  );
}
