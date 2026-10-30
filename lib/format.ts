const usdFmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const usdCentsFmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
const inrFmt = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const numFmt = new Intl.NumberFormat("en-US");

/** $1,234 — whole dollars unless there are cents */
export const usd = (cents: number) => (cents % 100 === 0 ? usdFmt.format(cents / 100) : usdCentsFmt.format(cents / 100));
export const inr = (rupees: number) => inrFmt.format(rupees);
export const num = (n: number) => numFmt.format(n);
export const inrFor = (cents: number, rate: number) => Math.ceil((cents * rate) / 100);

export function timeAgo(ts: string | number, now = Date.now()) {
  const t = typeof ts === "string" ? Date.parse(ts) : ts;
  const s = Math.max(0, Math.round((now - t) / 1000));
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

export const isIndia = () => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz === "Asia/Kolkata" || tz === "Asia/Calcutta";
  } catch {
    return false;
  }
};
