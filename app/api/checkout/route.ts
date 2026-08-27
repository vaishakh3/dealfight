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
    const { data: submission, error: submissionError } = await database
      .from('submissions')
      .select('id, status, normalized_url, amount_due_cents, target_bid_cents')
      .eq('id', submissionId)
      .maybeSingle();

    if (submissionError) throw submissionError;

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found.' }, { status: 404 });
    }
    if (submission.status !== 'pending_payment') {
      return NextResponse.json({ error: 'This bid is no longer awaiting payment.' }, { status: 409 });
    }

    const { data: latestPaid, error: latestPaidError } = await database
      .from('submissions')
      .select('target_bid_cents')
      .eq('normalized_url', submission.normalized_url)
      .eq('status', 'paid')
      .order('target_bid_cents', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestPaidError) throw latestPaidError;

    const previousBidCents = Number(latestPaid?.target_bid_cents ?? 0);
    const amountDueCents = submission.target_bid_cents - previousBidCents;

    if (amountDueCents <= 0) {
      return NextResponse.json({ error: 'A newer paid bid already meets or exceeds this target. Create a higher bid.' }, { status: 409 });
    }

    if (amountDueCents !== submission.amount_due_cents) {
      const { error: updateError } = await database
        .from('submissions')
        .update({ amount_due_cents: amountDueCents })
        .eq('id', submission.id);

      if (updateError) throw updateError;
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
    if (isDatabaseUnavailable(error)) {
      return NextResponse.json({ error: 'Bid storage is not connected yet.', code: 'DATABASE_NOT_CONNECTED' }, { status: 503 });
    }
    console.error('Failed to prepare checkout', error);
    return NextResponse.json({ error: 'Checkout could not be prepared.' }, { status: 500 });
  }
}
