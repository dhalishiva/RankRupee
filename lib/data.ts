export type Category = { slug: string; name: string; short: string };

export const CATEGORIES: Category[] = [
  { slug: "saas-tools", name: "SaaS & Productivity", short: "SaaS" },
  { slug: "ai", name: "AI Products & Agents", short: "AI" },
  { slug: "developer-tools", name: "Developer Tools", short: "Developer" },
  { slug: "fintech", name: "Fintech, UPI & Payments", short: "Fintech" },
  { slug: "d2c-brands", name: "D2C Brands & Ecommerce", short: "D2C" },
  { slug: "edtech", name: "Edtech & Exam Prep", short: "Edtech" },
  { slug: "marketing", name: "Marketing & Growth", short: "Marketing" },
  { slug: "creators", name: "Creators & Social", short: "Creators" },
  { slug: "agencies", name: "Agencies & Services", short: "Agencies" },
  { slug: "health", name: "Health & Fitness", short: "Health" },
  { slug: "food", name: "Food & Cloud Kitchens", short: "Food" },
  { slug: "jobs", name: "Jobs & Hiring", short: "Hiring" },
  { slug: "real-estate", name: "Real Estate & PG", short: "Real Estate" },
  { slug: "travel", name: "Travel & Local", short: "Travel" },
  { slug: "gaming", name: "Gaming & Fantasy", short: "Gaming" },
  { slug: "other", name: "Other", short: "Other" },
];

export const categoryBySlug = (slug: string) => CATEGORIES.find((c) => c.slug === slug);

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  url: string | null; // null = sample listing, no outbound link
  domain: string;
  category: string;
  amount: number; // total ₹ paid, decides rank
  clicks: number;
  createdAt: number; // ms epoch
  updatedAt: number;
  maker?: string;
  hue: number;
  sample?: boolean;
  mine?: boolean; // claimed in this browser (demo)
};

export type Activity = {
  id: string;
  slug: string;
  name: string;
  amount: number; // this payment
  rankAfter: number;
  at: number;
};

const H = 3600_000;
const D = 24 * H;

type Seed = Omit<Product, "createdAt" | "updatedAt" | "hue" | "slug" | "domain"> & {
  ago: number;
  domain?: string;
};

// Real products from Kriosity link out; everything marked sample is fictional demo data.
const SEEDS: Seed[] = [
  { name: "Kriosity", tagline: "Indie software marketplace, built in Noida", description: "A storefront for small, sharp software products — buy once, run them yourself. Payments in ₹, support in Hinglish.", url: "https://kriosity.in", category: "saas-tools", amount: 151001, clicks: 9214, ago: 26 * D },
  { name: "PaidTwice", tagline: "Catch duplicate vendor payments before they leave", description: "Duplicate-payment detection for accounts payable teams. Upload your AP ledger, get a ranked list of likely double payments.", url: "https://paidtwice.kriosity.in", category: "fintech", amount: 128500, clicks: 6120, ago: 24 * D },
  { name: "ChaiStack", tagline: "Uptime monitoring that pings you on WhatsApp", description: "Monitors your sites every 60 seconds and sends outage alerts on WhatsApp, SMS and email. Made for teams who live on their phones.", url: null, category: "developer-tools", amount: 98000, clicks: 5702, ago: 22 * D, sample: true },
  { name: "Mahina", tagline: "Monthly billing for tuition, gyms and PGs", description: "Track who has paid this month, send UPI reminders automatically, and stop chasing fees on WhatsApp. ₹99/month.", url: "https://mahina.kriosity.in", category: "saas-tools", amount: 76543, clicks: 4410, ago: 19 * D },
  { name: "GSTBuddy", tagline: "GST invoices and returns without the CA panic", description: "Create GST-compliant invoices in seconds, reconcile GSTR-2B automatically and export filings your CA will actually like.", url: null, category: "fintech", amount: 64000, clicks: 3988, ago: 21 * D, sample: true },
  { name: "Tiffin.ai", tagline: "AI menu planning for cloud kitchens", description: "Predicts tomorrow's orders by locality and weather, then plans prep so you throw away less paneer.", url: null, category: "food", amount: 51111, clicks: 2876, ago: 18 * D, sample: true },
  { name: "SlotRecover", tagline: "Refill cancelled appointments automatically", description: "When a client cancels, SlotRecover messages your waitlist and fills the slot before it goes empty.", url: "https://slotrecover.vercel.app", category: "saas-tools", amount: 42020, clicks: 2311, ago: 17 * D },
  { name: "BharatHire", tagline: "Hire vetted freelancers from tier-2 cities", description: "Pre-screened designers, developers and marketers from Indore, Kochi, Jaipur and beyond. Pay by milestone.", url: null, category: "jobs", amount: 38500, clicks: 2655, ago: 20 * D, sample: true },
  { name: "Shiksha Sprint", tagline: "Daily 15-minute JEE and NEET drills", description: "Adaptive practice that finds your weak chapters and drills them every morning. Works offline on cheap Android phones.", url: null, category: "edtech", amount: 33333, clicks: 3120, ago: 16 * D, sample: true },
  { name: "KriosityOps", tagline: "One ops hub for founders running many apps", description: "Uptime, payments, signups and social posts for every app you run, on a single screen.", url: "https://ops.kriosity.in", category: "developer-tools", amount: 30001, clicks: 1402, ago: 14 * D },
  { name: "Masala Metrics", tagline: "Privacy-first analytics in ₹, not $", description: "Cookie-free website analytics with revenue attribution for Razorpay and Cashfree. Hosted in Mumbai.", url: null, category: "marketing", amount: 25500, clicks: 1888, ago: 15 * D, sample: true },
  { name: "VaaniVoice", tagline: "Voice agents that speak 11 Indian languages", description: "Phone agents for clinics, coaching centres and D2C brands — Hindi, Tamil, Bengali, Marathi and more.", url: null, category: "ai", amount: 22222, clicks: 2004, ago: 13 * D, sample: true },
  { name: "PinCode Pro", tagline: "Delivery serviceability API for every Indian PIN", description: "Check COD availability, delivery ETA and courier coverage across 19,000+ PIN codes with one call.", url: null, category: "developer-tools", amount: 18000, clicks: 970, ago: 12 * D, sample: true },
  { name: "Rangoli Studio", tagline: "Festive creatives for your brand in one click", description: "Diwali, Holi, Onam and Eid campaign kits generated in your brand colours, sized for every platform.", url: null, category: "creators", amount: 15001, clicks: 1450, ago: 11 * D, sample: true },
  { name: "YatraNest", tagline: "Homestays in the hills, verified in person", description: "Every listing in Himachal, Uttarakhand and Sikkim visited by our team before it goes live.", url: null, category: "travel", amount: 12500, clicks: 880, ago: 10 * D, sample: true },
  { name: "KiranaOS", tagline: "Billing and khata app for neighbourhood stores", description: "Barcode billing, udhaar tracking and WhatsApp catalogues for kirana shops. Works on a ₹6,000 phone.", url: null, category: "d2c-brands", amount: 10101, clicks: 1290, ago: 9 * D, sample: true },
  { name: "FitDesi", tagline: "Workout plans built around rotis, not rice cakes", description: "Strength programs and meal ideas that fit Indian kitchens and Indian schedules.", url: null, category: "health", amount: 8008, clicks: 640, ago: 8 * D, sample: true },
  { name: "PG Finder Noida", tagline: "Verified PGs near metro stations", description: "Filter PGs by food, AC, distance to metro and real tenant reviews. No brokerage.", url: null, category: "real-estate", amount: 6500, clicks: 1105, ago: 7 * D, sample: true },
  { name: "LoopLabs", tagline: "Shopify development agency for Indian D2C", description: "Fast Shopify stores with COD, RTO protection and regional checkout baked in.", url: null, category: "agencies", amount: 5001, clicks: 412, ago: 6 * D, sample: true },
  { name: "Googly XI", tagline: "Fantasy cricket stats without the betting", description: "Player form, pitch reports and matchup data for every IPL and international game. Pure stats, no money.", url: null, category: "gaming", amount: 3500, clicks: 905, ago: 5 * D, sample: true },
  { name: "ResumeRani", tagline: "Resumes that pass Naukri and LinkedIn filters", description: "Rewrites your resume for the exact job description and scores it against common ATS filters.", url: null, category: "jobs", amount: 2100, clicks: 377, ago: 4 * D, sample: true },
  { name: "UPI Lens", tagline: "Turn bank SMS into a clean expense tracker", description: "Reads your transaction SMS on-device and categorises spending. Nothing leaves your phone.", url: null, category: "fintech", amount: 1500, clicks: 288, ago: 9 * H, sample: true },
  { name: "PromptPathshala", tagline: "Learn AI tools in Hindi, 10 minutes a day", description: "Bite-size video lessons on ChatGPT, Claude and Midjourney for small business owners.", url: null, category: "edtech", amount: 999, clicks: 141, ago: 5 * H, sample: true },
  { name: "ThaliCam", tagline: "Snap your thali, get calories instantly", description: "Recognises 400+ Indian dishes from a photo and logs calories and protein.", url: null, category: "health", amount: 251, clicks: 63, ago: 2 * H, sample: true },
  { name: "DesiDeploy", tagline: "Deploy Next.js apps to Indian regions", description: "One-command deploys with Mumbai and Hyderabad edge regions and INR billing.", url: null, category: "developer-tools", amount: 111, clicks: 19, ago: 40 * 60_000, sample: true },
];

export const slugify = (s: string) =>
  s.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60) || "product";

export const hueFor = (s: string) => {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
};

export const domainOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

export function buildSeed(now: number): { products: Product[]; activity: Activity[] } {
  const products: Product[] = SEEDS.map((s) => {
    const { ago, ...rest } = s;
    const slug = slugify(s.url ? domainOf(s.url) : s.name);
    return {
      ...rest,
      slug,
      domain: s.url ? domainOf(s.url) : "sample listing",
      createdAt: now - ago,
      updatedAt: now - ago,
      hue: hueFor(s.name),
    };
  });
  const sorted = [...products].sort((a, b) => b.createdAt - a.createdAt);
  const activity: Activity[] = sorted.slice(0, 8).map((p, i) => ({
    id: `seed-${i}`,
    slug: p.slug,
    name: p.name,
    amount: p.amount,
    rankAfter: 0,
    at: p.createdAt,
  }));
  return { products, activity };
}

export const MIN_AMOUNT = 10;
export const LAUNCH_DATE = Date.UTC(2026, 9, 30);
