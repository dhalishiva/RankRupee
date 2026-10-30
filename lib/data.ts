export const SITE = {
  name: "Softing",
  url: "https://www.softing.online", // canonical host (apex redirects here)
  company: "Kriosity",
  owner: "Shiva Dhali",
  address: "42-A / BLK-S.K. EWS, Sector 66, Noida, Gautam Buddha Nagar, Uttar Pradesh 201301, India",
  supportEmail: "support@kriosity.in",
  helloEmail: "hello@kriosity.in",
  x: "dhalishiva",
  whatsapp: "919456277189",
  whatsappDisplay: "+91 94562 77189",
  launch: Date.UTC(2026, 9, 30),
};

export const SUPABASE_URL = "https://whzoandvutrbpjovhave.supabase.co";
export const SUPABASE_KEY = "sb_publishable_2DURMcsd2lYqkuf-5YUneg_u7s30PNX"; // public, read-only by RLS

export type Category = { slug: string; name: string; short: string };

// Keep in sync with CATEGORIES in supabase/functions/api/index.ts
export const CATEGORIES: Category[] = [
  { slug: "ai", name: "AI & Agents", short: "AI" },
  { slug: "developer-tools", name: "Developer Tools", short: "Developer" },
  { slug: "saas", name: "SaaS & Productivity", short: "SaaS" },
  { slug: "marketing", name: "Marketing & Growth", short: "Marketing" },
  { slug: "seo", name: "SEO & AI Visibility", short: "SEO" },
  { slug: "fintech", name: "Fintech & Payments", short: "Fintech" },
  { slug: "ecommerce", name: "Ecommerce & D2C", short: "Ecommerce" },
  { slug: "crypto", name: "Crypto & Web3", short: "Crypto" },
  { slug: "design", name: "Design & Creative", short: "Design" },
  { slug: "education", name: "Education & Learning", short: "Education" },
  { slug: "health", name: "Health & Fitness", short: "Health" },
  { slug: "games", name: "Games & Entertainment", short: "Games" },
  { slug: "social", name: "Social & Creators", short: "Social" },
  { slug: "agencies", name: "Agencies & Services", short: "Agencies" },
  { slug: "hiring", name: "Hiring & Jobs", short: "Hiring" },
  { slug: "other", name: "Other", short: "Other" },
];

export const categoryBySlug = (slug: string) => CATEGORIES.find((c) => c.slug === slug);

export type Listing = {
  rank: number;
  slug: string;
  url: string;
  domain: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  maker_handle: string | null;
  total_cents: number;
  clicks: number;
  created_at: string;
  last_paid_at: string;
};

export type TodayRow = {
  rank: number;
  slug: string;
  name: string;
  domain: string;
  tagline: string;
  category: string;
  today_cents: number;
};

export type ActivityRow = { slug: string; name: string; amount_cents: number; kind: "new" | "topup"; paid_at: string };
export type Stats = { listings: number; total_cents: number; payments: number };

export const MIN_CENTS = 100;
