import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CtaArrow } from '@/app/cta-arrow';

export function LegalPageShell({
  eyebrow,
  title,
  intro,
  summaryTitle,
  summaryAccent,
  summaryBody,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  summaryTitle: string;
  summaryAccent: string;
  summaryBody: string;
  children: ReactNode;
}) {
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
          <strong>{summaryTitle}</strong>
          <b>{summaryAccent}</b>
          <p>{summaryBody}</p>
        </aside>

        <article className="legal-content">
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p className="legal-intro">{intro}</p>
          {children}
          <div className="legal-contact">
            <span>QUESTIONS?</span>
            <a href="mailto:vichured@gmail.com">vichured@gmail.com <CtaArrow /></a>
          </div>
        </article>
      </div>
    </main>
  );
}
