'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { categories, fights, type Fight, type Offer } from '@/lib/fight-data';

type ModalState =
  | { type: 'claim'; offer: Offer }
  | { type: 'enter'; fight: Fight }
  | null;

type SubmissionResult = {
  submissionId: string;
  discountPercent: number;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

function useCountdown(closesAt: string) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const update = () => setRemaining(Math.max(0, new Date(closesAt).getTime() - Date.now()));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [closesAt]);

  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${days ? `${days}D ` : ''}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

async function recordEvent(offerId: string, type: 'claim' | 'click' | 'share') {
  try {
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offerId, type }),
    });
  } catch {
    // The user action should still work when analytics is unavailable.
  }
}

function OfferCard({ offer, rank, onClaim }: { offer: Offer; rank: number; onClaim: () => void }) {
  return (
    <article className={`fighter-card fighter-${offer.accent}`}>
      <div className="fighter-topline">
        <span className="fighter-rank">0{rank}</span>
        <span className="fighter-badge">{offer.discount}% OFF</span>
      </div>
      <div className="fighter-identity">
        <span className="product-mark" aria-hidden="true">{offer.mark}</span>
        <div>
          <h3>{offer.name}</h3>
          <p>{offer.tagline}</p>
        </div>
      </div>
      <div className="price-lockup">
        <strong>{formatMoney(offer.dealPrice)}</strong>
        <div><s>{formatMoney(offer.originalPrice)}</s><span>/ {offer.term}</span></div>
      </div>
      <div className="proof-line"><span>✓ VERIFIED</span>{offer.proof}</div>
      <div className="fighter-actions">
        <span>{offer.claims.toLocaleString()} sample claims</span>
        <button type="button" onClick={onClaim}>GET THE CODE <b>↗</b></button>
      </div>
    </article>
  );
}

function ClaimModal({ offer, onClose }: { offer: Offer; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard?.writeText(offer.coupon);
    setCopied(true);
    recordEvent(offer.id, 'claim');
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="modal-shell" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="deal-modal" role="dialog" aria-modal="true" aria-labelledby="deal-title">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close dialog">×</button>
        <p className="modal-kicker">PRESEASON SAMPLE DEAL / {offer.discount}% OFF</p>
        <div className="modal-mark" aria-hidden="true">{offer.mark}</div>
        <h2 id="deal-title">{offer.name} brought the sharpest price.</h2>
        <p>{offer.finePrint}</p>
        <div className="coupon-box">
          <span>YOUR SAMPLE CODE</span>
          <strong>{offer.coupon}</strong>
          <button type="button" onClick={copyCode}>{copied ? 'COPIED ✓' : 'COPY CODE'}</button>
        </div>
        <a
          className="deal-outbound"
          href={offer.url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={() => recordEvent(offer.id, 'click')}
        >
          OPEN SAMPLE DESTINATION <span>↗</span>
        </a>
        <small>This is illustrative preseason inventory. No affiliation or live discount is implied.</small>
      </section>
    </div>
  );
}

function EntryModal({ fight, onClose }: { fight: Fight; onClose: () => void }) {
  const [listPrice, setListPrice] = useState(120);
  const [fightPrice, setFightPrice] = useState(36);
  const [status, setStatus] = useState<'idle' | 'submitting'>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<SubmissionResult | null>(null);

  const discount = useMemo(() => {
    if (!listPrice || !fightPrice || fightPrice >= listPrice) return 0;
    return Math.round((1 - fightPrice / listPrice) * 100);
  }, [listPrice, fightPrice]);

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
          fightPrice,
        }),
      });
      const payload = await response.json() as SubmissionResult & { error?: string };
      if (!response.ok) throw new Error(payload.error || 'The arena could not save that entry.');
      setResult(payload);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Try that again.');
    } finally {
      setStatus('idle');
    }
  };

  return (
    <div className="modal-shell" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="entry-modal" role="dialog" aria-modal="true" aria-labelledby="entry-title">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close dialog">×</button>
        {result ? (
          <div className="entry-success">
            <span className="success-stamp">SAVED</span>
            <p className="modal-kicker">ENTRY {result.submissionId.slice(0, 8).toUpperCase()}</p>
            <h2 id="entry-title">Your {result.discountPercent}% deal is in the locker room.</h2>
            <p>No charge was made. The application is stored as <strong>pending payment</strong>; connect a provider to the prepared checkout endpoint and the $49 verification step is ready to activate.</p>
            <button type="button" className="primary-dark" onClick={onClose}>BACK TO THE FIGHT</button>
          </div>
        ) : (
          <>
            <p className="modal-kicker">CHALLENGE ROUND {fight.round}</p>
            <h2 id="entry-title">Bring a better deal.<br />Take the homepage.</h2>
            <p className="entry-intro">$49 verifies the offer and enters it. It never buys position.</p>
            <form onSubmit={submit}>
              <div className="field-grid">
                <label>Product name<input name="productName" required minLength={2} maxLength={60} placeholder="Acme Pro" /></label>
                <label>Work email<input name="email" type="email" required placeholder="you@company.com" /></label>
              </div>
              <label>Public product URL<input name="productUrl" required inputMode="url" placeholder="https://yourproduct.com" /></label>
              <label>One-line pitch<input name="tagline" required minLength={8} maxLength={140} placeholder="What customers get, without the fluff." /></label>
              <div className="field-grid price-fields">
                <label>Public list price ($)<input name="listPrice" type="number" min="1" step="0.01" required value={listPrice} onChange={(event) => setListPrice(Number(event.target.value))} /></label>
                <label>Your fight price ($)<input name="fightPrice" type="number" min="1" step="0.01" required value={fightPrice} onChange={(event) => setFightPrice(Number(event.target.value))} /></label>
                <div className={`deal-meter ${discount >= 15 ? 'valid' : ''}`}><span>YOUR HIT</span><strong>{discount}% OFF</strong></div>
              </div>
              <div className="field-grid">
                <label>Coupon code<input name="couponCode" required minLength={3} maxLength={32} placeholder="FIGHT50" /></label>
                <label>Category<select name="category" defaultValue={fight.category}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
              </div>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="submit-entry" type="submit" disabled={status === 'submitting' || discount < 15}>
                {status === 'submitting' ? 'SAVING ENTRY…' : 'SAVE ENTRY — PAYMENT LATER'} <span>↗</span>
              </button>
              <small>By entering, you confirm the public price is real and the code works for the stated audience. All entries are reviewed.</small>
            </form>
          </>
        )}
      </section>
    </div>
  );
}

export default function PriceFightClient() {
  const [activeSlug, setActiveSlug] = useState(fights[0].slug);
  const [modal, setModal] = useState<ModalState>(null);
  const [shared, setShared] = useState(false);
  const activeFight = fights.find((fight) => fight.slug === activeSlug) ?? fights[0];
  const countdown = useCountdown(activeFight.closesAt);

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

  const shareFight = async () => {
    const shareData = {
      title: `Price Fight: ${activeFight.title}`,
      text: `${activeFight.offers[0].name} is winning with ${activeFight.offers[0].discount}% off. Can anyone beat it?`,
      url: `${window.location.origin}/#fight`,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      setShared(true);
      recordEvent(activeFight.offers[0].id, 'share');
      window.setTimeout(() => setShared(false), 1800);
    } catch {
      // Dismissing a native share sheet is not an error.
    }
  };

  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Price Fight home">PRICE<span>FIGHT</span></a>
        <nav aria-label="Main navigation">
          <a href="#fight">Live fight</a><a href="#arenas">Arenas</a><a href="#rules">Rules</a>
        </nav>
        <button className="header-action" type="button" onClick={() => setModal({ type: 'enter', fight: activeFight })}>ENTER A DEAL ↗</button>
      </header>

      <div className="preview-banner"><span>PRESEASON BUILD</span> Offers and activity shown below are clearly marked sample data. Submission storage is live; payments are off.</div>

      <section className="hero" id="top">
        <div className="hero-kicker"><span>THE ANTI-AD LEADERBOARD</span><span>ROUND {activeFight.round}</span></div>
        <h1>BRANDS FIGHT.<br /><em>YOU WIN.</em></h1>
        <div className="hero-bottom">
          <p>Brands cannot buy their way up. They climb by giving you a better, verified deal.</p>
          <a href="#fight">WATCH THE FIGHT <span>↓</span></a>
        </div>
        <div className="hero-stats" aria-label="Preseason product facts">
          <div><strong>{fights.length}</strong><span>sample arenas</span></div>
          <div><strong>{Math.max(...fights.flatMap((fight) => fight.offers.map((offer) => offer.discount)))}%</strong><span>sharpest sample deal</span></div>
          <div><strong>$49</strong><span>verified entry</span></div>
          <div><strong>$0</strong><span>paid boosts, ever</span></div>
        </div>
      </section>

      <div className="tape" aria-hidden="true"><div>NO PAID BOOSTS ✦ LOWEST REAL PRICE WINS ✦ VERIFIED SAVINGS ✦ NO FAKE URGENCY ✦&nbsp;</div><div>NO PAID BOOSTS ✦ LOWEST REAL PRICE WINS ✦ VERIFIED SAVINGS ✦ NO FAKE URGENCY ✦&nbsp;</div></div>

      <section className="arena" id="fight">
        <div className="arena-head">
          <div><p className="eyebrow">SAMPLE FIGHT / {activeFight.category.toUpperCase()}</p><h2>THE PRICE WAR<br />IS ON.</h2></div>
          <div className="round-panel"><span>ROUND CLOSES IN</span><strong>{countdown}</strong><small>{activeFight.entrants} SAMPLE ENTRANTS · BEST VERIFIED OFFER WINS</small></div>
        </div>

        <div className="fight-grid">
          {activeFight.offers.slice(0, 2).map((offer, index) => <OfferCard key={offer.id} offer={offer} rank={index + 1} onClaim={() => setModal({ type: 'claim', offer })} />)}
          <div className="versus" aria-hidden="true">VS</div>
        </div>

        <div className="arena-toolbar">
          <div><span>CAN YOUR PRODUCT BEAT {activeFight.offers[0].discount}%?</span><strong>UNDERCUT THE CHAMPION.</strong></div>
          <button type="button" className="share-button" onClick={shareFight}>{shared ? 'LINK COPIED ✓' : 'SHARE THIS FIGHT'}</button>
          <button type="button" className="enter-button" onClick={() => setModal({ type: 'enter', fight: activeFight })}>ENTER — $49* <span>↗</span></button>
        </div>
        <p className="fineprint">*The fee pays for human price verification and anti-abuse review. It never affects rank. Payments are disabled in this preseason build.</p>
      </section>

      <section className="arenas-section" id="arenas">
        <div className="section-heading"><div><p className="section-kicker">PICK YOUR RING</p><h2>MORE FIGHTS.<br />MORE SAVINGS.</h2></div><p>Each category has one rule: the strongest customer value sits at the top. Tap an arena to bring it into the ring.</p></div>
        <div className="arena-list">
          {fights.map((fight) => (
            <button key={fight.slug} type="button" className={fight.slug === activeSlug ? 'active' : ''} onClick={() => { setActiveSlug(fight.slug); document.querySelector('#fight')?.scrollIntoView({ behavior: 'smooth' }); }}>
              <span className="arena-number">{fight.round}</span>
              <span className="arena-copy"><small>{fight.status === 'live' ? '● SAMPLE LIVE' : 'UP NEXT'}</small><strong>{fight.category}</strong><em>{fight.title}</em></span>
              <span className="arena-leader"><small>LEADER</small><strong>{fight.offers[0].discount}% OFF</strong><em>{fight.offers[0].name}</em></span>
              <span className="arena-arrow">↗</span>
            </button>
          ))}
        </div>
      </section>

      <section className="manifesto">
        <p>THE FLIP</p>
        <h2>OTHER AD BOARDS ASK<br />“WHO PAYS <i>US</i> MOST?”</h2>
        <h2 className="manifesto-answer">WE ASK “WHO GIVES<br /><i>YOU</i> THE MOST?”</h2>
      </section>

      <section className="rules-section" id="rules">
        <div className="rules-intro"><p className="section-kicker">HOW THE BELL RINGS</p><h2>THREE ROUNDS.<br />ZERO TRICKS.</h2><button type="button" onClick={() => setModal({ type: 'enter', fight: activeFight })}>BRING YOUR DEAL ↗</button></div>
        <div className="rule-steps">
          <article><span>01</span><h3>Enter a real offer.</h3><p>Submit the public list price, fight price, coupon and exact eligibility. A $49 fee covers verification after payments are connected.</p></article>
          <article><span>02</span><h3>We test the punch.</h3><p>A human checks the list price, checkout code, renewal terms and restrictions. Inflated anchors and fake countdowns are rejected.</p></article>
          <article><span>03</span><h3>Customers decide the value.</h3><p>Verified offers rank by real percentage saved, with total dollars saved breaking ties. Claims and outbound clicks stay public.</p></article>
        </div>
      </section>

      <section className="trust-section">
        <div><p className="section-kicker">THE REFEREE’S DESK</p><h2>NO SMALL PRINT<br />IN THE SHADOWS.</h2></div>
        <div className="trust-list">
          <details open><summary>Can brands pay to move up?<span>+</span></summary><p>No. Entry fees are flat. Placement is calculated only from the verified offer. There are no sponsored overrides.</p></details>
          <details><summary>How do you stop fake discounts?<span>+</span></summary><p>We compare the submitted list price with a public pricing page or recent sale history, test the coupon and publish renewal terms beside the offer.</p></details>
          <details><summary>How does Price Fight make money?<span>+</span></summary><p>Flat verification fees first. Later, disclosed affiliate commissions can add revenue, but never change placement.</p></details>
          <details><summary>What happens when a deal expires?<span>+</span></summary><p>It leaves the active arena and remains in a public archive with its claims, clicks and final position.</p></details>
        </div>
      </section>

      <section className="closing-cta"><span>GOT MARGIN?</span><h2>PUT YOUR PRICE<br />WHERE YOUR<br />MOUTH IS.</h2><button type="button" onClick={() => setModal({ type: 'enter', fight: activeFight })}>ENTER THE ARENA <b>↗</b></button></section>

      <footer><a className="wordmark" href="#top">PRICE<span>FIGHT</span></a><p>Brands fight. Customers win. That is the whole business.</p><div><a href="#rules">Rules</a><a href="mailto:hello@pricefight.example">Contact</a><span>© 2026</span></div></footer>

      {modal?.type === 'claim' && <ClaimModal offer={modal.offer} onClose={() => setModal(null)} />}
      {modal?.type === 'enter' && <EntryModal fight={modal.fight} onClose={() => setModal(null)} />}
    </main>
  );
}
