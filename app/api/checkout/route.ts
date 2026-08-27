import { NextResponse } from 'next/server';
import { getDatabase, isDatabaseUnavailable } from '@/lib/database';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let body: { submissionId?: unknown };

  try {
    body = await request.json() as { submissionId?: unknown };
  } catch {
    return NextResponse.json({ error: 'Send a valid JSON body.' }, { status: 400 });
  }

  const submissionId = typeof body.submissionId === 'string' ? body.submissionId.trim() : '';
  if (!submissionId) {
    return NextResponse.json({ error: 'A submission id is required.' }, { status: 422 });
  }

  try {
    const database = await getDatabase();
    const submissions = await database`
      SELECT id, status, normalized_url, amount_due_cents, target_bid_cents
      FROM submissions
      WHERE id = ${submissionId}
      LIMIT 1
    ` as Array<{
      id: string;
      status: string;
      normalized_url: string;
      amount_due_cents: number;
      target_bid_cents: number;
    }>;
    const submission = submissions[0];

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found.' }, { status: 404 });
    }
    if (submission.status !== 'pending_payment') {
      return NextResponse.json({ error: 'This bid is no longer awaiting payment.' }, { status: 409 });
    }

    const latestPaid = await database`
      SELECT COALESCE(MAX(target_bid_cents), 0)::int AS total
      FROM submissions
      WHERE normalized_url = ${submission.normalized_url} AND status = 'paid'
    ` as Array<{ total: number }>;
    const previousBidCents = Number(latestPaid[0]?.total ?? 0);
    const amountDueCents = submission.target_bid_cents - previousBidCents;

    if (amountDueCents <= 0) {
      return NextResponse.json({ error: 'A newer paid bid already meets or exceeds this target. Create a higher bid.' }, { status: 409 });
    }

    if (amountDueCents !== submission.amount_due_cents) {
      await database`
        UPDATE submissions
        SET amount_due_cents = ${amountDueCents}
        WHERE id = ${submission.id}
      `;
    }

    return NextResponse.json({
      code: 'PAYMENT_PROVIDER_NOT_CONNECTED',
      message: 'The bid is safely queued. Connect a payment provider here and create checkout from the server-owned amount.',
      amountCents: amountDueCents,
      targetBidCents: submission.target_bid_cents,
      previousBidCents,
      currency: 'USD',
    }, { status: 503 });
  } catch (error) {
    console.error('Failed to prepare checkout', error);
    if (isDatabaseUnavailable(error)) {
      return NextResponse.json({ error: 'Bid storage is not connected yet.', code: 'DATABASE_NOT_CONNECTED' }, { status: 503 });
    }
    return NextResponse.json({ error: 'Checkout could not be prepared.' }, { status: 500 });
  }
}
