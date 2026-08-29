import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPageShell } from '@/app/legal-page-shell';

export const metadata: Metadata = {
  title: 'Platform Terms',
  description: 'Terms for browsing Deal Fight and purchasing sponsored leaderboard visibility.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <LegalPageShell
      eyebrow="EFFECTIVE AUGUST 29, 2026"
      title="Platform terms."
      intro="These terms govern use of Deal Fight by shoppers and by brands submitting offers or purchasing sponsored leaderboard visibility."
      summaryTitle="Clear deal. Clear bid."
      summaryAccent="TWO NUMBERS."
      summaryBody="The shopper offer and the visibility payment are separate. A higher paid total changes sponsored rank; it does not make a product better or guarantee results."
    >
      <section className="legal-highlight">
        <h2>1. Acceptance and authority</h2>
        <p>By using Deal Fight or submitting a listing, you agree to these terms. A brand submitter confirms that they are legally able to contract, are authorized to represent the named product, and can grant the advertised offer.</p>
      </section>

      <section>
        <h2>2. Sponsored ranking</h2>
        <p>Listings are ordered by each brand&apos;s cumulative paid visibility bid, highest first. A new listing starts at a minimum of $5. When the same product raises its total later, the previous paid total is credited and only the difference is due. Rank may move down whenever another brand pays a higher total.</p>
      </section>

      <section>
        <h2>3. Review and publication</h2>
        <p>Payment does not guarantee publication. Every listing is subject to our <Link href="/listing-standards">listing standards</Link> and manual review. We may reject, request changes to, suspend, or remove a listing that is inaccurate, unauthorized, unavailable, harmful, unlawful, or inconsistent with payment-provider rules.</p>
      </section>

      <section>
        <h2>4. Payments and refunds</h2>
        <p>Dodo Payments acts as Merchant of Record for Deal Fight visibility fees and handles checkout, taxes, receipts, and payment support. Refund eligibility is governed by our <Link href="/refund-policy">refund policy</Link>. A listing rejected before first publication receives a full refund; successfully published visibility is generally non-refundable.</p>
      </section>

      <section>
        <h2>5. Shopper offers and third parties</h2>
        <p>Deal Fight advertises third-party products but does not sell, license, deliver, warrant, or support them. Shoppers contract directly with the listed brand. The brand is responsible for the product, coupon, pricing, fulfilment, privacy practices, customer support, and its own terms. Verify material details on the brand&apos;s website before purchasing.</p>
      </section>

      <section>
        <h2>6. No performance guarantee</h2>
        <p>Sponsored visibility does not guarantee clicks, leads, revenue, conversion, availability, or a particular rank duration. Deal Fight may experience interruptions or errors and is provided on an as-available basis to the extent permitted by law.</p>
      </section>

      <section>
        <h2>7. Prohibited use</h2>
        <p>You may not submit misleading information, impersonate a brand, manipulate rankings or engagement, attack or scrape the service, evade safeguards, infringe rights, or use Deal Fight for unlawful activity. We may block access and preserve relevant records when investigating abuse or responding to valid legal requests.</p>
      </section>

      <section>
        <h2>8. Changes and contact</h2>
        <p>We may update these terms prospectively as Deal Fight evolves. The effective date above identifies the current version. Continued use after an update constitutes acceptance where permitted by law. Questions can be sent to <a href="mailto:vichured@gmail.com">vichured@gmail.com</a>.</p>
      </section>
    </LegalPageShell>
  );
}
