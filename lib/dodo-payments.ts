import 'server-only';

import DodoPayments from 'dodopayments';

export type DodoEnvironment = 'test_mode' | 'live_mode';

export class PaymentProviderUnavailableError extends Error {
  constructor() {
    super('Dodo Payments is not configured. Add the server-only payment credentials, then redeploy.');
    this.name = 'PaymentProviderUnavailableError';
  }
}

let client: DodoPayments | null = null;
let clientFingerprint = '';

export function getDodoConfig() {
  const apiKey = process.env.DODO_PAYMENTS_API_KEY;
  const webhookKey = process.env.DODO_PAYMENTS_WEBHOOK_KEY;
  const productId = process.env.DODO_PAYMENTS_PRODUCT_ID;
  const environment: DodoEnvironment = process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode'
    ? 'live_mode'
    : 'test_mode';

  if (!apiKey || !productId) {
    throw new PaymentProviderUnavailableError();
  }

  return { apiKey, webhookKey, productId, environment };
}

export function getDodoPayments() {
  const config = getDodoConfig();
  const fingerprint = `${config.environment}:${config.apiKey}:${config.webhookKey ?? ''}`;

  if (!client || clientFingerprint !== fingerprint) {
    client = new DodoPayments({
      bearerToken: config.apiKey,
      environment: config.environment,
      webhookKey: config.webhookKey,
    });
    clientFingerprint = fingerprint;
  }

  return { client, config };
}

export function isPaymentProviderUnavailable(error: unknown) {
  return error instanceof PaymentProviderUnavailableError;
}
