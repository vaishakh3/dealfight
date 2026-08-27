import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    code: 'PAYMENT_PROVIDER_NOT_CONNECTED',
    message: 'Verify the provider signature here, then mark the matching submission paid. Paid bids become the canonical source for leaderboard totals and future difference-only rebids.',
  }, { status: 503 });
}
