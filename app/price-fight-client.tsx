'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  bidForMode,
  categories,
  listings,
  type BoardMode,
  type Listing,
} from '@/lib/leaderboard-data';

type BidModalState = {
  type: 'bid';
  targetBid: number;
  listing?: Listing;
  initialUrl?: string;
};

type DealModalState = {
  type: 'deal';
  listing: Listing;
};

type ModalState = BidModalState | DealModalState | null;

type SubmissionResult = {
  submissionId: string;
  discountPercent: number;
  targetBidCents: number;
  previousBidCents: number;
  amountDueCents: number;
};

const boardLabels: Record<BoardMode, string> = {
  all: 'All time',
  week: 'This week',
  today: 'Today',
};

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

function formatCompact(value: number) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

async function recordEvent(offerId: string, type: 'claim' | 'click' | 'share') {
  try {
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offerId, type }),
    });
  } catch {
    // A visitor should never lose their action because analytics is unavailable.
  }
}

function DealModal({ listing, onClose }: { listing: Listing; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard?.writeText(listing.coupon);
    setCopied(true);
    recordEvent(listing.id, 'claim');
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="modal-shell" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal-card deal-modal" role="dialog" aria-modal="true" aria-labelledby="deal-title">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close dialog">×</button>
        <span className="eyebrow">PRESEASON SAMPLE DEAL</span>
        <div className="deal-brand">
          <span className="brand-mark large" aria-hidden="true">{listing.mark}</span>
          <div><h2 id="deal-title">{listing.name}</h2><p>{listing.tagline}</p></div>
        </div>
        <div className="deal-callout"><strong>{listing.dealLabel}</strong><p>{listing.dealDetails}</p></div>
        <div className="coupon-box">
          <span>Sample coupon</span>
          <strong>{listing.coupon}</strong>
          <button type="button" onClick={copyCode}>{copied ? 'COPIED ✓' : 'COPY'}</button>
        </div>
        <a className="modal-primary" href={listing.url} target="_blank" rel="noopener noreferrer sponsored" onClick={() => recordEvent(listing.id, 'click')}>
          Visit {listing.name} <span>↗</span>
        </a>
        <small>Illustrative preseason inventory. No affiliation or live discount is implied.</small>
      </section>
    </div>
  );
}

function BidModal({ targetBid, listing, initialUrl, onClose }: { targetBid: number; listing?: Listing; initialUrl?: string; onClose: () => void }) {
  const [listPrice, setListPrice] = useState(100);
  const [dealPrice, setDealPrice] = useState(50);
  const [totalBid, setTotalBid] = useState(targetBid);
  const [status, setStatus] = useState<'idle' | 'submitting'>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<SubmissionResult | null>(null);

  const discount = useMemo(() => {
    if (!listPrice || !dealPrice || dealPrice >= listPrice) return 0;
    return Math.round((1 - dealPrice / listPrice) * 100);
  }, [listPrice, dealPrice]);

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
          productName: form.get('productName'),
          productUrl: form.get('productUrl'),
          email: form.get('email'),
          tagline: form.get('tagline'),
          couponCode: form.get('couponCode'),
          category: form.get('category'),
          listPrice,
          fightPrice: dealPrice,
          targetBid: totalBid,
        }),
      });
      const payload = await response.json() as SubmissionResult & { error?: string };
      if (!response.ok) throw new Error(payload.error || 'We could not save that bid.');
      setResult(payload);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Try that again.');
    } finally {
      setStatus('idle');
    }
  };

  return (
    <div className="modal-shell" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal-card bid-modal" role="dialog" aria-modal="true" aria-labelledby="bid-title">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close dialog">×</button>
        {result ? (
          <div className="success-view">
            <span className="success-check">✓</span>
            <span className="eyebrow">BID SAVED / PAYMENT OFF</span>
            <h2 id="bid-title">Your total bid is {formatMoney(result.targetBidCents / 100)}.</h2>
            <p>
              This URL previously had {formatMoney(result.previousBidCents / 100)} paid. Checkout will charge only the
              <strong> {formatMoney(result.amountDueCents / 100)} difference</strong> when a payment provider is connected.
            </p>
            <div className="success-note">Stored as <b>pending payment</b>. Nothing was charged.</div>
            <button className="modal-primary" type="button" onClick={onClose}>Back to the board</button>
          </div>
        ) : (
          <>
            <span className="eyebrow">{listing ? `OUTBID ${listing.name.toUpperCase()}` : 'CLAIM YOUR RANK'}</span>
            <h2 id="bid-title">Your bid is your rank.</h2>
            <p className="modal-intro">Start at $5. Already listed? Use the same URL and pay only the difference.</p>
            <form onSubmit={submit}>
              <div className="field-pair">
                <label>Product name<input name="productName" defaultValue={listing?.name} required minLength={2} maxLength={60} placeholder="Acme Pro" /></label>
                <label>Work email<input name="email" type="email" required placeholder="you@company.com" /></label>
              </div>
              <label>Product URL<input name="productUrl" defaultValue={initialUrl ?? (listing && !listing.url.includes('example.com') ? listing.url : '')} required inputMode="url" placeholder="https://yourproduct.com" /></label>
              <label>One-line pitch<input name="tagline" defaultValue={listing?.tagline} required minLength={8} maxLength={140} placeholder="Say exactly what you do." /></label>
              <div className="bid-amount-field">
                <label htmlFor="total-bid">Your new total bid</label>
                <div><span>$</span><input id="total-bid" name="targetBid" type="number" min="5" step="1" required value={totalBid} onChange={(event) => setTotalBid(Number(event.target.value))} /></div>
                <small>We calculate any previous paid bid from your URL before checkout.</small>
              </div>
              <div className="field-pair price-pair">
                <label>Public price ($)<input name="listPrice" type="number" min="1" step="0.01" required value={listPrice} onChange={(event) => setListPrice(Number(event.target.value))} /></label>
                <label>Your deal price ($)<input name="fightPrice" type="number" min="0.01" step="0.01" required value={dealPrice} onChange={(event) => setDealPrice(Number(event.target.value))} /></label>
                <div className={`discount-chip ${discount >= 10 ? 'valid' : ''}`}><span>VISITOR DEAL</span><b>{discount}% OFF</b></div>
              </div>
              <div className="field-pair">
                <label>Coupon code<input name="couponCode" required minLength={3} maxLength={32} placeholder="FIGHT50" /></label>
                <label>Category<select name="category" defaultValue={listing?.category ?? 'AI'}>{categories.filter((item) => item !== 'All').map((item) => <option key={item}>{item}</option>)}</select></label>
              </div>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="modal-primary" type="submit" disabled={status === 'submitting' || discount < 10 || totalBid < 5}>
                {status === 'submitting' ? 'SAVING…' : `CONTINUE WITH ${formatMoney(totalBid)} TOTAL`} <span>↗</span>
              </button>
              <small>No charge is made in this build. Deals must be real, public, and at least 10% off.</small>
            </form>
          </>
        )}
      </section>
    </div>
  );
}

export default function PriceFightClient() {
  const [mode, setMode] = useState<BoardMode>('all');
  const [category, setCategory] = useState<(typeof categories)[number]>('All');
  const [modal, setModal] = useState<ModalState>(null);
  const [quickUrl, setQuickUrl] = useState('');

  const ranked = useMemo(() => listings
    .filter((listing) => category === 'All' || listing.category === category)
    .sort((a, b) => bidForMode(b, mode) - bidForMode(a, mode)), [category, mode]);

  const currentLeader = [...listings].sort((a, b) => bidForMode(b, mode) - bidForMode(a, mode))[0];
  const claimTopBid = bidForMode(currentLeader, mode) + 5;
  const totalBoardValue = listings.reduce((sum, listing) => sum + listing.totalBid, 0);

  useEffect(() => {
    if (!modal) return;
    const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && setModal(null);
    document.body.classList.add('modal-open');
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [modal]);

  const openQuickBid = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setModal({ type: 'bid', targetBid: claimTopBid, initialUrl: quickUrl });
  };

  return (
    <main id="top">
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Price Fight home">PRICE<span>FIGHT</span><sup>.LOL</sup></a>
        <nav aria-label="Main navigation"><a href="#leaderboard">Leaderboard</a><a href="#how">How it works</a></nav>
        <button className="header-cta" type="button" onClick={() => setModal({ type: 'bid', targetBid: claimTopBid })}>LIST YOUR SITE <span>↗</span></button>
      </header>

      <div className="preview-banner"><b>PRESEASON</b><span>Sample listings · submissions live · payments off</span></div>

      <section className="hero-simple">
        <div className="hero-copy">
          <span className="eyebrow">THE INTERNET&apos;S PUBLIC AD AUCTION</span>
          <h1>PAY MORE.<br /><em>RANK HIGHER.</em></h1>
          <p>Your bid decides your position. Every listing stays visible. Every product gives visitors an exclusive deal.</p>
          <div className="hero-actions">
            <button className="primary-cta" type="button" onClick={() => setModal({ type: 'bid', targetBid: claimTopBid })}>CLAIM A RANK <span>↗</span></button>
            <a href="#leaderboard">SEE EVERY BID <span>↓</span></a>
          </div>
        </div>
        <form className="top-rank-card" onSubmit={openQuickBid}>
          <div className="top-card-head"><span>CLAIM #1</span><span>Live target</span></div>
          <div className="leader-mini"><span className="rank-crown">♛</span><div><small>Currently</small><strong>{currentLeader.name}</strong></div><b>{formatMoney(bidForMode(currentLeader, mode))}</b></div>
          <label htmlFor="quick-url">Your product URL</label>
          <input id="quick-url" value={quickUrl} onChange={(event) => setQuickUrl(event.target.value)} required inputMode="url" placeholder="yourproduct.com" />
          <button type="submit">BID {formatMoney(claimTopBid)} TO TAKE #1 <span>↗</span></button>
          <small>Already listed? Same URL, pay only the difference.</small>
        </form>
      </section>

      <section className="proof-strip" aria-label="Sample marketplace statistics">
        <div><strong>{listings.length}</strong><span>sample listings</span></div>
        <div><strong>{formatMoney(totalBoardValue)}</strong><span>board value</span></div>
        <div><strong>{formatCompact(listings.reduce((sum, item) => sum + item.clicks, 0))}</strong><span>sample clicks</span></div>
        <div><strong>$5</strong><span>minimum bid</span></div>
      </section>

      <section className="leaderboard-section" id="leaderboard">
        <div className="section-heading">
          <div><span className="eyebrow">NO HIDDEN INVENTORY</span><h2>Every bidder.<br />One leaderboard.</h2></div>
          <p>Top spots get the spotlight. Everyone keeps a clickable row. Bid again at any time to move up.</p>
        </div>

        <div className="board-controls">
          <div className="tab-group" aria-label="Leaderboard period">{(Object.keys(boardLabels) as BoardMode[]).map((item) => <button type="button" key={item} className={mode === item ? 'active' : ''} onClick={() => setMode(item)}>{boardLabels[item]}</button>)}</div>
          <div className="category-group" aria-label="Category filter">{categories.map((item) => <button type="button" key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div>
        </div>

        <div className="board-wrap">
          <div className="board-header"><span>Rank / product</span><span>Exclusive deal</span><span>Traffic</span><span>Paid</span><span /></div>
          {ranked.map((listing, index) => {
            const bid = bidForMode(listing, mode);
            const nextBid = bid + (index === 0 ? 5 : 1);
            return (
              <article className={`board-row ${index < 3 ? `podium podium-${index + 1}` : ''}`} key={listing.id}>
                <div className="product-cell">
                  <span className="rank-number">{String(index + 1).padStart(2, '0')}</span>
                  <span className="brand-mark" aria-hidden="true">{listing.mark}</span>
                  <div><h3>{listing.name} <span>{listing.category}</span></h3><p>{listing.tagline}</p></div>
                </div>
                <button className="deal-button" type="button" onClick={() => setModal({ type: 'deal', listing })}><strong>{listing.dealLabel}</strong><span>GET DEAL ↗</span></button>
                <div className="traffic-cell"><strong>{formatCompact(listing.clicks)}</strong><span>{listing.claims} claims</span></div>
                <div className="bid-cell"><strong>{formatMoney(bid)}</strong><span>{listing.age}</span></div>
                <button className="outbid-button" type="button" onClick={() => setModal({ type: 'bid', listing, targetBid: nextBid })}>OUTBID<br /><b>{formatMoney(nextBid)}</b></button>
              </article>
            );
          })}
          {!ranked.length && <div className="empty-board">No bidders in this category yet. The first slot starts at $5.</div>}
        </div>
        <div className="board-foot"><span>All amounts are sample data during preseason.</span><button type="button" onClick={() => setModal({ type: 'bid', targetBid: 5 })}>JOIN FROM $5 ↗</button></div>
      </section>

      <section className="how-section" id="how">
        <div className="section-heading light"><div><span className="eyebrow">THE WHOLE RULEBOOK</span><h2>Three steps.<br />That&apos;s it.</h2></div><p>No opaque ad manager. No daily budget. No expiry. A public bid, a public rank, and a real deal.</p></div>
        <div className="steps-grid">
          <article><span>01</span><h3>List from $5</h3><p>Add your URL, one-line pitch, and an exclusive visitor deal.</p></article>
          <article><span>02</span><h3>Your bid = your rank</h3><p>Pay more than the listing above you. Every bidder remains on the board.</p></article>
          <article><span>03</span><h3>Rebid the difference</h3><p>Use the same URL later. If $40 is already paid and you bid $55, checkout charges $15.</p></article>
        </div>
        <button className="wide-cta" type="button" onClick={() => setModal({ type: 'bid', targetBid: claimTopBid })}>GET ON THE BOARD <span>START AT $5 ↗</span></button>
      </section>

      <section className="faq-section">
        <div><span className="eyebrow">THE BUSINESS MODEL</span><h2>Simple for buyers.<br />Compulsive for bidders.</h2></div>
        <div className="faq-list">
          <details open><summary>How does Price Fight make money?<span>+</span></summary><p>Every new listing and every upward move creates a payment. A full leaderboard means inventory is not capped at two brands.</p></details>
          <details><summary>Can someone pay once and stay forever?<span>+</span></summary><p>Yes, but rank is never guaranteed. New bids push older listings down, creating a clear reason to return and rebid.</p></details>
          <details><summary>Why require a visitor deal?<span>+</span></summary><p>It gives people a reason to browse and share the board instead of treating it like a wall of ads.</p></details>
        </div>
      </section>

      <footer><a className="wordmark inverted" href="#top">PRICE<span>FIGHT</span><sup>.LOL</sup></a><p>The public leaderboard where money talks—and visitors get a deal.</p><button type="button" onClick={() => setModal({ type: 'bid', targetBid: 5 })}>LIST FROM $5 ↗</button></footer>

      {modal?.type === 'deal' && <DealModal listing={modal.listing} onClose={() => setModal(null)} />}
      {modal?.type === 'bid' && <BidModal listing={modal.listing} initialUrl={modal.initialUrl} targetBid={modal.targetBid} onClose={() => setModal(null)} />}
    </main>
  );
}
