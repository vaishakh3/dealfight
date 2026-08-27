import { neon } from '@neondatabase/serverless';

type SqlClient = ReturnType<typeof neon>;

export class DatabaseUnavailableError extends Error {
  constructor() {
    super('Database storage is not connected. Add a Neon database to this Vercel project, then redeploy.');
    this.name = 'DatabaseUnavailableError';
  }
}

let client: SqlClient | null = null;
let schemaPromise: Promise<void> | null = null;

async function ensureSchema(database: SqlClient) {
  await database`
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY NOT NULL,
      product_name TEXT NOT NULL,
      product_url TEXT NOT NULL,
      normalized_url TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL,
      tagline TEXT NOT NULL,
      list_price_cents INTEGER NOT NULL,
      fight_price_cents INTEGER NOT NULL,
      discount_percent INTEGER NOT NULL,
      coupon_code TEXT NOT NULL,
      category TEXT NOT NULL,
      target_bid_cents INTEGER NOT NULL DEFAULT 0,
      amount_due_cents INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending_payment',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await database`
    CREATE TABLE IF NOT EXISTS engagement_events (
      id TEXT PRIMARY KEY NOT NULL,
      offer_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await Promise.all([
    database`
      CREATE INDEX IF NOT EXISTS idx_submissions_status_created
      ON submissions(status, created_at)
    `,
    database`
      CREATE INDEX IF NOT EXISTS idx_submissions_url_status_bid
      ON submissions(normalized_url, status, target_bid_cents)
    `,
    database`
      CREATE INDEX IF NOT EXISTS idx_engagement_offer_type
      ON engagement_events(offer_id, event_type)
    `,
  ]);
}

export async function getDatabase() {
  const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

  if (!connectionString) throw new DatabaseUnavailableError();
  if (!client) client = neon(connectionString);

  if (!schemaPromise) {
    schemaPromise = ensureSchema(client).catch((error) => {
      schemaPromise = null;
      throw error;
    });
  }

  await schemaPromise;
  return client;
}

export function isDatabaseUnavailable(error: unknown) {
  return error instanceof DatabaseUnavailableError;
}
