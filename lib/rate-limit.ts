import 'server-only';

import { createHmac } from 'node:crypto';
import { DatabaseUnavailableError, getDatabase } from '@/lib/database';

function getClientAddress(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')
    ?? request.headers.get('x-real-ip')
    ?? 'unknown';

  return forwarded.split(',')[0].trim().slice(0, 128) || 'unknown';
}

export async function consumeRateLimit(
  request: Request,
  bucket: 'submissions' | 'checkout' | 'submission-status' | 'events',
  maxRequests: number,
  windowSeconds: number,
) {
  const secret = process.env.DEALFIGHT_DATABASE_SECRET;
  if (!secret) {
    throw new DatabaseUnavailableError();
  }

  const fingerprint = createHmac('sha256', secret)
    .update(getClientAddress(request))
    .digest('hex');

  const database = await getDatabase();
  const { data, error } = await database.rpc('consume_dealfight_rate_limit', {
    p_bucket: bucket,
    p_fingerprint: fingerprint,
    p_max_requests: maxRequests,
    p_window_seconds: windowSeconds,
  });

  if (error) throw error;
  return data === true;
}
