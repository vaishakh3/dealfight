import 'server-only';

import DodoPayments from 'dodopayments';

export type DodoEnvironment = 'test_mode' | 'live_mode';

type DodoConfig = {
  apiKey: string;
  webhookKey: string | undefined;
  productId: string;
  environment: DodoEnvironment;
};

export class PaymentProviderUnavailableError extends Error {
  constructor(message = 'Dodo Payments is not configured. Add the server-only payment credentials, then redeploy.') {
    super(message);
    this.name = 'PaymentProviderUnavailableError';
  }
}

let client: DodoPayments | null = null;
let clientFingerprint = '';

export function getDodoConfig(): DodoConfig {
  const apiKey = process.env.DODO_PAYMENTS_API_KEY;
  const webhookKey = process.env.DODO_PAYMENTS_WEBHOOK_KEY;
  const productId = process.env.DODO_PAYMENTS_PRODUCT_ID;
  const environment = process.env.DODO_PAYMENTS_ENVIRONMENT;

  if (!apiKey || !productId) {
    throw new PaymentProviderUnavailableError();
  }
  if (environment !== 'test_mode' && environment !== 'live_mode') {
    throw new PaymentProviderUnavailableError('Dodo Payments has an invalid environment setting.');
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
