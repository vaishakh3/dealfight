import { NextResponse } from 'next/server';
import { getDatabase, isDatabaseUnavailable } from '@/lib/database';
import { getDodoPayments, isPaymentProviderUnavailable } from '@/lib/dodo-payments';
import { consumeRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const submissionIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  let body: { submissionId?: unknown };

  try {
    body = await request.json() as { submissionId?: unknown };
  } catch {
    return NextResponse.json({ error: 'Send a valid JSON body.' }, { status: 400 });
  }

  const submissionId = typeof body.submissionId === 'string' ? body.submissionId.trim() : '';
  if (!submissionIdPattern.test(submissionId)) {
    return NextResponse.json({ error: 'A valid submission id is required.' }, { status: 422 });
  }

  try {
    const allowed = await consumeRateLimit(request, 'checkout', 20, 3600);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many checkout attempts. Try again in an hour.' },
        { status: 429, headers: { 'Retry-After': '3600' } },
      );
    }

    const database = await getDatabase();
    const { data: submission, error: submissionError } = await database
      .from('submissions')
      .select('id, status, normalized_url, email, product_name, amount_due_cents, target_bid_cents')
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

    if (amountDueCents < 500) {
      if (amountDueCents <= 0) {
        return NextResponse.json({ error: 'A newer paid bid already meets or exceeds this target. Create a higher bid.' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Bid increases have a $5 minimum. Raise your total visibility bid by at least $5.' }, { status: 409 });
    }

    if (amountDueCents !== submission.amount_due_cents) {
      const { error: updateError } = await database
        .from('submissions')
        .update({ amount_due_cents: amountDueCents })
        .eq('id', submission.id);

      if (updateError) throw updateError;
    }

    const { client, config } = getDodoPayments();
    const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const siteOrigin = configuredSiteUrl ? new URL(configuredSiteUrl).origin : new URL(request.url).origin;
    if (config.environment === 'live_mode' && !siteOrigin.startsWith('https://')) {
      throw new Error('Live checkout requires an HTTPS site URL.');
    }
    const returnUrl = new URL('/', siteOrigin);
    returnUrl.searchParams.set('checkout', 'return');
    returnUrl.searchParams.set('submission', submission.id);
    const cancelUrl = new URL('/', siteOrigin);
    cancelUrl.searchParams.set('checkout', 'cancelled');

    const checkout = await client.checkoutSessions.create({
      product_cart: [{
        product_id: config.productId,
        quantity: 1,
        amount: amountDueCents,
      }],
      customer: { email: submission.email },
      metadata: {
        submission_id: submission.id,
        target_bid_cents: String(submission.target_bid_cents),
        amount_due_cents: String(amountDueCents),
        listing_name: submission.product_name,
      },
      customization: {
        force_language: 'en',
        show_order_details: true,
        theme: 'light',
        theme_config: {
          radius: '0px',
          pay_button_text: 'Pay visibility bid',
          light: {
            bg_primary: '#f6f3e9',
            bg_secondary: '#fffef8',
            border_primary: '#10110f',
            border_secondary: '#cfcbc0',
            button_primary: '#10110f',
            button_primary_hover: '#bd2c0d',
            button_secondary: '#fffef8',
            button_secondary_hover: '#eaff9f',
            button_text_primary: '#ceff2e',
            button_text_secondary: '#10110f',
            input_focus_border: '#1958f0',
            text_primary: '#10110f',
            text_secondary: '#65665f',
            text_success: '#176b25',
            text_error: '#bd2c0d',
          },
        },
      },
      feature_flags: {
        allow_currency_selection: true,
        allow_customer_editing_email: false,
        allow_discount_code: false,
        allow_phone_number_collection: false,
        redirect_immediately: true,
      },
      return_url: returnUrl.toString(),
      cancel_url: cancelUrl.toString(),
      short_link: false,
    }, {
      idempotencyKey: `dealfight-${submission.id}-${amountDueCents}`,
    });

    if (!checkout.checkout_url) {
      throw new Error('Dodo Payments did not return a checkout URL.');
    }

    const { error: checkoutUpdateError } = await database
      .from('submissions')
      .update({ dodo_checkout_session_id: checkout.session_id })
      .eq('id', submission.id)
      .eq('status', 'pending_payment');

    if (checkoutUpdateError) throw checkoutUpdateError;

    return NextResponse.json({
      checkoutUrl: checkout.checkout_url,
      sessionId: checkout.session_id,
      amountCents: amountDueCents,
      targetBidCents: submission.target_bid_cents,
      previousBidCents,
      currency: 'USD',
      environment: config.environment,
    });
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      return NextResponse.json({ error: 'Bid storage is not connected yet.', code: 'DATABASE_NOT_CONNECTED' }, { status: 503 });
    }
    if (isPaymentProviderUnavailable(error)) {
      return NextResponse.json({ error: 'Secure checkout is being connected. Please try again shortly.', code: 'PAYMENT_PROVIDER_NOT_CONNECTED' }, { status: 503 });
    }
    console.error('Failed to prepare checkout', error);
    return NextResponse.json({ error: 'Checkout could not be prepared.' }, { status: 500 });
  }
}
