import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

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

  const database = await getDatabase();
  const submission = await database.prepare(`
    SELECT id, status, normalized_url, amount_due_cents, target_bid_cents FROM submissions WHERE id = ?
  `).bind(submissionId).first<{
    id: string;
    status: string;
    normalized_url: string;
    amount_due_cents: number;
    target_bid_cents: number;
  }>();

  if (!submission) {
    return NextResponse.json({ error: 'Submission not found.' }, { status: 404 });
  }
  if (submission.status !== 'pending_payment') {
    return NextResponse.json({ error: 'This bid is no longer awaiting payment.' }, { status: 409 });
  }

  const latestPaid = await database.prepare(`
    SELECT COALESCE(MAX(target_bid_cents), 0) AS total
    FROM submissions
    WHERE normalized_url = ? AND status = 'paid'
  `).bind(submission.normalized_url).first<{ total: number }>();
  const previousBidCents = Number(latestPaid?.total ?? 0);
  const amountDueCents = submission.target_bid_cents - previousBidCents;

  if (amountDueCents <= 0) {
    return NextResponse.json({ error: 'A newer paid bid already meets or exceeds this target. Create a higher bid.' }, { status: 409 });
  }

  if (amountDueCents !== submission.amount_due_cents) {
    await database.prepare('UPDATE submissions SET amount_due_cents = ? WHERE id = ?')
      .bind(amountDueCents, submission.id)
      .run();
  }

  return NextResponse.json({
    code: 'PAYMENT_PROVIDER_NOT_CONNECTED',
    message: 'The bid is safely queued. Connect a payment provider here and create checkout from the server-owned amount.',
    amountCents: amountDueCents,
    targetBidCents: submission.target_bid_cents,
    previousBidCents,
    currency: 'USD',
  }, { status: 503 });
}
