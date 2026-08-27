import { NextResponse } from 'next/server';
import { categories } from '@/lib/leaderboard-data';
import { getDatabase } from '@/lib/database';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function normalizeUrl(value: unknown) {
  const raw = cleanText(value, 400);
  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const url = new URL(candidate);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    url.hash = '';
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach((key) => {
      url.searchParams.delete(key);
    });
    return url.toString();
  } catch {
    return null;
  }
}

function urlIdentity(value: string) {
  const url = new URL(value);
  url.hash = '';
  url.search = '';
  url.hostname = url.hostname.toLowerCase().replace(/^www\./, '');
  url.pathname = url.pathname.replace(/\/+$/, '') || '/';
  return url.toString();
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Send a valid JSON body.' }, { status: 400 });
  }

  const productName = cleanText(body.productName, 60);
  const productUrl = normalizeUrl(body.productUrl);
  const email = cleanText(body.email, 160).toLowerCase();
  const tagline = cleanText(body.tagline, 140);
  const couponCode = cleanText(body.couponCode, 32).toUpperCase();
  const category = cleanText(body.category, 40);
  const listPrice = Number(body.listPrice);
  const fightPrice = Number(body.fightPrice);
  const targetBid = Number(body.targetBid);

  if (productName.length < 2 || tagline.length < 8) {
    return NextResponse.json({ error: 'Add a product name and a clear one-line description.' }, { status: 422 });
  }
  if (!productUrl) {
    return NextResponse.json({ error: 'Add a valid public product URL.' }, { status: 422 });
  }
  if (!emailPattern.test(email)) {
    return NextResponse.json({ error: 'Add a valid work email.' }, { status: 422 });
  }
  if (category === 'All' || !categories.includes(category as (typeof categories)[number])) {
    return NextResponse.json({ error: 'Choose a valid category.' }, { status: 422 });
  }
  if (!Number.isFinite(listPrice) || !Number.isFinite(fightPrice) || listPrice <= 0 || fightPrice <= 0 || fightPrice >= listPrice) {
    return NextResponse.json({ error: 'The fight price must be lower than the public list price.' }, { status: 422 });
  }
  if (!couponCode || couponCode.length < 3) {
    return NextResponse.json({ error: 'Add the coupon code customers will use.' }, { status: 422 });
  }

  const discountPercent = Math.round((1 - fightPrice / listPrice) * 100);
  if (discountPercent < 10) {
    return NextResponse.json({ error: 'Visitor deals start at 10% off.' }, { status: 422 });
  }
  if (!Number.isFinite(targetBid) || targetBid < 5 || targetBid > 1_000_000) {
    return NextResponse.json({ error: 'Set a total bid between $5 and $1,000,000.' }, { status: 422 });
  }

  const id = crypto.randomUUID();
  const normalizedUrl = urlIdentity(productUrl);
  const targetBidCents = Math.round(targetBid * 100);
  let previousBidCents = 0;
  let amountDueCents = targetBidCents;

  try {
    const database = await getDatabase();
    const previousBid = await database.prepare(`
      SELECT COALESCE(MAX(target_bid_cents), 0) AS total
      FROM submissions
      WHERE normalized_url = ? AND status = 'paid'
    `).bind(normalizedUrl).first<{ total: number }>();

    previousBidCents = Number(previousBid?.total ?? 0);
    if (targetBidCents <= previousBidCents) {
      return NextResponse.json({
        error: `Your new total must be higher than the existing paid bid of $${(previousBidCents / 100).toFixed(2)}.`,
      }, { status: 422 });
    }
    amountDueCents = targetBidCents - previousBidCents;

    await database.prepare(`
      INSERT INTO submissions (
        id, product_name, product_url, normalized_url, email, tagline, list_price_cents,
        fight_price_cents, discount_percent, coupon_code, category, target_bid_cents,
        amount_due_cents, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      productName,
      productUrl,
      normalizedUrl,
      email,
      tagline,
      Math.round(listPrice * 100),
      Math.round(fightPrice * 100),
      discountPercent,
      couponCode,
      category,
      targetBidCents,
      amountDueCents,
      'pending_payment',
    ).run();
  } catch (error) {
    console.error('Failed to save submission', error);
    return NextResponse.json({ error: 'The arena could not save that entry. Try again.' }, { status: 500 });
  }

  return NextResponse.json({
    submissionId: id,
    discountPercent,
    targetBidCents,
    previousBidCents,
    amountDueCents,
    status: 'pending_payment',
    checkout: {
      amountCents: amountDueCents,
      currency: 'USD',
      connected: false,
      endpoint: '/api/checkout',
    },
  }, { status: 201 });
}
