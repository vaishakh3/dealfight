import { NextResponse } from 'next/server';
import { getDatabase, isDatabaseUnavailable } from '@/lib/database';
import { consumeRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const submissionIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const noStoreHeaders = { 'Cache-Control': 'private, no-store, max-age=0' };

export async function GET(request: Request) {
  const submissionId = new URL(request.url).searchParams.get('submission')?.trim() ?? '';
  if (!submissionIdPattern.test(submissionId)) {
    return NextResponse.json({ error: 'A valid submission id is required.' }, { status: 422, headers: noStoreHeaders });
  }

  try {
    const allowed = await consumeRateLimit(request, 'submission-status', 90, 60);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many status checks. Try again shortly.' },
        { status: 429, headers: { ...noStoreHeaders, 'Retry-After': '60' } },
      );
    }

    const database = await getDatabase();
    const { data: submission, error } = await database
      .from('submissions')
      .select('status, review_status, paid_at')
      .eq('id', submissionId)
      .maybeSingle();

    if (error) throw error;
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found.' }, { status: 404, headers: noStoreHeaders });
    }

    return NextResponse.json({
      status: submission.status,
      reviewStatus: submission.review_status,
      paymentConfirmed: submission.status === 'paid',
      paidAt: submission.paid_at,
    }, { headers: noStoreHeaders });
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      return NextResponse.json({ error: 'Bid storage is not connected.' }, { status: 503, headers: noStoreHeaders });
    }
    console.error('Failed to check submission status', error);
    return NextResponse.json({ error: 'Payment status could not be checked.' }, { status: 500, headers: noStoreHeaders });
  }
}
