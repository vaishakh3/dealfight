# Deal Fight research and positioning

Last reviewed: 28 August 2026

## Executive conclusion

The pay-to-rank mechanic is proven to attract attention because the entire product can be explained in one sentence: pay more, move higher. The live amount, visible rank, public outbids, and screenshot-friendly leaderboard turn each purchase into content.

That simplicity also makes the mechanic easy to clone. A directory tracking the genre currently lists hundreds of boards, while most visible copycats report only modest revenue. The market is power-law: the original captures the story and attention; undifferentiated copies inherit the mechanic without inheriting the audience.

Deal Fight should therefore **not** position itself as another generic pay-to-rank directory. Its durable reason to exist is:

> Brands compete with their visibility bid. Shoppers compare a separate, exclusive deal.

The bid answers “why is this listing here?” The offer answers “why should I click?” Keeping those numbers visually and technically separate is the product.

## What Outbid demonstrates

The live Outbid board uses a cumulative public dollar amount as rank, shows click counts, and places a specific “claim this rank” price beside each row. Its leading rows currently show five-figure bids and tens of thousands of clicks. This produces four reinforcing effects:

1. **Perfect legibility** — rank has one input and anybody can audit it.
2. **Status competition** — losing a position creates a reason to pay again.
3. **Public proof** — bids, clicks, movement, and buyer testimonials create launch content.
4. **Permanent inventory** — an outbid listing moves down instead of disappearing, so there are many monetizable rows rather than one winner.

The clone wave confirms that the mechanic is easy to reproduce. The ecosystem directory `outbid.fyi` currently reports 347 boards and roughly $318,000 in combined revenue, while explicitly warning that its revenue figures are unverified. Its visible list is dominated by boards with tens or low hundreds of dollars, with only a few materially larger outcomes. Those figures are useful as directional evidence of a power-law market, not as a Deal Fight revenue forecast.

## Competitive patterns observed

| Pattern | Hook | Strength | Structural weakness |
| --- | --- | --- | --- |
| Generic website leaderboard | “Pay to be #1” | Instantly understood | No reason for shoppers to return after the joke fades |
| Vertical directory | “Own #1 in AI/design/apps” | Better buyer relevance | Still interchangeable with dozens of niche clones |
| Daily reset board | “A fresh race every day” | Recurring inventory and urgency | Payments feel temporary; resets can punish long-term buyers |
| Map, pixel, or physical-object auction | “Own a visible piece” | Highly screenshotable | Novelty often overwhelms utility |
| Game-gated placement | “Pay to enter, skill decides rank” | Audience participation | Weak link between gameplay and advertiser outcomes |
| Deal Fight | “Brands fight; shoppers save” | Two-sided value and measurable consumer intent | Requires genuine offers, review operations, and consumer distribution |

Deal Fight scores best when evaluated for repeat consumer value, credible advertiser value, and room to build a brand beyond the initial stunt. It is harder operationally than a generic board; that difficulty is also the moat.

## Product rules

The launch product follows these invariants:

- A new listing starts with at least a $5 total visibility bid.
- A higher lifetime paid total ranks above a lower total.
- A brand raising its own total pays only the difference, with a $5 minimum increase.
- Rank may change whenever another brand pays; no position is guaranteed.
- The shopper deal must be at least 10% below the stated public price.
- The shopper price, saving, and coupon are never affected by the visibility bid.
- Payment alone does not publish a deal. Paid submissions remain pending until the product, submitter, public price, coupon, and terms are reviewed.
- Every paid position is labeled `SPONSORED`, and outbound paid links use `rel="sponsored"`.
- A rejected or QA listing never reaches the public board.

## Why the current UX is differentiated

Generic boards make one number do everything. Deal Fight deliberately presents two independent values:

| Shopper question | Visible answer |
| --- | --- |
| What do I receive? | Deal price, regular price, percentage saving, coupon, and terms |
| Why is this ranked here? | Clearly labeled lifetime visibility bid |
| Is the deal ranked as “best”? | No. The page states that placement is paid, not an editorial award |

The live listing form mirrors the public card before checkout. A founder sees the customer-facing offer, estimated rank, total bid, existing paid credit, and exact balance as distinct concepts. This directly addresses the largest comprehension risk in the model.

## Viral loops worth building after launch density

Do not add every loop at once. The first three are the highest-leverage follow-ons after real listings exist.

1. **Outbid notification** — email a brand when it loses rank with the exact incremental amount required to recover it.
2. **Shareable rank card** — generate an image showing the offer, current position, and saving; give brands a reason to distribute Deal Fight themselves.
3. **Live rank badge** — an embeddable badge on the brand’s own site creates backlinks, status, and returning checks.
4. **Public activity feed** — “Brand X moved from #7 to #2” turns transactions into social proof without publishing private payment data.
5. **Category crowns** — award visible #1-in-category status once each category has enough real competition.
6. **Deal redemption proof** — report aggregate unlocks/clicks so brands can compare placement cost with shopper intent.
7. **Timed events** — only after lifetime ranking is healthy, test a weekly “deal fight” as supplemental inventory rather than resetting the canonical board.

## Launch experiments

### Phase 1 — prove supply quality

- Recruit 20–30 software founders manually.
- Require a deal that is not available on the public pricing page.
- Review every coupon before approval.
- Keep the board global and simple until there are enough listings for meaningful category competition.
- Publish only aggregate, real metrics; never manufacture bidder counts, revenue, clicks, or urgency.

Success gate: at least 10 approved offers, at least 70% of submitted coupons still valid after seven days, and a measurable shopper click rate.

### Phase 2 — prove the paid loop

- Test the $5 floor against a $9 or $10 floor for new listings.
- Send rank-loss notifications to a small cohort.
- Measure rebid rate and time-to-rebid.
- Interview brands that paid but did not rebid; distinguish lack of traffic from lack of rank pressure.

Success gate: repeat bids from at least 15% of paying brands and no material increase in refunds, disputes, or offer failures.

### Phase 3 — prove distribution

- Launch shareable cards and live badges.
- Publish a weekly roundup of the largest shopper savings, not the largest bidders.
- Partner with founder communities and deal newsletters using tracked links.
- Add category landing pages only when each page has enough real inventory to be useful.

Success gate: brand-driven referral traffic becomes a meaningful acquisition channel, while shopper deal clicks remain the primary value signal.

## Metrics that matter

Revenue alone can hide a board with no consumer value. Track both sides:

- Approved paid listings per week
- Submission → checkout conversion
- Checkout → successful payment conversion
- Rejection and refund rate
- Percentage of coupons that pass recurring verification
- Shopper deal-view and outbound-click rate
- Revenue per visitor and revenue per approved listing
- Percentage of brands that increase a bid
- Median time until a rank is challenged
- Brand-sourced referral traffic
- Consumer return rate

## Principal risks and controls

| Risk | Control already implemented or required |
| --- | --- |
| Shoppers mistake rank for recommendation | Persistent `SPONSORED` labels and direct explanation that rank is paid |
| Bid confused with shopper price | Separate visual panels, form sections, preview, and checkout summary |
| Fake discount or broken coupon | Manual approval after payment; periodic re-verification remains an operating requirement |
| Fake traction | Only three disclosed internal launch listings; never publish fabricated activity or customer metrics |
| Payment spoofing | Server-owned amount, Dodo checkout session, raw-body signature verification, exact metadata/cart/customer checks |
| Localized tax/currency confusion | Store customer charge and settlement with explicit currencies; keep rank denominated in USD |
| Spam and abandoned checkout abuse | HMAC-keyed server rate limits; no raw IP storage |
| Paid-link search abuse | Outbound listing links use `rel="sponsored"` |
| Hidden commercial relationship | Placement label is adjacent to every ranked deal, not buried on a legal page |
| Bad actor impersonates a brand | Review submitter authority before approval; do not auto-publish after payment |
| Clone fatigue | Lead with exclusive deal utility rather than the Outbid reference |

## Evidence and limitations

- [Outbid live board](https://outbid.lol/) — primary evidence for the rank, bid, click, category, and incremental-claim mechanics.
- [outbid.fyi ecosystem directory](https://outbid.fyi/) — directional clone and revenue data; the site itself says its revenue figures are unverified.
- [Outbidception explanation](https://www.outbidception.lol/about) — an example of recursive virality, shareable badges, permanent placement, and clear digital-advertising language.
- [Outbidded rules](https://outbidded.lol/) — an example of cumulative bids, difference-only top-ups, explicit sponsored links, and search-safe paid-link handling.
- [Google Search Central paid-link guidance](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links) — paid placements should use the `sponsored` link relation.
- [FTC endorsement guidance](https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking) — commercial connections should be disclosed clearly, conspicuously, and close to the relevant claim.

Outbid and clone totals change continuously. Public testimonials and third-party revenue counters are not audited financial statements. This brief treats them as market signals, not guaranteed outcomes.
