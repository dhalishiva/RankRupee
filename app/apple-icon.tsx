import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#e2580b" }}>
        <svg width="140" height="140" viewBox="0 0 40 40">
          <path d="M7 9 L13 15 L20 12 L27 15 L33 9 L33 27 Q33 37 20 37 Q7 37 7 27 Z" fill="#1d1b16" />
          <circle cx="14" cy="21" r="5.6" fill="#fff8ec" />
          <circle cx="26" cy="21" r="5.6" fill="#fff8ec" />
          <circle cx="14.8" cy="21.4" r="2.6" fill="#1d1b16" />
          <circle cx="26.8" cy="21.4" r="2.6" fill="#1d1b16" />
          <path d="M18 26 L22 26 L20 30 Z" fill="#fff8ec" />
        </svg>
      </div>
    ),
    size,
  );
}
