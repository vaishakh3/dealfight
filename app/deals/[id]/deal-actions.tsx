'use client';

import { useState } from 'react';
import { CtaArrow } from '@/app/cta-arrow';

type DealActionsProps = {
  coupon: string;
  dealLabel: string;
  dealUrl: string;
  listingId: string;
  name: string;
  rank: number;
  shareUrl: string;
};

async function recordEngagement(offerId: string, type: 'claim' | 'click' | 'share') {
  try {
    await fetch('/api/events', {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offerId, type }),
    });
  } catch {
    // Sharing and claiming should still work when analytics is unavailable.
  }
}

export function DealActions({ coupon, dealLabel, dealUrl, listingId, name, rank, shareUrl }: DealActionsProps) {
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);
  const shareText = `${dealLabel} from ${name} is currently sponsored #${rank} on Deal Fight.`;
  const encodedText = encodeURIComponent(`${shareText} ${shareUrl}`);

  const showCopied = (type: 'code' | 'link') => {
    setCopied(type);
    window.setTimeout(() => setCopied(null), 1800);
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(coupon);
    } finally {
      showCopied('code');
      void recordEngagement(listingId, 'claim');
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } finally {
      showCopied('link');
      void recordEngagement(listingId, 'share');
    }
  };

  const shareDeal = async () => {
    if (!navigator.share) {
      await copyLink();
      return;
    }

    try {
      await navigator.share({ title: `${name} on Deal Fight`, text: shareText, url: shareUrl });
      void recordEngagement(listingId, 'share');
    } catch {
      // Closing the operating system share sheet is not an error.
    }
  };

  return (
    <div className="deal-action-stack">
      <div className="deal-coupon-action">
        <span>EXCLUSIVE CODE</span>
        <strong>{coupon}</strong>
        <button type="button" onClick={copyCode}>{copied === 'code' ? 'COPIED ✓' : 'COPY CODE'}</button>
      </div>

      <a className="deal-visit-action" href={dealUrl} target="_blank" rel="noopener noreferrer sponsored" onClick={() => void recordEngagement(listingId, 'click')}>
        GET THE DEAL AT {name.toUpperCase()} <CtaArrow />
      </a>

      <div className="deal-share-panel">
        <div><span>SPREAD THE SAVING</span><b>Know someone who would use this?</b></div>
        <div className="deal-share-buttons">
          <button type="button" onClick={shareDeal}>SHARE</button>
          <a href={`https://x.com/intent/post?text=${encodedText}`} target="_blank" rel="noopener noreferrer" onClick={() => void recordEngagement(listingId, 'share')}>X</a>
          <a href={`https://wa.me/?text=${encodedText}`} target="_blank" rel="noopener noreferrer" onClick={() => void recordEngagement(listingId, 'share')}>WHATSAPP</a>
          <button type="button" onClick={copyLink}>{copied === 'link' ? 'COPIED ✓' : 'COPY LINK'}</button>
        </div>
      </div>
    </div>
  );
}
