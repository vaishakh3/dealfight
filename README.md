# Deal Fight

Deal Fight is a pay-to-rank deal marketplace. Brands buy visibility with public bids, then compete for customers with exclusive discounts. A higher total bid earns a higher rank, and every paid listing remains visible.

## Local development

```bash
npm install
npm run dev
```

The homepage and sample leaderboard work without environment variables. Copy `.env.example` to `.env.local` and supply `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and the server-only `DEALFIGHT_DATABASE_SECRET` to activate submission and engagement storage. A server-only `SUPABASE_SECRET_KEY` (or legacy `SUPABASE_SERVICE_ROLE_KEY`) can be used instead of the publishable-key pair, but must never be exposed to browser code.

For an isolated local database, Docker must be running:

```bash
npx supabase start
npx supabase db reset
npx supabase status -o env
```

Use the reported `API_URL` as `SUPABASE_URL` and the reported `SECRET_KEY` as `SUPABASE_SECRET_KEY`. For parity with production, use the reported `PUBLISHABLE_KEY` plus an API key registered in `dealfight_private.server_api_keys`. The checked-in local configuration uses the `5532x` port range so it can coexist with another Supabase project using the defaults.

## Vercel deployment

The repository is configured as a standard Next.js App Router application. `vercel.json` explicitly selects Vercel's Next.js framework preset, including for projects that were initially configured as “Other.”

Connect the GitHub repository to Vercel and deploy `main`. No output-directory override is needed.

### Durable storage

Create a dedicated Supabase project, apply the migrations in `supabase/migrations`, register a random UUID in `dealfight_private.server_api_keys`, then add `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and the matching `DEALFIGHT_DATABASE_SECRET` as encrypted Vercel environment variables. The Supabase client remains server-only; neither the database credential nor the API client is included in the browser bundle.

The migrations create constrained `submissions` and `engagement_events` tables, targeted indexes, an `updated_at` trigger, and row-level security. Anonymous table operations require both the project publishable key and a separate rotatable Deal Fight server credential checked in a pre-request hook and every RLS policy. Authenticated users have no direct access; the Supabase server role remains limited to the exact read/write operations used by the validated Next.js API routes.

Without a database, the public page still renders and bid submissions return a clear `DATABASE_NOT_CONNECTED` response instead of crashing the deployment.

## Product data

The visible preseason board contains only three fictional examples with $15, $10, and $5 visibility bids. They are explicitly labelled as examples and do not claim real advertiser or shopper activity. Real bid intents are stored with `pending_payment` status once Supabase is connected.

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
npx supabase db lint --local --schema public --level warning --fail-on warning
```
