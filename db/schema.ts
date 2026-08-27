import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const submissions = sqliteTable(
  'submissions',
  {
    id: text('id').primaryKey(),
    productName: text('product_name').notNull(),
    productUrl: text('product_url').notNull(),
    normalizedUrl: text('normalized_url').notNull().default(''),
    email: text('email').notNull(),
    tagline: text('tagline').notNull(),
    listPriceCents: integer('list_price_cents').notNull(),
    fightPriceCents: integer('fight_price_cents').notNull(),
    discountPercent: integer('discount_percent').notNull(),
    couponCode: text('coupon_code').notNull(),
    category: text('category').notNull(),
    targetBidCents: integer('target_bid_cents').notNull().default(0),
    amountDueCents: integer('amount_due_cents').notNull().default(0),
    status: text('status').notNull().default('pending_payment'),
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index('idx_submissions_status_created').on(table.status, table.createdAt),
    index('idx_submissions_url_status_bid').on(table.normalizedUrl, table.status, table.targetBidCents),
  ],
);

export const engagementEvents = sqliteTable(
  'engagement_events',
  {
    id: text('id').primaryKey(),
    offerId: text('offer_id').notNull(),
    eventType: text('event_type').notNull(),
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index('idx_engagement_offer_type').on(table.offerId, table.eventType)],
);
