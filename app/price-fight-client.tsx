'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { CtaArrow } from '@/app/cta-arrow';
import { categories, listings as launchListings, type Listing } from '@/lib/leaderboard-data';

type BidModalState = {
  type: 'bid';
  targetBid: number;
};

type DealModalState = {
  type: 'deal';
  listing: Listing;
};

type ModalState = BidModalState | DealModalState | null;

type CheckoutNotice = 'checking' | 'paid' | 'pending' | 'cancelled' | 'refunded' | 'error';

const checkoutNotices: Record<CheckoutNotice, { title: string; message: string }> = {
  checking: {
    title: 'VERIFYING PAYMENT',
    message: 'Secure checkout has returned. We are waiting for Dodo’s signed confirmation.',
  },
  paid: {
    title: 'PAYMENT CONFIRMED',
    message: 'Your visibility bid is secured. We’ll review the deal before it appears on the board.',
  },
  pending: {
    title: 'CONFIRMATION PENDING',
    message: 'Dodo is still finalizing the payment. Please don’t pay again; refresh this page in a minute.',
  },
  cancelled: {
    title: 'NO PAYMENT MADE',
    message: 'Checkout was cancelled or unsuccessful. Your listing request was not published.',
  },
  refunded: {
    title: 'PAYMENT REFUNDED',
    message: 'This visibility payment was refunded and the listing is not active.',
  },
  error: {
    title: 'STATUS UNAVAILABLE',
    message: 'We could not verify the result yet. Check your Dodo receipt before trying another payment.',
  },
};

type SubmissionResult = {
  submissionId: string;
  discountPercent: number;
  targetBidCents: number;
  previousBidCents: number;
  amountDueCents: number;
};

const wholeDollarFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});
const preciseDollarFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

type PlacementChoice = { label: string; detail: string; amount: number };

function formatMoney(value: number) {
  return (value % 1 === 0 ? wholeDollarFormatter : preciseDollarFormatter).format(value);
}

function BrandMark({ listing, large = false }: { listing: Listing; large?: boolean }) {
  const size = large ? 64 : 52;
  const initials = listing.name.trim().split(/\s+/).map((word) => word[0]).join('').slice(0, 2).toUpperCase();

  return (
    <span className={`brand-mark ${listing.logo ? 'has-logo' : ''} ${large ? 'large' : ''}`} aria-hidden="true">
      {listing.logo ? <Image src={listing.logo} alt="" width={size} height={size} sizes={`${size}px`} /> : initials}
    </span>
  );
}

function DealFightWordmark({ priority = false }: { priority?: boolean }) {
  return (
    <>
      <Image className="site-logo-mark" src="/brand/dealfight-mark-512.png" alt="" width={38} height={38} sizes="38px" priority={priority} />
      <b>DEAL<span>FIGHT</span><sup>.LOL</sup></b>
    </>
  );
}

async function recordEvent(offerId: string, type: 'claim' | 'click' | 'share') {
  try {
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offerId, type }),
    });
  } catch {
    // The visitor's action should never depend on analytics.
  }
}

function DealModal({ listing, rank, onClose }: { listing: Listing; rank: number; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard?.writeText(listing.coupon);
    } catch {
      // Still reveal the code as copied feedback when clipboard access is restricted.
    }
    setCopied(true);
    recordEvent(listing.id, 'claim');
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="modal-shell" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal-card deal-modal" role="dialog" aria-modal="true" aria-labelledby="deal-title">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close deal">×</button>
        <div className="dialog-kicker"><span>SHOPPER OFFER</span><span>Sponsored #{rank}</span></div>
        <div className="deal-brand">
          <BrandMark listing={listing} large />
          <div><h2 id="deal-title">{listing.name}</h2><p>{listing.tagline}</p></div>
        </div>
        <div className="deal-price-panel">
          <span>{listing.dealLabel}</span>
          <strong>{listing.dealPrice}</strong>
          <p>Regularly <s>{listing.regularPrice}</s> · <b>{listing.savings}</b></p>
        </div>
        <p className="offer-terms">{listing.dealDetails}</p>
        <div className="coupon-box">
          <span>Your coupon code</span>
          <strong>{listing.coupon}</strong>
          <button type="button" onClick={copyCode}>{copied ? 'COPIED ✓' : 'COPY CODE'}</button>
        </div>
        <a className="modal-primary" href={listing.url} target="_blank" rel="noopener noreferrer sponsored" onClick={() => recordEvent(listing.id, 'click')}>
          Go to {listing.name} <CtaArrow />
        </a>
        <div className="sponsor-explainer">
          <b>Why is this sponsored #{rank}?</b>
          <p>{listing.name} has committed {formatMoney(listing.totalBid)} for this placement. That payment determines rank; the shopper offer above is separate.</p>
        </div>
      </section>
    </div>
  );
}

function ListingPreview({
  productName,
  tagline,
  category,
  listPrice,
  dealPrice,
  couponCode,
  totalBid,
  boardListings,
  mobileActive,
  onEdit,
}: {
  productName: string;
  tagline: string;
  category: string;
  listPrice: number;
  dealPrice: number;
  couponCode: string;
  totalBid: number;
  boardListings: Listing[];
  mobileActive: boolean;
  onEdit: () => void;
}) {
  const discount = listPrice > dealPrice && dealPrice > 0 ? Math.round((1 - dealPrice / listPrice) * 100) : 0;
  const estimatedRank = 1 + boardListings.filter((item) => item.totalBid >= totalBid).length;
  const initials = productName.trim().split(/\s+/).map((word) => word[0]).join('').slice(0, 2).toUpperCase() || 'YO';

  return (
    <aside className={`listing-preview ${mobileActive ? 'mobile-active' : ''}`} aria-label="Live shopper preview">
      <div className="preview-heading"><span>LIVE SHOPPER PREVIEW</span><b>This is how your listing appears</b></div>
      <article className="preview-card">
        <div className="preview-rank"><b>#{estimatedRank}</b><span>Sponsored placement</span></div>
        <div className="preview-product">
          <span className="brand-mark">{initials}</span>
          <div><small>{category}</small><h3>{productName || 'Your product'}</h3><p>{tagline || 'Your one-line product promise appears here.'}</p></div>
        </div>
        <div className="preview-offer">
          <span>EXCLUSIVE SHOPPER OFFER</span>
          <strong>{discount > 0 ? `${discount}% OFF` : 'YOUR DEAL'}</strong>
          <p><b>{dealPrice > 0 ? formatMoney(dealPrice) : '$—'}</b> <s>{listPrice > 0 ? formatMoney(listPrice) : '$—'}</s></p>
          <small>Code: {couponCode || 'YOURCODE'}</small>
        </div>
        <div className="preview-cta">GET THIS DEAL <CtaArrow /></div>
        <div className="preview-disclosure">Sponsored rank based on a {formatMoney(totalBid || 0)} visibility bid</div>
      </article>
      <div className="separation-note">
        <div><span>SHOPPER GETS</span><b>{discount > 0 ? `${discount}% off` : 'Your offer'}</b></div>
        <span className="not-equal">≠</span>
        <div><span>YOU BID FOR VISIBILITY</span><b>{formatMoney(totalBid || 0)}</b></div>
      </div>
      <p className="preview-help">These are independent numbers. Changing your placement bid never changes the price customers pay.</p>
      <button className="mobile-edit-button" type="button" onClick={onEdit}>← EDIT MY LISTING</button>
    </aside>
  );
}

function BidModal({ targetBid, boardListings, placementChoices, onClose }: { targetBid: number; boardListings: Listing[]; placementChoices: PlacementChoice[]; onClose: () => void }) {
  const [productName, setProductName] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState('AI');
  const [couponCode, setCouponCode] = useState('');
  const [listPrice, setListPrice] = useState(100);
  const [dealPrice, setDealPrice] = useState(50);
  const [totalBid, setTotalBid] = useState(targetBid);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'checkout'>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [mobilePanel, setMobilePanel] = useState<'edit' | 'preview'>('edit');

  const switchMobilePanel = (panel: 'edit' | 'preview') => {
    setMobilePanel(panel);
    window.requestAnimationFrame(() => {
      const modalCard = document.querySelector<HTMLElement>('.bid-modal');
      const modalHeader = document.querySelector<HTMLElement>('.bid-modal-header');
      modalCard?.scrollTo({ top: modalHeader?.offsetHeight ?? 0, behavior: 'auto' });
    });
  };

  const discount = !listPrice || !dealPrice || dealPrice >= listPrice
    ? 0
    : Math.round((1 - dealPrice / listPrice) * 100);

  const estimatedRank = 1 + boardListings.filter((item) => item.totalBid >= totalBid).length;
  const continueToCheckout = async () => {
    if (!result) return;
    setError('');
    setStatus('checkout');

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId: result.submissionId }),
      });
      const payload = await response.json() as { checkoutUrl?: string; error?: string };
      if (!response.ok || !payload.checkoutUrl) {
        throw new Error(payload.error || 'Secure checkout could not be opened.');
      }
      window.location.assign(payload.checkoutUrl);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'Secure checkout could not be opened.');
      setStatus('idle');
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setStatus('submitting');
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          productUrl: form.get('productUrl'),
          email: form.get('email'),
          tagline,
          couponCode,
          category,
          listPrice,
          dealPrice,
          targetBid: totalBid,
        }),
      });
      const payload = await response.json() as SubmissionResult & { error?: string };
      if (!response.ok) throw new Error(payload.error || 'We could not save that listing.');
      setResult(payload);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Try that again.');
    } finally {
      setStatus('idle');
    }
  };

  if (result) {
    return (
      <div className="modal-shell" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
        <section className="modal-card success-view" role="dialog" aria-modal="true" aria-labelledby="bid-title">
          <button className="modal-close" type="button" onClick={onClose} aria-label="Close dialog">×</button>
          <span className="success-check">✓</span>
          <span className="eyebrow">LISTING READY FOR CHECKOUT</span>
          <h2 id="bid-title">Secure your {formatMoney(result.targetBidCents / 100)} visibility bid.</h2>
          <p>Your customer offer is <strong>{result.discountPercent}% off</strong>. It stays separate from your placement spend.</p>
          <div className="success-summary">
            <div><span>Total visibility bid</span><b>{formatMoney(result.targetBidCents / 100)}</b></div>
            <div><span>Previously paid</span><b>{formatMoney(result.previousBidCents / 100)}</b></div>
            <div><span>Balance at checkout</span><b>{formatMoney(result.amountDueCents / 100)}</b></div>
          </div>
          <div className="success-note">
            Dodo&apos;s secure checkout collects the balance below. Taxes, if required, are shown separately before payment. Your deal is reviewed before it appears on the board.
            <b> Rejected before publication? We refund the visibility payment in full.</b>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="modal-primary" type="button" onClick={continueToCheckout} disabled={status === 'checkout'}>
            {status === 'checkout' ? 'OPENING SECURE CHECKOUT…' : `CONTINUE · ${formatMoney(result.amountDueCents / 100)} BALANCE`} <CtaArrow />
          </button>
          <p className="payment-policy-note">By continuing, you confirm the offer is accurate and agree to our <Link href="/terms" target="_blank">platform terms</Link>, <Link href="/listing-standards" target="_blank">listing standards</Link>, and <Link href="/refund-policy" target="_blank">refund policy</Link>. Once a listing is published, visibility payments are non-refundable except for an exception stated in that policy.</p>
          <button className="success-secondary" type="button" onClick={onClose}>Not now — back to the deals</button>
        </section>
      </div>
    );
  }

  return (
    <div className="modal-shell" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal-card bid-modal" role="dialog" aria-modal="true" aria-labelledby="bid-title">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close listing form">×</button>
        <div className="bid-modal-header">
          <div><span className="eyebrow">FOR BRANDS</span><h2 id="bid-title">List a deal people want.</h2></div>
          <p>Your offer wins the customer. Your separate visibility bid determines where the listing appears.</p>
        </div>
        <div className="mobile-modal-nav">
          <div className="mobile-modal-tabs" role="tablist" aria-label="Listing editor views">
            <button type="button" role="tab" aria-selected={mobilePanel === 'edit'} className={mobilePanel === 'edit' ? 'active' : ''} onClick={() => switchMobilePanel('edit')}>1. EDIT LISTING</button>
            <button type="button" role="tab" aria-selected={mobilePanel === 'preview'} className={mobilePanel === 'preview' ? 'active' : ''} onClick={() => switchMobilePanel('preview')}>2. LIVE PREVIEW</button>
          </div>
          <button className="mobile-tab-close" type="button" onClick={onClose} aria-label="Close listing form">×</button>
        </div>
        <div className="bid-modal-layout">
          <form className={mobilePanel === 'edit' ? 'mobile-active' : ''} onSubmit={submit}>
            <fieldset>
              <legend><span>1</span><div>Your product<small>What shoppers should understand at a glance</small></div></legend>
              <div className="field-pair">
                <label>Product name<input autoFocus value={productName} onChange={(event) => setProductName(event.target.value)} required minLength={2} maxLength={60} placeholder="Acme Pro" /></label>
                <label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.filter((item) => item !== 'All').map((item) => <option key={item}>{item}</option>)}</select></label>
              </div>
              <label>One-line promise<input value={tagline} onChange={(event) => setTagline(event.target.value)} required minLength={8} maxLength={140} placeholder="What does your product help people achieve?" /></label>
              <div className="field-pair">
                <label>Product URL<input name="productUrl" required inputMode="url" placeholder="https://yourproduct.com" /></label>
                <label>Work email<input name="email" type="email" required placeholder="you@company.com" /></label>
              </div>
            </fieldset>

            <fieldset className="offer-fieldset">
              <legend><span>2</span><div>Your shopper offer<small>This is the price visitors receive—not your bid</small></div></legend>
              <div className="field-pair price-pair">
                <label>Regular public price ($)<input type="number" min="1" step="0.01" required value={listPrice} onChange={(event) => setListPrice(Number(event.target.value))} /></label>
                <label>Deal price for shoppers ($)<input type="number" min="0.01" step="0.01" required value={dealPrice} onChange={(event) => setDealPrice(Number(event.target.value))} /></label>
                <div className={`discount-chip ${discount >= 10 ? 'valid' : ''}`}><span>SHOPPER SAVES</span><b>{discount}%</b></div>
              </div>
              <label>Coupon code<input value={couponCode} onChange={(event) => setCouponCode(event.target.value.toUpperCase())} required minLength={3} maxLength={32} placeholder="DEAL50" /></label>
            </fieldset>

            <fieldset className="placement-fieldset">
              <legend><span>3</span><div>Your visibility bid<small>This only controls sponsored placement</small></div></legend>
              <div className="placement-choices">
                {placementChoices.map((choice) => (
                  <button className={totalBid === choice.amount ? 'active' : ''} type="button" key={choice.label} onClick={() => setTotalBid(choice.amount)}>
                    <span>{choice.label}</span><b>{formatMoney(choice.amount)}</b><small>{choice.detail}</small>
                  </button>
                ))}
              </div>
              <label className="custom-bid">Or set your own total visibility bid
                <span><b>$</b><input type="number" min="5" step="1" required value={totalBid} onChange={(event) => setTotalBid(Number(event.target.value))} /></span>
              </label>
              <div className="rank-estimate"><span>Estimated sponsored placement</span><b>#{estimatedRank}</b><small>Based on the current leaderboard. Rank can change when brands bid.</small></div>
            </fieldset>

            <div className="checkout-clarity">
              <div><span>SHOPPERS SEE</span><b>{discount}% off</b></div>
              <div><span>YOUR SPONSORED RANK</span><b>About #{estimatedRank}</b></div>
              <div><span>YOUR VISIBILITY BID</span><b>{formatMoney(totalBid)}</b></div>
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="mobile-preview-button" type="button" onClick={() => switchMobilePanel('preview')}>PREVIEW WHAT SHOPPERS SEE <span>→</span></button>
            <button className="modal-primary" type="submit" disabled={status === 'submitting' || discount < 10 || totalBid < 5}>
              {status === 'submitting' ? 'SAVING YOUR LISTING…' : 'REVIEW & CONTINUE TO PAYMENT'} <CtaArrow />
            </button>
            <small>No charge happens on this step. You&apos;ll review the exact placement balance in secure checkout before paying.</small>
          </form>

          <ListingPreview productName={productName} tagline={tagline} category={category} listPrice={listPrice} dealPrice={dealPrice} couponCode={couponCode} totalBid={totalBid} boardListings={boardListings} mobileActive={mobilePanel === 'preview'} onEdit={() => switchMobilePanel('edit')} />
        </div>
      </section>
    </div>
  );
}

function DealRow({ listing, rank, onOpen }: { listing: Listing; rank: number; onOpen: () => void }) {
  return (
    <article className={`deal-row ${rank <= 3 ? `top-${rank}` : ''}`}>
      <div className="rank-cell"><b>#{rank}</b><span>SPONSORED</span><small>{formatMoney(listing.totalBid)} bid</small></div>
      <div className="product-cell">
        <BrandMark listing={listing} />
        <div><span className="category-label">{listing.category}</span><h3>{listing.name}</h3><p>{listing.tagline}</p></div>
      </div>
      <div className="consumer-offer">
        <span className="deal-pill">{listing.dealLabel}</span>
        <div><strong>{listing.dealPrice}</strong><small>Regularly <s>{listing.regularPrice}</s></small></div>
        <b>{listing.savings}</b>
      </div>
      <div className="social-proof"><b>{formatMoney(listing.totalBid)}</b><span>visibility bid</span></div>
      <button className="get-deal-button" type="button" onClick={onOpen}>VIEW DEAL <CtaArrow /></button>
      <div className="placement-disclosure">Rank #{rank} because {listing.name}&apos;s visibility bid is {formatMoney(listing.totalBid)}</div>
    </article>
  );
}

export default function PriceFightClient({ initialListings = launchListings }: { initialListings?: Listing[] }) {
  const [category, setCategory] = useState<(typeof categories)[number]>('All');
  const [modal, setModal] = useState<ModalState>(null);
  const [checkoutNotice, setCheckoutNotice] = useState<CheckoutNotice | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const orderedListings = [...initialListings].sort((a, b) => b.totalBid - a.totalBid);
  const listingRanks = new Map(orderedListings.map((listing, index) => [listing.id, index + 1]));
  const boardCategories = ['All', ...new Set(orderedListings.map((listing) => listing.category))];
  const placementChoices: PlacementChoice[] = [
    { label: 'Top spot', detail: 'Above the current #1', amount: orderedListings[0].totalBid + 1 },
    { label: 'Top two', detail: 'Above the current #2', amount: orderedListings[1].totalBid + 1 },
    { label: 'Top three', detail: 'Above the current #3', amount: orderedListings[2].totalBid + 1 },
    { label: 'Join board', detail: 'Get your first listing live', amount: 5 },
  ];
  const ranked = orderedListings.filter((listing) => category === 'All' || listing.category === category);
  const currentLeader = orderedListings[0];
  const claimTopBid = currentLeader.totalBid + 1;

  const openModal = (nextModal: Exclude<ModalState, null>) => {
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setModal(nextModal);
  };

  const closeModal = () => {
    setModal(null);
    window.requestAnimationFrame(() => returnFocusRef.current?.focus());
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get('checkout');
    const paymentStatus = params.get('status');
    const submissionId = params.get('submission');
    const paymentReturned = checkout === 'return' || paymentStatus === 'succeeded';
    const paymentCancelled = checkout === 'cancelled' || paymentStatus === 'cancelled' || paymentStatus === 'failed';
    let stopped = false;

    if (paymentCancelled) {
      window.setTimeout(() => setCheckoutNotice('cancelled'), 0);
    } else if (paymentReturned && submissionId) {
      window.setTimeout(() => setCheckoutNotice('checking'), 0);
      const checkPayment = async () => {
        for (let attempt = 0; attempt < 8 && !stopped; attempt += 1) {
          try {
            const response = await fetch(`/api/submission-status?submission=${encodeURIComponent(submissionId)}`, {
              cache: 'no-store',
            });
            const payload = await response.json() as { status?: string };
            if (!response.ok) throw new Error('Status request failed');
            if (payload.status === 'paid') {
              setCheckoutNotice('paid');
              return;
            }
            if (payload.status === 'refunded') {
              setCheckoutNotice('refunded');
              return;
            }
            if (payload.status === 'cancelled') {
              setCheckoutNotice('cancelled');
              return;
            }
          } catch {
            if (attempt === 7 && !stopped) setCheckoutNotice('error');
          }

          await new Promise((resolve) => window.setTimeout(resolve, 1500 + attempt * 350));
        }
        if (!stopped) setCheckoutNotice('pending');
      };
      void checkPayment();
    } else if (paymentReturned) {
      window.setTimeout(() => setCheckoutNotice('pending'), 0);
    }

    if (checkout || paymentStatus) {
      params.delete('checkout');
      params.delete('status');
      params.delete('payment_id');
      params.delete('email');
      params.delete('submission');
      const nextSearch = params.toString();
      window.history.replaceState({}, '', `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`);
    }

    return () => {
      stopped = true;
    };
  }, []);

  useEffect(() => {
    if (!modal) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setModal(null);
      window.requestAnimationFrame(() => returnFocusRef.current?.focus());
    };
    document.body.classList.add('modal-open');
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [modal]);

  const scrollToDeals = () => document.getElementById('deals')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <main id="top">
      <div id="page-content" inert={modal ? true : undefined} aria-hidden={modal ? true : undefined}>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="DEALFIGHT.LOL home"><DealFightWordmark priority /></a>
        <nav aria-label="Main navigation"><a href="#deals">Browse deals</a><a href="#how-ranking-works">How ranking works</a><a href="#for-brands">For brands</a></nav>
        <button className="header-cta" type="button" onClick={() => openModal({ type: 'bid', targetBid: 5 })}><span className="desktop-only">FOR BRANDS: </span>GET LISTED <b><CtaArrow /></b></button>
      </header>

      <div className="preview-banner"><b>DEALS FIRST</b><span>Brands bid for visibility. You compare the actual offer.</span></div>
      {checkoutNotice && <div className={`checkout-return-banner ${checkoutNotice}`} role="status" aria-live="polite"><b>{checkoutNotices[checkoutNotice].title}</b><span>{checkoutNotices[checkoutNotice].message}</span><button type="button" onClick={() => setCheckoutNotice(null)} aria-label="Dismiss payment message">×</button></div>}

      <section className="consumer-hero">
        <div className="hero-copy">
          <span className="eyebrow">EXCLUSIVE SOFTWARE DEALS</span>
          <h1>Brands fight.<br /><em>You save.</em></h1>
          <p>Discover useful products with discounts you won&apos;t find on their public pricing pages.</p>
          <div className="hero-actions">
            <button className="primary-cta" type="button" onClick={scrollToDeals}>BROWSE TODAY&apos;S DEALS <span>↓</span></button>
            <a href="#how-ranking-works">Why are deals ranked? <span>→</span></a>
          </div>
          <div className="hero-trust"><span>✓ Every offer is at least 10% off</span><span>✓ Paid placements are clearly labeled</span></div>
        </div>

        <article className="featured-deal">
          <div className="featured-topline"><span>FEATURED DEAL</span><span>SPONSORED #1</span></div>
          <div className="featured-brand"><BrandMark listing={currentLeader} large /><div><small>{currentLeader.category}</small><h2>{currentLeader.name}</h2><p>{currentLeader.tagline}</p></div></div>
          <div className="featured-offer"><span>{currentLeader.dealLabel}</span><strong>{currentLeader.dealPrice}</strong><p>Regularly <s>{currentLeader.regularPrice}</s> · <b>{currentLeader.savings}</b></p></div>
          <button type="button" onClick={() => openModal({ type: 'deal', listing: currentLeader })}>UNLOCK THIS DEAL <CtaArrow /></button>
          <p className="featured-disclosure"><b>Why #1?</b> {currentLeader.name} has the highest visibility bid. That decides placement—not the discount.</p>
        </article>
      </section>

      <section className="consumer-proof" aria-label="Marketplace promises">
        <div><strong>70%</strong><span>largest listed saving</span></div>
        <div><strong>{orderedListings.length}</strong><span>offers on the board</span></div>
        <div><strong>10%+</strong><span>minimum shopper discount</span></div>
        <div><strong>100%</strong><span>sponsored ranks disclosed</span></div>
      </section>

      <section className="ranking-explainer" id="how-ranking-works">
        <div><span className="eyebrow">ONE IMPORTANT THING</span><h2>The rank is paid.<br />The saving is yours.</h2></div>
        <div className="ranking-equation">
          <article><span>FOR BRANDS</span><b>$</b><h3>Visibility bid</h3><p>Brands choose how much to commit for placement. Highest total gets #1.</p></article>
          <span className="equation-plus">+</span>
          <article><span>FOR SHOPPERS</span><b>%</b><h3>Exclusive offer</h3><p>A separate discount of at least 10% gives you a reason to click.</p></article>
          <span className="equation-equals">=</span>
          <article className="equation-result"><span>THE RESULT</span><b><CtaArrow /></b><h3>Useful sponsored deals</h3><p>Clear paid rankings without pretending the highest bidder has the best discount.</p></article>
        </div>
      </section>

      <section className="deals-section" id="deals">
        <div className="section-heading">
          <div><span className="eyebrow">THE SPONSORED DEAL BOARD</span><h2>Pick the offer<br />that works for you.</h2></div>
          <p>Rank shows what a brand paid for visibility. The large green offer shows exactly what you receive.</p>
        </div>
        <div className="board-key" role="note" aria-label="How to read the deal board">
          <span><b>SPONSORED #</b> Paid placement</span><span><b>GREEN OFFER</b> Your price and saving</span><span><b>VIEW DEAL</b> Full terms and coupon</span>
        </div>
        <div className="category-group" role="group" aria-label="Filter deals by category">
          {boardCategories.map((item) => <button type="button" key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item as (typeof categories)[number])}>{item}</button>)}
        </div>
        <div className="deal-board">
          {ranked.map((listing) => <DealRow key={listing.id} listing={listing} rank={listingRanks.get(listing.id) ?? orderedListings.length} onOpen={() => openModal({ type: 'deal', listing })} />)}
          {!ranked.length && <div className="empty-board">No sponsored deals in this category yet.</div>}
        </div>
      </section>

      <section className="brand-section" id="for-brands">
        <div className="brand-copy">
          <span className="eyebrow">FOR FOUNDERS &amp; BRANDS</span>
          <h2>Buy attention.<br />Earn the click.</h2>
          <p>Your listing contains two separate levers. Make shoppers a compelling offer, then choose how visible you want it to be.</p>
          <ol>
            <li><span>1</span><div><b>Create a shopper offer</b><p>Set your public price, exclusive deal price, and coupon.</p></div></li>
            <li><span>2</span><div><b>Choose a visibility bid</b><p>$5 gets listed. Higher lifetime totals move your sponsored rank up.</p></div></li>
            <li><span>3</span><div><b>Preview before you continue</b><p>See exactly what customers will see before submitting your listing.</p></div></li>
          </ol>
          <button className="brand-cta" type="button" onClick={() => openModal({ type: 'bid', targetBid: 5 })}>PREVIEW MY LISTING <CtaArrow /></button>
        </div>
        <div className="brand-math">
          <span>THE TWO NUMBERS NEVER MIX</span>
          <div className="math-card offer-math"><small>WHAT SHOPPERS GET</small><b>50% OFF</b><p>$50 instead of $100</p></div>
          <div className="math-divider">NOT THE SAME AS</div>
          <div className="math-card bid-math"><small>WHAT YOU PAY FOR PLACEMENT</small><b>$11 BID</b><p>Estimated sponsored rank #2</p></div>
          <p>Already listed? Increase your total and pay only the difference.</p>
        </div>
      </section>

      <section className="faq-section">
        <div><span className="eyebrow">NO FINE-PRINT CONFUSION</span><h2>Simple rules.<br />Clear incentives.</h2></div>
        <div className="faq-list">
          <details open><summary>Does the biggest discount rank first?<span>+</span></summary><p>No. The sponsored rank is determined only by the brand&apos;s total visibility bid. The discount is shown separately so shoppers can judge the offer for themselves.</p></details>
          <details><summary>What exactly does a shopper pay?<span>+</span></summary><p>The green offer shows the deal price, regular price, saving, and terms. The brand&apos;s visibility bid is never added to the shopper&apos;s price.</p></details>
          <details><summary>What exactly does a brand pay?<span>+</span></summary><p>A brand chooses a total visibility bid. New listings start at $5. When moving up later, the existing paid total is credited and only the difference is due.</p></details>
          <details><summary>What if a paid listing is rejected?<span>+</span></summary><p>If we reject it before it is first published, we refund the visibility payment in full to the original payment method. Once published, visibility payments are generally non-refundable. <Link href="/refund-policy">Read the refund policy.</Link></p></details>
        </div>
      </section>

      <footer>
        <a className="wordmark inverted" href="#top" aria-label="DEALFIGHT.LOL home"><DealFightWordmark /></a>
        <div className="footer-copy">
          <p>Brands compete for attention. Shoppers get the deal.</p>
          <small>
            Brand visibility payments are processed and resold by Dodo Payments, our Merchant of Record. Dodo handles checkout, taxes, receipts, and payment support.{' '}
            <a href="https://dodopayments.com/buyer-terms" target="_blank" rel="noopener noreferrer">Buyer terms</a>
            {' · '}
            <a href="https://dodopayments.com/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy</a>
            {' · '}
            <Link href="/listing-standards">Listing standards</Link>
            {' · '}
            <Link href="/terms">Platform terms</Link>
            {' · '}
            <Link href="/privacy">Privacy policy</Link>
            {' · '}
            <Link href="/refund-policy">Refund policy</Link>
          </small>
        </div>
        <button type="button" onClick={() => openModal({ type: 'bid', targetBid: claimTopBid })}>TAKE THE TOP SPOT · {formatMoney(claimTopBid)} <CtaArrow /></button>
      </footer>
      </div>

      {modal?.type === 'deal' && <DealModal listing={modal.listing} rank={listingRanks.get(modal.listing.id) ?? orderedListings.length} onClose={closeModal} />}
      {modal?.type === 'bid' && <BidModal targetBid={modal.targetBid} boardListings={orderedListings} placementChoices={placementChoices} onClose={closeModal} />}
    </main>
  );
}
