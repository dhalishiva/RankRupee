const inrFmt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** ₹1,51,001 — Indian digit grouping */
export const inr = (n: number) => `₹${inrFmt.format(Math.round(n))}`;
export const num = (n: number) => inrFmt.format(n);

/** "₹1.5L" / "₹2.3Cr" for compact spots */
export const inrShort = (n: number) => {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(n >= 1e8 ? 0 : 1)}Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(n >= 1e6 ? 0 : 1)}L`;
  if (n >= 1e3) return `₹${(n / 1e3).toFixed(n >= 1e4 ? 0 : 1)}K`;
  return `₹${n}`;
};

export function timeAgo(ts: number, now = Date.now()) {
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hour${h > 1 ? "s" : ""} ago`;
  const d = Math.round(h / 24);
  if (d === 1) return "yesterday";
  if (d < 30) return `${d} days ago`;
  const mo = Math.round(d / 30);
  return mo <= 1 ? "last month" : `${mo} months ago`;
}

/** Start of today in India (IST), as ms epoch */
export function startOfTodayIST(now = Date.now()) {
  const IST = 5.5 * 3600_000;
  return Math.floor((now + IST) / 86400_000) * 86400_000 - IST;
}
