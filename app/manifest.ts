import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Softing — pay-to-rank product leaderboard",
    short_name: "Softing",
    description: "The public pay-to-rank product leaderboard. Pay $1 more, take the spot.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f0e4",
    theme_color: "#e2580b",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
