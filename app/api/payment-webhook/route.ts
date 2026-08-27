import { NextResponse } from 'next/server';
import { getDatabase, isDatabaseUnavailable } from '@/lib/database';
import { getDodoPayments, isPaymentProviderUnavailable } from '@/lib/dodo-payments';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const rawBody = await request.text();
  const webhookId = request.headers.get('webhook-id');
  const webhookSignature = request.headers.get('webhook-signature');
  const webhookTimestamp = request.headers.get('webhook-timestamp');

  if (!webhookId || !webhookSignature || !webhookTimestamp) {
    return NextResponse.json({ error: 'Missing webhook signature headers.' }, { status: 400 });
  }

  try {
    const { client, config } = getDodoPayments();
    if (!config.webhookKey) {
      return NextResponse.json({ error: 'Webhook verification is not configured.' }, { status: 503 });
    }

    let event;
    try {
      event = client.webhooks.unwrap(rawBody, {
        headers: {
          'webhook-id': webhookId,
          'webhook-signature': webhookSignature,
          'webhook-timestamp': webhookTimestamp,
        },
        key: config.webhookKey,
      });
    } catch {
      return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 401 });
    }

    if (event.type !== 'payment.succeeded') {
      return NextResponse.json({ received: true, handled: false });
    }

    const payment = event.data;
    const rawSubmissionId = payment.metadata?.submission_id;
    const submissionId = typeof rawSubmissionId === 'string' ? rawSubmissionId : '';
    const hasDealFightProduct = payment.product_cart?.some((item) => item.product_id === config.productId) ?? false;

    if (!submissionId || !payment.checkout_session_id || !hasDealFightProduct) {
      return NextResponse.json({ error: 'Payment is not linked to a Deal Fight checkout.' }, { status: 422 });
    }

    const database = await getDatabase();
    const { data: submission, error: submissionError } = await database
      .from('submissions')
      .select('id, status, dodo_checkout_session_id, dodo_payment_id')
      .eq('id', submissionId)
      .maybeSingle();

    if (submissionError) throw submissionError;
    if (!submission) {
      return NextResponse.json({ error: 'Linked submission was not found.' }, { status: 404 });
    }
    if (submission.dodo_checkout_session_id !== payment.checkout_session_id) {
      return NextResponse.json({ error: 'Checkout session does not match the linked submission.' }, { status: 409 });
    }
    if (submission.status === 'paid' && submission.dodo_payment_id === payment.payment_id) {
      return NextResponse.json({ received: true, handled: true, duplicate: true });
    }
    if (submission.status !== 'pending_payment') {
      return NextResponse.json({ error: 'The linked submission cannot accept this payment state.' }, { status: 409 });
    }

    const { data: updated, error: updateError } = await database
      .from('submissions')
      .update({
        status: 'paid',
        dodo_payment_id: payment.payment_id,
        payment_received_cents: payment.total_amount,
        paid_at: event.timestamp,
        last_payment_event_id: webhookId,
      })
      .eq('id', submission.id)
      .eq('status', 'pending_payment')
      .eq('dodo_checkout_session_id', payment.checkout_session_id)
      .select('id')
      .maybeSingle();

    if (updateError) throw updateError;
    if (!updated) {
      return NextResponse.json({ error: 'Payment state changed before it could be recorded.' }, { status: 409 });
    }

    return NextResponse.json({ received: true, handled: true });
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      return NextResponse.json({ error: 'Bid storage is not connected.' }, { status: 503 });
    }
    if (isPaymentProviderUnavailable(error)) {
      return NextResponse.json({ error: 'Payment verification is not configured.' }, { status: 503 });
    }
    console.error('Failed to process Dodo payment webhook', error);
    return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 500 });
  }
}
