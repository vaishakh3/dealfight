import type { Metadata } from 'next';
import { LegalPageShell } from '@/app/legal-page-shell';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Deal Fight collects, uses, stores, and shares information.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <LegalPageShell
      eyebrow="EFFECTIVE AUGUST 29, 2026"
      title="Privacy policy."
      intro="This policy explains the limited information Deal Fight processes when people browse deals, submit a listing, or pay for sponsored visibility."
      summaryTitle="Useful data only."
      summaryAccent="NO DATA SALE."
      summaryBody="We use listing and technical information to operate, secure, review, and improve Deal Fight. We do not sell personal information."
    >
      <section className="legal-highlight">
        <h2>1. Information we collect</h2>
        <p>When a brand submits a listing, we collect its work email, product name and URL, offer details, coupon, category, and chosen visibility bid. We store payment identifiers and status received from Dodo Payments, but Deal Fight does not receive or store full card or bank details.</p>
      </section>

      <section>
        <h2>2. Browsing and security information</h2>
        <p>We record limited engagement events such as viewing or claiming an offer. For abuse prevention, the server converts request-address information into a one-way keyed fingerprint used for short-lived rate limits; raw IP addresses are not stored in the Deal Fight database. Our hosting and payment providers may process standard device, browser, network, and diagnostic information under their own policies.</p>
      </section>

      <section>
        <h2>3. How we use information</h2>
        <p>We use information to validate and publish listings, calculate sponsored rank, create and reconcile checkout sessions, prevent fraud and duplicate activity, handle support and refunds, enforce listing standards, measure aggregate engagement, and comply with legal or payment-network obligations.</p>
      </section>

      <section>
        <h2>4. Service providers</h2>
        <p>Deal Fight relies on Supabase for protected database services, Vercel for application hosting, and Dodo Payments as Merchant of Record for checkout, receipts, taxes, payment support, and refunds. Information is shared with these providers only as needed to deliver those functions or meet legal and compliance requirements.</p>
      </section>

      <section>
        <h2>5. Retention and security</h2>
        <p>We retain listing and payment-audit records for as long as reasonably required for operations, disputes, fraud prevention, accounting, and legal compliance. We use access controls, encrypted transport, server-only credentials, signed webhooks, and row-level database protections, but no internet service can guarantee absolute security.</p>
      </section>

      <section>
        <h2>6. Your choices and requests</h2>
        <p>You may ask to access, correct, or delete personal information associated with a listing, subject to records we must retain for payments, fraud prevention, disputes, or law. Email <a href="mailto:vichured@gmail.com">vichured@gmail.com</a> from the submission address so we can verify the request.</p>
      </section>

      <section>
        <h2>7. Updates</h2>
        <p>We may update this policy as the service or legal requirements change. The effective date above identifies the current version. Material changes will be reflected on this page before they apply.</p>
      </section>
    </LegalPageShell>
  );
}
