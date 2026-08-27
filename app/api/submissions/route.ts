import { NextResponse } from 'next/server';
import { categories } from '@/lib/fight-data';
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

  if (productName.length < 2 || tagline.length < 8) {
    return NextResponse.json({ error: 'Add a product name and a clear one-line description.' }, { status: 422 });
  }
  if (!productUrl) {
    return NextResponse.json({ error: 'Add a valid public product URL.' }, { status: 422 });
  }
  if (!emailPattern.test(email)) {
    return NextResponse.json({ error: 'Add a valid work email.' }, { status: 422 });
  }
  if (!categories.includes(category as (typeof categories)[number])) {
    return NextResponse.json({ error: 'Choose a valid fight category.' }, { status: 422 });
  }
  if (!Number.isFinite(listPrice) || !Number.isFinite(fightPrice) || listPrice <= 0 || fightPrice <= 0 || fightPrice >= listPrice) {
    return NextResponse.json({ error: 'The fight price must be lower than the public list price.' }, { status: 422 });
  }
  if (!couponCode || couponCode.length < 3) {
    return NextResponse.json({ error: 'Add the coupon code customers will use.' }, { status: 422 });
  }

  const discountPercent = Math.round((1 - fightPrice / listPrice) * 100);
  if (discountPercent < 15) {
    return NextResponse.json({ error: 'Fights start at 15% off. Bring a sharper deal.' }, { status: 422 });
  }

  const id = crypto.randomUUID();

  try {
    const database = await getDatabase();
    await database.prepare(`
      INSERT INTO submissions (
        id, product_name, product_url, email, tagline, list_price_cents,
        fight_price_cents, discount_percent, coupon_code, category, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      productName,
      productUrl,
      email,
      tagline,
      Math.round(listPrice * 100),
      Math.round(fightPrice * 100),
      discountPercent,
      couponCode,
      category,
      'pending_payment',
    ).run();
  } catch (error) {
    console.error('Failed to save submission', error);
    return NextResponse.json({ error: 'The arena could not save that entry. Try again.' }, { status: 500 });
  }

  return NextResponse.json({
    submissionId: id,
    discountPercent,
    status: 'pending_payment',
    checkout: {
      amountCents: 4900,
      currency: 'USD',
      connected: false,
      endpoint: '/api/checkout',
    },
  }, { status: 201 });
}
