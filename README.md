# Price Fight

Price Fight is a public, pay-to-rank product leaderboard. A higher total bid earns a higher rank, every paid listing remains visible, and every product supplies an exclusive visitor deal.

## Local development

```bash
npm install
npm run dev
```

The local Sites runtime provides the D1 binding declared in `.openai/hosting.json`. Tables and additive columns are created idempotently on first API use; generated migrations are also committed under `drizzle/` for deployment inspection.

## Product data

The visible preseason listings in `lib/leaderboard-data.ts` are fictional sample inventory and are labelled as such throughout the interface. Real bid intents are stored in D1 with `pending_payment` status.

## Bid and payment handoff

The product is provider-neutral until payment credentials are chosen:

- `POST /api/submissions` validates the listing, deal, and desired total bid. It normalizes the URL, finds the URL's highest paid bid, and stores only the server-calculated difference as the amount due.
- `POST /api/checkout` rechecks the URL's latest paid total and refreshes the server-owned amount due. It is the prepared point for creating a provider checkout session.
- `POST /api/payment-webhook` is the prepared webhook endpoint. Verify the provider signature before changing a bid from `pending_payment` to `paid`.
- Paid bid totals should be the only canonical source for production leaderboard ranks.
- `.env.example` lists the expected secret names.

Never trust a payment amount sent by the browser. The submission endpoint calculates the difference, checkout reads it from D1, and only a verified webhook may mark it paid.

## Verification

```bash
npm run db:generate
npm run build
npm audit --omit=dev
```
