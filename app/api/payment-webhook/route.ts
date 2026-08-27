import { NextResponse } from 'next/server';
import { getDatabase, isDatabaseUnavailable } from '@/lib/database';
import { getDodoPayments, isPaymentProviderUnavailable } from '@/lib/dodo-payments';

export const runtime = 'nodejs';

const submissionIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

    if (event.type !== 'payment.succeeded' && event.type !== 'refund.succeeded' && event.type !== 'refund.failed') {
      return NextResponse.json({ received: true, handled: false });
    }

    const database = await getDatabase();

    if (event.type === 'refund.succeeded' || event.type === 'refund.failed') {
      const refund = event.data;
      const refundStatus = event.type === 'refund.succeeded' ? 'succeeded' : 'failed';
      const { data: submission, error: submissionError } = await database
        .from('submissions')
        .select('id, status, review_status, email, dodo_payment_id, payment_received_minor, payment_currency')
        .eq('dodo_payment_id', refund.payment_id)
        .maybeSingle();

      if (submissionError) throw submissionError;
      if (!submission) {
        return NextResponse.json({ error: 'Refund payment is not linked to a Deal Fight submission.' }, { status: 404 });
      }
      if (!refund.refund_id || refund.customer.email.toLowerCase() !== submission.email.toLowerCase()) {
        return NextResponse.json({ error: 'Refund does not match the linked submission.' }, { status: 409 });
      }
      if (refund.amount != null && submission.payment_received_minor != null) {
        if (refund.amount > submission.payment_received_minor || refund.currency !== submission.payment_currency) {
          return NextResponse.json({ error: 'Refund amount or currency does not match the linked payment.' }, { status: 409 });
        }
      }

      const { data: existingRefund, error: existingRefundError } = await database
        .from('payment_refunds')
        .select('status, last_event_id')
        .eq('refund_id', refund.refund_id)
        .maybeSingle();

      if (existingRefundError) throw existingRefundError;
      if (existingRefund?.status === 'succeeded' && refundStatus === 'failed') {
        return NextResponse.json({ received: true, handled: true, outOfOrder: true });
      }

      if (refundStatus === 'succeeded' && !refund.is_partial && submission.status !== 'refunded') {
        if (submission.status !== 'paid') {
          return NextResponse.json({ error: 'The linked submission cannot accept this refund state.' }, { status: 409 });
        }

        const { data: refundedSubmission, error: refundUpdateError } = await database
          .from('submissions')
          .update({ status: 'refunded', review_status: 'rejected' })
          .eq('id', submission.id)
          .eq('status', 'paid')
          .select('id')
          .maybeSingle();

        if (refundUpdateError) throw refundUpdateError;
        if (!refundedSubmission) {
          return NextResponse.json({ error: 'Submission state changed before the refund could be recorded.' }, { status: 409 });
        }
      }

      const { error: refundAuditError } = await database
        .from('payment_refunds')
        .upsert({
          refund_id: refund.refund_id,
          submission_id: submission.id,
          payment_id: refund.payment_id,
          amount_minor: refund.amount ?? null,
          currency: refund.currency ?? null,
          is_partial: refund.is_partial,
          status: refundStatus,
          reason: refund.reason ?? null,
          provider_created_at: refund.created_at,
          last_event_id: webhookId,
          last_event_at: event.timestamp,
        }, { onConflict: 'refund_id' });

      if (refundAuditError) throw refundAuditError;
      return NextResponse.json({
        received: true,
        handled: true,
        duplicate: existingRefund?.last_event_id === webhookId,
      });
    }

    const payment = event.data;
    const rawSubmissionId = payment.metadata?.submission_id;
    const submissionId = typeof rawSubmissionId === 'string' ? rawSubmissionId : '';
    const expectedProductCart = payment.product_cart?.length === 1
      && payment.product_cart[0].product_id === config.productId
      && payment.product_cart[0].quantity === 1;

    if (!submissionIdPattern.test(submissionId) || !payment.checkout_session_id || !expectedProductCart || payment.is_update_payment_method || payment.subscription_id) {
      return NextResponse.json({ error: 'Payment is not linked to a Deal Fight checkout.' }, { status: 422 });
    }
    if ((payment.discounts?.length ?? 0) > 0) {
      return NextResponse.json({ error: 'Visibility bids cannot be paid with a checkout discount.' }, { status: 422 });
    }

    const { data: submission, error: submissionError } = await database
      .from('submissions')
      .select('id, status, email, target_bid_cents, amount_due_cents, dodo_checkout_session_id, dodo_payment_id')
      .eq('id', submissionId)
      .maybeSingle();

    if (submissionError) throw submissionError;
    if (!submission) {
      return NextResponse.json({ error: 'Linked submission was not found.' }, { status: 404 });
    }
    if (submission.dodo_checkout_session_id !== payment.checkout_session_id) {
      return NextResponse.json({ error: 'Checkout session does not match the linked submission.' }, { status: 409 });
    }
    if (payment.customer.email.toLowerCase() !== submission.email.toLowerCase()
      || String(payment.metadata?.target_bid_cents ?? '') !== String(submission.target_bid_cents)
      || String(payment.metadata?.amount_due_cents ?? '') !== String(submission.amount_due_cents)) {
      return NextResponse.json({ error: 'Payment metadata does not match the linked submission.' }, { status: 409 });
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
        payment_received_minor: payment.total_amount,
        payment_currency: payment.currency,
        settlement_amount_minor: payment.settlement_amount,
        settlement_currency: payment.settlement_currency,
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
    console.error('Failed to process Dodo payment or refund webhook', error);
    return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 500 });
  }
}
