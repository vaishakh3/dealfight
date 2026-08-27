import { NextResponse } from 'next/server';
import { getDatabase, isDatabaseUnavailable } from '@/lib/database';
import { consumeRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const allowedTypes = new Set(['claim', 'click', 'share']);

export async function POST(request: Request) {
  let body: { offerId?: unknown; type?: unknown };

  try {
    body = await request.json() as { offerId?: unknown; type?: unknown };
  } catch {
    return NextResponse.json({ error: 'Send a valid JSON body.' }, { status: 400 });
  }

  const offerId = typeof body.offerId === 'string' ? body.offerId.trim() : '';
  const type = typeof body.type === 'string' ? body.type.trim() : '';

  if (!/^[a-z0-9-]{2,80}$/.test(offerId) || !allowedTypes.has(type)) {
    return NextResponse.json({ error: 'Invalid event.' }, { status: 422 });
  }

  try {
    const allowed = await consumeRateLimit(request, 'events', 120, 60);
    if (!allowed) {
      return NextResponse.json(
        { ok: false, error: 'Too many events.' },
        { status: 429, headers: { 'Retry-After': '60' } },
      );
    }

    const database = await getDatabase();
    const { error: insertError } = await database.from('engagement_events').insert({
      offer_id: offerId,
      event_type: type,
    });

    if (insertError) throw insertError;

    const { count, error: countError } = await database
      .from('engagement_events')
      .select('*', { count: 'exact', head: true })
      .eq('offer_id', offerId)
      .eq('event_type', type);

    if (countError) throw countError;

    return NextResponse.json({ ok: true, count: count ?? 0 });
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      return NextResponse.json({ ok: false }, { status: 503 });
    }
    console.error('Failed to save event', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
