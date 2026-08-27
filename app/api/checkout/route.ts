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
    SELECT id, status FROM submissions WHERE id = ?
  `).bind(submissionId).first<{ id: string; status: string }>();

  if (!submission) {
    return NextResponse.json({ error: 'Submission not found.' }, { status: 404 });
  }

  return NextResponse.json({
    code: 'PAYMENT_PROVIDER_NOT_CONNECTED',
    message: 'The entry is safely queued. Connect a payment provider in this endpoint to create the $49 checkout session.',
    amountCents: 4900,
    currency: 'USD',
  }, { status: 503 });
}
