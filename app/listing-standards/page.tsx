import type { Metadata } from 'next';
import { LegalPageShell } from '@/app/legal-page-shell';

export const metadata: Metadata = {
  title: 'Listing Standards',
  description: 'The approval, discount, authorization, and safety rules for deals listed on Deal Fight.',
  alternates: { canonical: '/listing-standards' },
};

export default function ListingStandardsPage() {
  return (
    <LegalPageShell
      eyebrow="EFFECTIVE AUGUST 29, 2026"
      title="Listing standards."
      intro="Every paid submission is reviewed before it can appear. A visibility bid determines sponsored rank only; it never purchases approval or changes the deal shoppers receive."
      summaryTitle="Real product. Real saving."
      summaryAccent="NO SHORTCUTS."
      summaryBody="The product owner must offer a working digital product and a genuine, verifiable discount of at least 10%. Paid rank never overrides review."
    >
      <section className="legal-highlight">
        <h2>1. What we accept</h2>
        <p>Deal Fight accepts usable digital SaaS and software, apps, plugins, developer tools, and templates submitted by the product owner or an authorized team. The product must be live, reasonably complete, and available through a working HTTPS website.</p>
      </section>

      <section>
        <h2>2. A genuine shopper offer is required</h2>
        <p>The Deal Fight price must be at least 10% below an honest, publicly supportable reference price. The coupon or direct redemption path must work, and the submission must clearly disclose eligibility, scope, expiry, renewal pricing, regional limits, and other material terms. Inflated anchors, fake discounts, bait-and-switch pricing, and artificial scarcity are prohibited.</p>
      </section>

      <section>
        <h2>3. Authorization and accuracy</h2>
        <p>Submitters must have authority to represent the product and grant the advertised offer. Product names, claims, prices, screenshots, intellectual property, and destination links must be accurate and lawful. We may request proof of ownership or authorization before publication.</p>
      </section>

      <section>
        <h2>4. What we reject</h2>
        <p>We reject spam, unfinished or low-value products, affiliate or reseller offers, unauthorized licence resale, intellectual-property infringement, scraping, impersonation, surveillance, bypass or cheating tools, deceptive claims, and unlawful or age-restricted content. We also reject adult content, gambling, crypto or NFTs, financial, medical or legal products, weapons, physical goods, travel or ticketing, donations, manual consulting, hosting or telecom resale, gaming or virtual goods, and anything prohibited by Dodo Payments&apos; Merchant Acceptance Policy.</p>
      </section>

      <section>
        <h2>5. Payment buys visibility—not approval</h2>
        <p>A brand pays Deal Fight a one-time advertising fee for sponsored leaderboard visibility. Deal Fight does not process the shopper&apos;s purchase, resell the listed product, or transfer shopper proceeds to the brand. Shoppers redeem directly with the product owner. Rejected pre-publication listings receive the refund described in our refund policy.</p>
      </section>

      <section>
        <h2>6. Monitoring and enforcement</h2>
        <p>We may re-check a live offer at any time. Expired, unavailable, misleading, complained-about, non-delivered, or otherwise non-compliant offers may be corrected, suspended, or removed. Repeat or serious violations may result in permanent blocking and payment-provider escalation.</p>
      </section>
    </LegalPageShell>
  );
}
