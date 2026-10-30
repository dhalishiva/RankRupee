# RankRupee

India's public pay-to-rank leaderboard. Pay in ₹ to claim a rank — pay ₹1 more than someone to jump past them.

**Status:** frontend only, demo mode. Payments are simulated (`components/PaymentModal.tsx`) and listings claimed in the demo are stored in the visitor's browser (`localStorage`). Most seeded listings are marked as samples.

## Stack
Next.js 16 (App Router) · React 19 · TypeScript · plain CSS. Deployed on Vercel.

## Run
```bash
npm install
npm run dev
```

## Pages
- `/` all-time board · `/today` resets at midnight IST · `/categories`, `/category/[slug]`
- `/claim` listing form → demo checkout · `/product/[slug]` detail + top-up
- `/about`, `/rules`, `/faq`

## Ranking rules
Rank = total paid, highest first; ties go to whoever paid first. Minimum ₹10. Amounts use Indian digit grouping (₹1,51,001).

## Going live (next steps)
1. Supabase tables: `listings`, `payments` (rank computed from verified payments only).
2. Razorpay: server route creates the order, Checkout opens on the client, the server verifies the signature before writing — see `lib/payments.ts`.
3. Replace `lib/store.tsx` localStorage logic with API calls.
