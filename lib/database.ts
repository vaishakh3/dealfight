import { env } from 'cloudflare:workers';

let schemaReady = false;

async function ensureSchema(database: D1Database) {
  if (schemaReady) return;

  await database.batch([
    database.prepare(`
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
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `),
    database.prepare(`
      CREATE TABLE IF NOT EXISTS engagement_events (
        id TEXT PRIMARY KEY NOT NULL,
        offer_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `),
    database.prepare(`
      CREATE INDEX IF NOT EXISTS idx_engagement_offer_type
      ON engagement_events(offer_id, event_type)
    `),
  ]);

  const tableInfo = await database.prepare('PRAGMA table_info(submissions)').all<{ name: string }>();
  const columnNames = new Set((tableInfo.results ?? []).map((column) => column.name));
  const additions: D1PreparedStatement[] = [];

  if (!columnNames.has('normalized_url')) {
    additions.push(database.prepare("ALTER TABLE submissions ADD COLUMN normalized_url TEXT NOT NULL DEFAULT ''"));
  }
  if (!columnNames.has('target_bid_cents')) {
    additions.push(database.prepare('ALTER TABLE submissions ADD COLUMN target_bid_cents INTEGER NOT NULL DEFAULT 0'));
  }
  if (!columnNames.has('amount_due_cents')) {
    additions.push(database.prepare('ALTER TABLE submissions ADD COLUMN amount_due_cents INTEGER NOT NULL DEFAULT 0'));
  }
  if (additions.length) await database.batch(additions);

  await database.batch([
    database.prepare(`
      CREATE INDEX IF NOT EXISTS idx_submissions_status_created
      ON submissions(status, created_at)
    `),
    database.prepare(`
      CREATE INDEX IF NOT EXISTS idx_submissions_url_status_bid
      ON submissions(normalized_url, status, target_bid_cents)
    `),
  ]);

  schemaReady = true;
}

export async function getDatabase() {
  const database = env.DB;

  if (!database) {
    throw new Error('The D1 database binding is unavailable.');
  }

  await ensureSchema(database);
  return database;
}
