CREATE TABLE `engagement_events` (
	`id` text PRIMARY KEY NOT NULL,
	`offer_id` text NOT NULL,
	`event_type` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_engagement_offer_type` ON `engagement_events` (`offer_id`,`event_type`);--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`product_name` text NOT NULL,
	`product_url` text NOT NULL,
	`email` text NOT NULL,
	`tagline` text NOT NULL,
	`list_price_cents` integer NOT NULL,
	`fight_price_cents` integer NOT NULL,
	`discount_percent` integer NOT NULL,
	`coupon_code` text NOT NULL,
	`category` text NOT NULL,
	`status` text DEFAULT 'pending_payment' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_submissions_status_created` ON `submissions` (`status`,`created_at`);