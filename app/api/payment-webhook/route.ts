import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    code: 'PAYMENT_PROVIDER_NOT_CONNECTED',
    message: 'Verify the provider signature here, then set the matching submission status to paid.',
  }, { status: 503 });
}
