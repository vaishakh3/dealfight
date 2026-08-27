import { NextResponse } from 'next/server';
import { getDatabase, isDatabaseUnavailable } from '@/lib/database';

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
    const database = await getDatabase();
    const id = crypto.randomUUID();
    await database`
      INSERT INTO engagement_events (id, offer_id, event_type)
      VALUES (${id}, ${offerId}, ${type})
    `;

    const result = await database`
      SELECT COUNT(*)::int AS count
      FROM engagement_events
      WHERE offer_id = ${offerId} AND event_type = ${type}
    ` as Array<{ count: number }>;

    return NextResponse.json({ ok: true, count: result[0]?.count ?? 0 });
  } catch (error) {
    console.error('Failed to save event', error);
    return NextResponse.json({ ok: false }, { status: isDatabaseUnavailable(error) ? 503 : 500 });
  }
}
