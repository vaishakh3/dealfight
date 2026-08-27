# Deal Fight

Deal Fight is a pay-to-rank deal marketplace. Brands buy visibility with public bids, then compete for customers with exclusive discounts. A higher total bid earns a higher rank, and every paid listing remains visible.

The sourced product thesis, competitive review, risk analysis, viral loops, and launch experiments are documented in [`docs/research-and-positioning.md`](docs/research-and-positioning.md).

## Local development

```bash
npm install
npm run dev
```

The homepage and launch leaderboard work without environment variables. Copy `.env.example` to `.env.local` and supply the Supabase variables to activate submission and engagement storage. Add the Dodo variables to activate secure checkout. A server-only `SUPABASE_SECRET_KEY` (or legacy `SUPABASE_SERVICE_ROLE_KEY`) can be used instead of the publishable-key pair, but it must never be exposed to browser code.

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

The migrations create constrained `submissions` and `engagement_events` tables, targeted indexes, an `updated_at` trigger, row-level security, and HMAC-keyed request counters. Anonymous table operations require both the project publishable key and a separate rotatable Deal Fight server credential checked in a pre-request hook and every RLS policy. Authenticated users have no direct access; the Supabase server role remains limited to the exact read/write operations used by the validated Next.js API routes. Raw client IP addresses are never stored.

Without a database, the public page still renders and bid submissions return a clear `DATABASE_NOT_CONNECTED` response instead of crashing the deployment.

## Product data

The launch board contains three fictional inventory listings with $15, $10, and $5 visibility bids. They provide believable launch density without claiming advertiser or shopper activity. Paid, approved submissions are merged into the board dynamically and sorted by total visibility bid.

## Production environment

Set these encrypted variables in the Vercel Production environment:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `DEALFIGHT_DATABASE_SECRET`
- `DODO_PAYMENTS_API_KEY`
- `DODO_PAYMENTS_WEBHOOK_KEY`
- `DODO_PAYMENTS_PRODUCT_ID`
- `DODO_PAYMENTS_ENVIRONMENT` (`test_mode` or `live_mode`)
- `NEXT_PUBLIC_SITE_URL` (`https://www.dealfight.lol` in Production)

Never expose the database secret, Dodo API key, or webhook signing key through `NEXT_PUBLIC_*` variables.

## Dodo payment flow

- `POST /api/submissions` validates the listing, deal, and desired total bid. It normalizes the URL, finds the URL's highest paid bid, and stores only the server-calculated difference as the amount due.
- `POST /api/checkout` rechecks the URL's latest paid total, refreshes the server-owned amount due, and creates an idempotent Dodo pay-what-you-want checkout session.
- Dodo sends `payment.succeeded` to `POST /api/payment-webhook`. The route verifies the raw-body signature, exact product cart, checkout session, customer email, submission metadata, and undiscounted one-time payment before changing a bid from `pending_payment` to `paid`.
- The provider charge and settlement amounts are stored with explicit ISO currency codes. The customer may see localized currency and tax while the leaderboard bid remains denominated in USD.
- Paid bid totals—not browser values or checkout totals—are the canonical source for production leaderboard ranks.
- Public listing, checkout, and engagement APIs have server-side fixed-window limits backed by Supabase. The limiter stores only an HMAC fingerprint of the client address.

Never trust a payment amount sent by the browser. Only a verified webhook may mark a bid paid.

### Review and publishing

Payment never publishes a listing automatically. A successful payment leaves `review_status = 'pending'`; the board loads only rows where `status = 'paid'` and `review_status = 'approved'`.

Before approval, verify that the product URL works, the submitter is authorized to represent the brand, the coupon works, the public and deal prices are accurate, and the offer complies with applicable law and platform policies. Review in the Supabase Table Editor or use a narrowly targeted query:

```sql
select id, product_name, product_url, email, list_price_cents,
       fight_price_cents, coupon_code, target_bid_cents, paid_at
from public.submissions
where status = 'paid' and review_status = 'pending'
order by paid_at asc;

update public.submissions
set review_status = 'approved'
where id = '<verified-submission-uuid>' and status = 'paid';
```

Use `review_status = 'rejected'` for QA, impersonation, broken offers, or non-compliant listings. Under the published refund policy, a genuine paid listing rejected before first publication receives a full refund. Initiate the refund from the Dodo payment detail within 30 days and retain the submission row for the audit trail. Test/QA payments may be rejected without a refund when no real funds were collected.

The webhook must subscribe to `payment.succeeded`, `refund.succeeded`, and `refund.failed`. A signed full `refund.succeeded` event changes the submission to `status = 'refunded'`, forces `review_status = 'rejected'`, and stores the provider outcome in `payment_refunds`. Partial refunds are audited but do not automatically unpublish a listing.

Refund policy operations:

1. Confirm that the request matches the payer email and Dodo payment.
2. For a pre-publication rejection, initiate a full Dodo refund and record a concise reason.
3. For an already-published listing, approve only duplicate/incorrect charges, non-delivery, confirmed fraud, legal requirements, or another published exception.
4. Verify the signed refund webhook, `payment_refunds` row, submission status, and removal from the public board.
5. Never mark a payment refunded manually before Dodo confirms `refund.succeeded`.

### Test Mode to Live Mode

Test and Live Mode credentials are separate. After Dodo approves the merchant account:

1. Create a new Live Mode one-time pay-what-you-want visibility-bid product.
2. Create a least-privilege Live Mode API key.
3. Register `https://www.dealfight.lol/api/payment-webhook` for `payment.succeeded` and copy its Live signing secret.
4. Replace the four `DODO_PAYMENTS_*` Production variables with the Live values and set `DODO_PAYMENTS_ENVIRONMENT=live_mode`.
5. Redeploy Production, complete a controlled live checkout, and verify the signed event, Supabase row, return banner, and Dodo transaction before opening sales broadly.

Never reuse a Test product ID, API key, or webhook secret in Live Mode.

## Verification

```bash
npm run check
npm audit --omit=dev
npx supabase db lint --local --schema public --level warning --fail-on warning
```

For the hosted application, also verify the Production URL, an unsigned webhook rejection, Supabase security/performance advisors, and a mobile Lighthouse run covering performance, accessibility, best practices, and SEO.
