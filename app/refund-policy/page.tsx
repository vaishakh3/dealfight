import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Refund Policy',
  description: 'When Deal Fight visibility payments are refundable and how brands can request help.',
  alternates: { canonical: '/refund-policy' },
};

export default function RefundPolicyPage() {
  return (
    <main className="legal-page">
      <header className="legal-header">
        <Link className="wordmark" href="/" aria-label="Deal Fight home">
          <Image className="site-logo-mark" src="/brand/dealfight-mark-512.png" alt="" width={38} height={38} sizes="38px" priority />
          <b>DEAL<span>FIGHT</span><sup>.LOL</sup></b>
        </Link>
        <Link className="legal-back" href="/">← BACK TO DEALS</Link>
      </header>

      <div className="legal-shell">
        <aside className="legal-summary">
          <span>THE SHORT VERSION</span>
          <strong>Rejected before publication?</strong>
          <b>FULL REFUND.</b>
          <p>Published successfully? The visibility payment is generally final because the sponsored placement has been delivered.</p>
        </aside>

        <article className="legal-content">
          <span className="eyebrow">EFFECTIVE AUGUST 28, 2026</span>
          <h1>Refund policy.</h1>
          <p className="legal-intro">This policy applies to visibility bids paid by brands to place an offer on Deal Fight. It does not cover purchases a shopper makes from a third-party brand after clicking a deal.</p>

          <section>
            <h2>1. Review before publication</h2>
            <p>Payment does not publish a listing automatically. We first review the product, submitter, prices, coupon, destination URL, and offer terms for accuracy, authorization, safety, and compliance.</p>
          </section>

          <section className="legal-highlight">
            <h2>2. Rejected listings receive a full refund</h2>
            <p>If Deal Fight rejects a paid listing before it is first published, we will issue a full refund of that visibility payment through Dodo Payments to the original payment method. The listing will not appear on the public leaderboard.</p>
          </section>

          <section>
            <h2>3. Published listings are generally non-refundable</h2>
            <p>Once a listing has been approved and published, the sponsored placement has begun. Visibility payments are then non-refundable, including when another brand later places a higher bid, the listing moves down the leaderboard, traffic or sales differ from expectations, or the brand stops its offer early.</p>
          </section>

          <section>
            <h2>4. Exceptions after publication</h2>
            <p>We may provide a full or partial refund for a duplicate or incorrect charge, failure by Deal Fight to deliver the paid listing, confirmed fraud or unauthorized payment, or when a refund is required by applicable law. We may request supporting information before deciding a claim.</p>
          </section>

          <section>
            <h2>5. How to request help</h2>
            <p>Email <a href="mailto:vichured@gmail.com">vichured@gmail.com</a> within 30 days of the payment. Include the checkout email, product URL, payment ID if available, and a short explanation. Dodo requires refunds to be initiated within 30 days, so contact us promptly.</p>
          </section>

          <section>
            <h2>6. Refund processing</h2>
            <p>Approved refunds are issued through Dodo Payments to the original payment method. Dodo sends the refund receipt automatically. Bank and payment-network processing times vary and are outside Deal Fight&apos;s control.</p>
          </section>

          <section>
            <h2>7. Shopper purchases</h2>
            <p>Deal Fight does not sell the third-party products shown in shopper offers. Refunds for a purchase made on a brand&apos;s website are governed by that brand&apos;s own terms and must be requested from that brand.</p>
          </section>

          <div className="legal-contact">
            <span>NEED HELP?</span>
            <a href="mailto:vichured@gmail.com">vichured@gmail.com ↗</a>
          </div>
        </article>
      </div>
    </main>
  );
}
