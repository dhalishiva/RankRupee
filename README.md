# Softing

The public pay-to-rank product leaderboard — **softing.online**. A product of Kriosity.

Pay to list a product; rank = total paid (USD). Pay $1 more than someone to pass them. India pays in INR via Razorpay; everyone else pays in USD via PayPal.

## Architecture
- **Frontend:** Next.js 16 on Vercel (`app/`, `components/`). Reads public data from Supabase with the publishable key.
- **Database:** Supabase Postgres (`supabase/migrations/0001_init.sql`). RLS: public can read visible listings and a few safe RPCs; orders are service-role only.
- **Payments:** Supabase Edge Functions
  - `api` — `config`, `create-order`, `verify` (Razorpay signature + payment check, PayPal server-side capture). Listings are only written by `fulfill_order()` after verification.
  - `razorpay-webhook` — backup fulfilment if the buyer closes the tab.

## Secrets (Supabase → Edge Functions → Secrets)
| Name | Purpose |
|---|---|
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Razorpay API keys (test or live) |
| `RAZORPAY_WEBHOOK_SECRET` | Secret set on the Razorpay webhook |
| `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` | PayPal REST app credentials |
| `PAYPAL_ENV` | `sandbox` or `live` |
| `INR_PER_USD` | Optional, default `88` |

A payment method shows "Coming soon" until its keys are set.

## Moderation
Hide a listing: in Supabase table editor set `listings.hidden = true`.

## Dev
```bash
npm install && npm run dev
```
