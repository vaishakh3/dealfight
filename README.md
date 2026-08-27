# Deal Fight

Deal Fight is a pay-to-rank deal marketplace. Brands buy visibility with public bids, then compete for customers with exclusive discounts. A higher total bid earns a higher rank, and every paid listing remains visible.

## Local development

```bash
npm install
npm run dev
```

The homepage and sample leaderboard work without environment variables. Copy `.env.example` to `.env.local` and supply `DATABASE_URL` to activate submission and engagement storage.

## Vercel deployment

The repository is configured as a standard Next.js App Router application. `vercel.json` explicitly selects Vercel's Next.js framework preset, including for projects that were initially configured as “Other.”

Connect the GitHub repository to Vercel and deploy `main`. No output-directory override is needed.

### Durable storage

Install Neon from the Vercel Marketplace and connect it to this project. The integration normally injects `DATABASE_URL`; the app also accepts `POSTGRES_URL`. Database initialization is lazy and automatically creates the required tables and indexes on the first API request.

Without a database, the public page still renders and bid submissions return a clear `DATABASE_NOT_CONNECTED` response instead of crashing the deployment.

## Product data

The visible preseason listings in `lib/leaderboard-data.ts` are fictional sample inventory and are labelled as such. Real bid intents are stored with `pending_payment` status once Neon is connected.

## Payment handoff

The product remains provider-neutral until payment credentials are chosen:

- `POST /api/submissions` validates the listing, deal, and desired total bid. It normalizes the URL, finds the URL's highest paid bid, and stores only the server-calculated difference as the amount due.
- `POST /api/checkout` rechecks the URL's latest paid total and refreshes the server-owned amount due.
- `POST /api/payment-webhook` is the prepared webhook endpoint. Verify the provider signature before changing a bid from `pending_payment` to `paid`.
- Paid bid totals are the only canonical source for production leaderboard ranks.

Never trust a payment amount sent by the browser. Only a verified webhook may mark a bid paid.

## Verification

```bash
npm run check
npm audit --omit=dev
```
