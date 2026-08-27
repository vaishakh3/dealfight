# Price Fight

Price Fight is an anti-ad leaderboard: brands rank by the verified value of the deal they give customers, never by how much they pay the platform.

## Local development

```bash
npm install
npm run dev
```

The local Sites runtime provides the D1 binding declared in `.openai/hosting.json`. Tables are created idempotently on first API use; the generated migration is also committed under `drizzle/` for deployment inspection.

## Product data

The visible preseason fights in `lib/fight-data.ts` are fictional sample inventory and are labelled as such in the interface. Real submissions are saved to D1 with `pending_payment` status.

## Payment handoff

The product is intentionally provider-neutral until payment credentials are chosen:

- `POST /api/submissions` validates and stores a proposed deal.
- `POST /api/checkout` verifies that the submission exists and is the prepared integration point for a $49 USD checkout session.
- `POST /api/payment-webhook` is the prepared webhook endpoint. Verify the provider signature, then update the matching submission from `pending_payment` to `paid`.
- `.env.example` lists the expected secret names.

Never trust an amount from the browser. The checkout endpoint owns the fixed fee and the webhook must be the only path that marks an entry paid.

## Verification

```bash
npm run db:generate
npm run build
npm audit --omit=dev
```
